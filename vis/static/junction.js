debug={};
STATE = "loading";
PATHS = [];
MARKERS = [];
OUTPUT = {
    "junction":{},
    "points":[],
    "paths":[]
}
OUTPUT_FINAL=[];

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
}
$(document).ready(function(){

    google.maps.event.addDomListener(window, 'load', initialize);  
})

function drawPath(id,name,access){
    var name = name || "fail";
    var access = access || 0;
    var resp={};
    var locarray = [];
    $.get("/api/v1/point/?format=json&path="+id).success(function(data){
        resp=data
        var list = resp.objects;
        var start = new google.maps.LatLng(list[0].latitude,list[0].longitude);
        var end = new google.maps.LatLng(list[1].latitude,list[1].longitude);
        locarray[0]=start;
        for(i=2;i<resp.meta.total_count;i++){
            locarray[i-1] = new google.maps.LatLng(list[i].latitude,list[i].longitude);
        }
        locarray[i-1] = end;
        var flightPath = new google.maps.Polyline({
            path: locarray,
            geodesic: true,
            strokeColor: "#"+((1<<24)*Math.random()|0).toString(16),
            strokeOpacity: 1.0,
            strokeWeight: 3,
            polylineID: id,
            title: name,
            access: access,
        });
        google.maps.event.addListener(flightPath,'mouseover',function(event){
            this.setOptions({strokeWeight:5});
        })
        google.maps.event.addListener(flightPath,'mouseout',function(event){
            this.setOptions({strokeWeight:3});
        })
        google.maps.event.addListener(flightPath,'click',function(event){
            //Path Clicked
            pathClicked(this,event)
        })
        PATHS.push(flightPath);
        flightPath.setMap(map);
    });
}


//Get All Paths, Draw Each Path
function init(){
    $.get("/api/v1/path/?format=json").success(function(data){
        var paths = data.objects;
        for(i in paths){
            var id = paths[i].id;
            var name = paths[i].name;
            var access = paths[i].access;
            //console.log("Drawing ",name);
            drawPath(id,name,access);
        }
    })
}
init();

//DIRTY WORK
function pathClicked(path,event){
    if(STATE == "loading"){
        OUTPUT["paths"].push(path.polylineID);
        showAllMarkers(path);
        STATE = "marking";
    }
    else if(STATE == "marking"){
        return;
    }
    else if(STATE == "joining"){
        // console.log("JUNCTION ",path)
        path.setOptions({strokeWeight:7});
        clearMarkers();
        showPartialMarkers(path,bl,tr);
        OUTPUT["paths"].push(path.polylineID);
    }
}

function markerClicked(marker,event){
    if(STATE == "loading"){
        return;
    }
    else if(STATE == "marking"){
        console.log("The junction is",marker);
        map.setOptions({center:marker.position, zoom:21})
        junction = marker;
        OUTPUT["junction"] = marker.position;
        OUTPUT["points"].push(marker.pointID);
        drawJunction(marker);
        STATE="joining";
    }
    else if(STATE == "joining"){
        marker.setOptions({icon: STATIC_URL + "markblue.png"});
        OUTPUT["points"].push(marker.pointID);
    }
}

function placeMarker(location,color,id){
    // var marker = new google.maps.Marker({position:location,map:map});
    col = {"":"","green":"","red":"red"};
    var marker = new google.maps.Marker(
        {
            icon: STATIC_URL + "mark"+col[color]+".png",
            draggable:false,
            position:location,
            pointID: id
        }
    );
    google.maps.event.addListener(marker,"click", function(event){
        markerClicked(this,event);
    })
    marker.setMap(map);
    MARKERS.push(marker);
}
//Click Handler to show all markers

function showAllMarkers(path,event){
    var id = path.polylineID;
    $.get("/api/v1/point/?format=json&path="+id).success(function(data){
        var list = data.objects;
        for(i in list){
            var loc = new google.maps.LatLng(list[i].latitude,list[i].longitude);
            placeMarker(loc,"green",list[i].id);
        }
    })
    
}

function showPartialMarkers(path,bottomLeft,topRight){
    var id = path.polylineID;
    $.get("/api/v1/point/?format=json&latitude__gte="+bottomLeft.lat()+"&longitude__gte="+bottomLeft.lng()+"&latitude__lte="+topRight.lat()+"&longitude__lte="+topRight.lng()+"&path="+id).success(function(data){
        var list=data.objects;
        for(i in list){
            var loc = new google.maps.LatLng(list[i].latitude,list[i].longitude);
            placeMarker(loc,"green",list[i].id);   
        }
    });
}


function clearMarkers(){
    for(i in MARKERS){
        MARKERS[i].setMap(null);
    }
    MARKERS=[];
}

function drawJunction(marker){
    var url = STATIC_URL + "mark"+"blue"+".png";
    debug = marker;
    marker.setOptions({icon: url});
    var loc = marker.position;
    bl = new google.maps.LatLng(loc.lat()-0.00005,loc.lng()-0.00007);
    tr = new google.maps.LatLng(loc.lat()+0.00005,loc.lng()+0.00007);
    rectangle = new google.maps.Rectangle({
        clickable: false,
        strokeColor: '#DB3300',
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: "#00DD00",
        fillOpacity: 0.1,
        bounds: new google.maps.LatLngBounds(bl,tr)
    });
    rectangle.setMap(map);
}
//Click Handler on marker to select as junction
//
//Click Handler on all paths to select intersecting paths
function next(){
    OUTPUT_FINAL.push(OUTPUT);
    OUTPUT = {
    "junction":{},
    "points":[],
    "paths":[]
    }
    STATE="loading";
    clearMarkers();
    MARKERS=[];
    rectangle.setOptions({fillOpacity:0.8});
}

$("#submit").submit(function(event){
    //TODO: make this proper
        document.forms[0].list.value = JSON.stringify(OUTPUT_FINAL);
})
//TODO: Make it user friendly