function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(19.13285,72.915317),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        panControl: false,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        }
    };
    map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);
    google.maps.event.addListener(map, 'click', function(event) {
        console.log(event.latLng)
        transcend(event.latLng);
    });
}
$(document).ready(function(){

    google.maps.event.addDomListener(window, 'load', initialize);  
})

function placeMarker(location,color){
    // var marker = new google.maps.Marker({position:location,map:map});
    col = {"green":"","red":"red"};
    var marker = new google.maps.Marker(
        {
            icon: STATIC_URL + "mark"+col[color]+".png",
            draggable:true,
            position:location
        }
    );
marker.setMap(map);
}

function transcend(latlng){
    lte = {};
    gte = {};
    var url = "/api/v1/point/?format=json&location__lte="+latlng.lng()+","+latlng.lat();
    console.log("URL IS",url);
    $.get(url).success(function(data){
        lte = data.objects;
        console.log(lte);
        for(i in lte){
            var loc = new google.maps.LatLng(lte[i].location.split(",")[1],lte[i].location.split(",")[0]);
            placeMarker(loc,"green");
        }
    });
    $.get("/api/v1/point/?format=json&location__gte="+latlng.lng()+","+latlng.lat()).success(function(data){
        gte = data.objects;
        for(i in gte){
            var loc = new google.maps.LatLng(gte[i].location.split(",")[1],gte[i].location.split(",")[0]);
            placeMarker(loc,"red");
        }

    });
}
$.get("/api/v1/point/?format=json&location__lte=72.9089366645,19.1248606109").success(function(data){list=data})