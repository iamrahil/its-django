map = {};
maplist = [];
markers=[];
function loclist() {
    var loc=[];
    for(i in markers){
        loc[i]=markers[i].position;
    }
    return loc;
}
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
        placeMarker(event.latLng);
    });
}
flightPath = new google.maps.Polyline({
    path: loclist(),
    geodesic: true,
    strokeColor: '#F27233',
    strokeOpacity: 1.0,
    strokeWeight: 3
});

function placeMarker(location){
    console.log(location)
    // var marker = new google.maps.Marker({position:location,map:map});
    var marker = new google.maps.Marker(
        {
            icon: STATIC_URL + "mark.png",
            draggable:true,
            position:location
        }
    );
    markers.push(marker);
    marker.setMap(map);
    maplist.push({
        'latitude':location.lat(),
        'longitude':location.lng()
    });
    document.forms[0].list.value = document.forms[0].list.value + ""+ location.lat() + "," + location.lng()+",";
    // loclist.push(location);
    flightPath.setPath(loclist());
    flightPath.setMap(map);
    google.maps.event.addListener(marker,"position_changed", function(event){
        flightPath.setPath(loclist())
    })
    // console.log(marker.getPosition());
}

$(document).ready(function(){

    google.maps.event.addDomListener(window, 'load', initialize);
    if (window.location.hash!=""){
        var id = window.location.hash.split("#")[1];
        drawPath(id);
    }
function drawPath(id){
    var resp={};
    $.get("/api/v1/point/?format=json&path="+id).success(function(data){
        resp=data
        var list = resp.objects;
        var start = new google.maps.LatLng(list[0].latitude,list[0].longitude);
        placeMarker(start);
        var end = new google.maps.LatLng(list[1].latitude,list[1].longitude);
        for(i=2;i<resp.meta.total_count;i++){
            var loc = new google.maps.LatLng(list[i].latitude,list[i].longitude);
            placeMarker(loc); 
        }
        placeMarker(end);
        $.get("/api/v1/path/"+id+"/?format=json").success(function(data){
            document.forms[0].id.value=data.id;
            document.forms[0].name.value=data.name;
            document.forms[0].access.value=data.access;
        })

    });
}
    
})
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});
function assmilate() {
    $.ajax({
        method:"post",
        url:"/join",
        data: maplist
    })
}

$("#submit").submit(function(event){
    //TODO: make this proper
    if(document.forms[0].list.value=='')
        alert("please insert name of path");
    if(document.forms[0].access.value=='')
        alert("please insert access level of path")
    // for(i in markers){
        document.forms[0].list.value = JSON.stringify(loclist());
    // }
    console.log(document.forms[0].list.value);
    // return false;
})