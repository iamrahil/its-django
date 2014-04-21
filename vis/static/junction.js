debug={};
STATE = "loading";
PATHS = [];
MARKERS = [];
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
        showAllMarkers(path);
        STATE = "marking";
    }
    else if(STATE == "marking"){
        return;
    }
    else if(STATE == "joining"){
        console.log("JUNCTION ",path)
    }
}

function markerClicked(marker,event){
    if(STATE == "loading"){
        return;
    }
    else if(STATE == "marking"){
        console.log("The junction is",this);
        STATE="joining";
    }
    else if(STATE == "joining"){
        return;
    }
}

function placeMarker(location,color,id){
    // var marker = new google.maps.Marker({position:location,map:map});
    col = {"":"","green":"","red":"red"};
    var marker = new google.maps.Marker(
        {
            icon: STATIC_URL + "mark"+col[color]+".png",
            draggable:true,
            position:location
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
    console.log(path);
    var id = path.polylineID;
    $.get("/api/v1/point/?format=json&path="+id).success(function(data){
        var list = data.objects;
        for(i in list){
            var loc = new google.maps.LatLng(list[i].latitude,list[i].longitude);
            placeMarker(loc,"green",list[i].id);
        }
    })
    /*var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    var tl,tr,bl,br;    //TopLeft,...,BottomRight bounding box
    $.get("/api/v1/point/?format=json&location__lte="+lng-0.001+","+lat+0.0001).success(function(data){
        tl = data.objects;
        for(i in  tl){
        }
    })*/
    
}
//Click Handler on marker to select as junction
//
//Click Handler on all paths to select intersecting paths
//19+-0.0001 72+-0.001