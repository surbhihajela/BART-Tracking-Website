from flask import Flask, request,jsonify, render_template
import requests
import json

app = Flask(__name__)
app.debug = True

BARTAPIS = {'STATIONS':'http://api.bart.gov/api/stn.aspx?cmd=stns&key=ZDMP-PG6A-97YT-DWE9&json=y',
            'STATIONDETAIL':'http://api.bart.gov/api/stn.aspx?cmd=stninfo&orig={}&key=ZDMP-PG6A-97YT-DWE9&json=y',
            'TRIPS':'http://api.bart.gov/api/sched.aspx?cmd=depart&orig={}&dest={}&date=now&key=ZDMP-PG6A-97YT-DWE9&b=0&a=4&l=1&json=y',
            }

@app.route('/')
def hello():
    page_name = "Home"
    return render_template('%s.html' % page_name)
    # return "Hey, What's up!!"

@app.route('/stations')
def getStations():
    resp = {}
    try:
        response = requests.get(BARTAPIS['STATIONS'])
        json_resp = json.loads(response.text)
        resp = {'data':json_resp['root']['stations'], 'success':True}
    except Exception:
        resp = {'data':[], 'success':False}
    return jsonify(resp)

@app.route('/station')
def getStationDetails():
    resp = {}
    try:
        source = request.args.get('source')
        if not source:
            return json.dumps({'success':False, 'error':"No source found"}), 400,{'ContentType':'application/json'}
            # raise ValueError("No source found")
        response = requests.get(BARTAPIS['STATIONDETAIL'].format(source))
        json_resp = json.loads(response.text)
        resp = {'data':json_resp['root']['stations']['station'], 'success':True}
    except Exception:
        resp = {'data':[], 'success':False}
    return jsonify(resp)

@app.route('/trips')
def trips():
    resp = {}
    try:
        source = request.args.get('source')
        dest = request.args.get('dest')
        if not source or not dest:
            return json.dumps({'success':False, 'error':"No source/dest found"}), 400,{'ContentType':'application/json'}
            # raise ValueError("No source/dest found")
        response = requests.get(BARTAPIS['TRIPS'].format(source, dest))
        json_resp = json.loads(response.text)
        resp = {'data':json_resp['root']['schedule'], 'success':True}
    except Exception:
        resp = {'data':[], 'success':False}
    return jsonify(resp)

if __name__ == '__main__':
    app.run()
