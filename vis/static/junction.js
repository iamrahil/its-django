debug={};
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
        var start = new google.maps.LatLng(list[0].location.split(",")[1],list[0].location.split(",")[0]);
        var end = new google.maps.LatLng(list[1].location.split(",")[1],list[1].location.split(",")[0]);
        locarray[0]=start;
        for(i=2;i<resp.meta.total_count;i++){
            locarray[i-1] = new google.maps.LatLng(list[i].location.split(",")[1],list[i].location.split(",")[0]);
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
            showAllMarkers(this);
            debug=this;
        })
        flightPath.setMap(map);
    });
}

//Get All Paths
//Draw Each Path
function init(){
    $.get("/api/v1/path/?format=json").success(function(data){
        var paths = data.objects;
        for(i in paths){
            var id = paths[i].id;
            var name = paths[i].name;
            var access = paths[i].access;
            console.log("Drawing ",name);
            drawPath(id,name,access);
        }
    })
}
init();
//Click Handler to show all markers
function showAllMarkers(path){
    console.log(path);
}
//Click Handler on marker to select as junction
//Click Handler on all paths to select intersecting paths