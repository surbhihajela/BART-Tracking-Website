
    //Global Variables Declartion
    var source_abr = null;
    var destination_abr = null;
    var source_latitude = null;
    var source_longitude = null;
    var destination_latitude = null;
    var destination_longitude = null;
    var directionsService = null;
    var directionsDisplay = null;
    var countDownDate_temp = null;
    var x = null;
    var trip_refresh = null;

    //Stations list Starts
    var station_list_url = {
        "async": true,
        "crossDomain": true,
        "url": "/stations",
        "method": "GET"
    }

    $.ajax(station_list_url).done(function (response) {
        $.each(response.data.station, function (index, element) {
            $('#arr').append('<option value="' + element.abbr + '">' + element.name + '</option>');
            $('#dep').append('<option value="' + element.abbr + '">' + element.name + '</option>');
        });
        $('#arr').change(function () {
            source_abr = document.getElementById("arr").value;
            // $('#msg1').text(this.options[this.selectedIndex].text + source_abr);
            getLocationSource();
            if (destination_abr != null && source_abr != destination_abr) {
                $('#msg2').html("");
                getTrips();
                getLocationDestination();
            }
            if (source_abr == destination_abr) {
                $('#demo').html("");
                $('#trip_header').html("");
                $('#trip_data').html("");
                $('#msg2').html("");
                $('#msg2').append('<p style="font-size:20px;color: red">Please enter different source and Destination</p>');
                initMap();
            }
        });
        $('#dep').change(function () {
            destination_abr = document.getElementById("dep").value;
            if (source_abr != destination_abr) {
                $('#msg2').html("");
                getTrips();
                getLocationDestination();
            }
            else {
                $('#demo').html("");
                $('#trip_header').html("");
                $('#trip_data').html("");
                $('#msg2').html("");
                $('#msg2').append('<p style="font-size:20px;color: red">Please enter different source and Destination</p>');
                getDestinationStationInfo();
                initMap();
            }
        });
    });

    function getLocationSource() {
        var station_corinates_url = {
            "async": true,
            "crossDomain": true,
            "url": "/station?source=" + source_abr,
            "method": "GET"
        }
        $.ajax(station_corinates_url).done(function (response) {
            console.log(response);
            source_latitude = response.data.gtfs_latitude;
            source_longitude = response.data.gtfs_longitude;
            $('#statinfo').html("");
            $('#stathead').html("");
            $('#stathead').append('<u>Source Station Information</u>')
            $('#statinfo').append('<p> <u>Name</u>:' + response.data.name + '</p><p><u>Address</u>:' + response.data.address + '<p><u>Platform Info</u>:' + response.data.platform_info + '</p>');
        });
    }

    function getLocationDestination() {
        var station_corinates_url = {
            "async": true,
            "crossDomain": true,
            "url": "/station?source=" + destination_abr,
            "method": "GET"
        }
        $.ajax(station_corinates_url).done(function (response) {
            destination_latitude = response.data.gtfs_latitude;
            destination_longitude = response.data.gtfs_longitude;
            getDestinationStationInfo();
            //Direction Code Starts
            var start = { lat: +source_latitude, lng: +source_longitude };
            var end = { lat: +destination_latitude, lng: +destination_longitude };
            directionsService.route({
                origin: start,
                destination: end,
                travelMode: 'TRANSIT'
            }, function (response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
            //Direction Code Ends
        });
    }
    //Trip Logic starts
    function getDestinationStationInfo() {
        var station_corinates_url = {
            "async": true,
            "crossDomain": true,
            "url": "/station?source=" + destination_abr,
            "method": "GET"
        }
        $.ajax(station_corinates_url).done(function (response) {
            $('#statinfodest').html("");
            $('#statheaddest').html("");
            $('#statheaddest').append('<u>Destination Station Information</u>')
            $('#statinfodest').append('<p> <u>Name</u>:' + response.data.name + '</p><p><u>Address</u>:' + response.data.address + '<p><u>Platform Info</u>:' + response.data.platform_info + '</p>');
        });
    }
    function getTrips() {
        clearInterval(trip_refresh);
        trip_refresh= setInterval("getTrips();", 30000);
        countDownDate_temp = null;
        clearInterval(x);
        var trip_url = {
            "async": true,
            "crossDomain": true,
            "url": "/trips?source=" + source_abr + "&dest=" + destination_abr,
            "method": "GET"
        }
        $.ajax(trip_url).done(function (response) {
            countDownDate_temp = response.data.request.trip[0]['@origTimeDate'] + " " + response.data.request.trip[0]['@origTimeMin'];
            $('#demo').html("");
            $('#trip_header').html("");
            $('#trip_data').html("");
            $('#trip_header').append('<tr><th>Dest. Date</th><th>Dest Time</th><th>Orig Date</th><th>Orig Time</th><th>Fare</th>');
            $.each(response.data.request.trip, function (index, element) {
                $('#trip_data').append('<tr><td>' + element['@destTimeDate'] + '</td><td>' + element['@destTimeMin'] + '</td><td>' + element['@origTimeDate'] + '</td><td>' + element['@origTimeMin'] + '</td><td>' + element['@fare'] + '</td></tr>');
            });

            var countDownDate = new Date(countDownDate_temp).getTime();
            // Update the count down every 1 second
            x = setInterval(function () {
                // Get todays date and time
                var now = new Date().getTime();
                // Find the distance between now and the count down date
                var distance = countDownDate - now;
                // Time calculations for days, hours, minutes and seconds
                var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                // Output the result in an element with id="demo"
                if (source_abr != destination_abr) {
                    document.getElementById("demo").innerHTML = "Countdown to next train: " + hours + "h " + minutes + "m " + seconds + "s ";
                    // If the count down is over, write some text
                    if (distance < 0) {
                        clearInterval(x);
                        document.getElementById("demo").innerHTML = "Train Departing!!!";
                    }
                }
            }, 1000);
        });
    }

    //Visit count code starts
    function DisplayInfo() {
        var visit;
        if (!(visit = localStorage.getItem("_visit")))
            visit = 0;
        visit++;
        localStorage.setItem("_visit", visit);
        visit = localStorage.getItem("_visit");
        var message;
        if (visit == 1)
            message = "Welcome to my page!";
        if (visit >= 2)
            message = "You are back!";
        $('#visit_msg').append(message + "\n" + "You visited this page " + visit + " time(s).");
    }
    window.onload = DisplayInfo
    //number of visits code ends
    function initMap() {
        directionsService = new google.maps.DirectionsService;
        directionsDisplay = new google.maps.DirectionsRenderer;
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: { lat: 37.7749, lng: -122.4194 }
        });
        directionsDisplay.setMap(map);
    }
