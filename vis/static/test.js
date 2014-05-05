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
        transcend(event.latLng);
    });
}
$(document).ready(function(){

    google.maps.event.addDomListener(window, 'load', initialize);  
})

function haversine(lt1,lng1,lt2,lng2){
    var R = 6373.0;
    var lat1 = lt1*Math.PI/180;
    var lon1 = lng1*Math.PI/180;
    var lat2 = lt2*Math.PI/180; 
    var lon2 = lng2*Math.PI/180;

    var dLon = lon2-lon1;  
    var dLat = lat2-lat1;
    console.log(dLon,dLat)  
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);  
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c*1000;
    return d; 
}

function placeMarker(location,color,id){
    // var marker = new google.maps.Marker({position:location,map:map});
    col = {"":"","green":"","red":"red"};
    var marker = new google.maps.Marker(
        {
            // icon: STATIC_URL + "mark"+col[color]+".png",
            draggable:false,
            position:location,
            pointID: id
        }
    );
    google.maps.event.addListener(marker,"click", function(event){
        console.log("Marker ",this.pointID);
    })
    marker.setMap(map);
    return marker;
}
AP=null;
BP=null;
function transcend(loc){
    // var bl = new google.maps.LatLng(loc.lat()-0.0005,loc.lng()-0.0005);
    // var tr = new google.maps.LatLng(loc.lat()+0.0005,loc.lng()+0.0005);
    // showPartialMarkers(bl,tr)
    if(!AP){
        AP=placeMarker(loc,"red",1);
    }
    else if(!BP){
        BP=placeMarker(loc,"red",2);
        $.get("/etch?from_lat="+AP.position.k+"&from_lng="+AP.position.A+"&to_lat="+BP.position.k+"&to_lng="+BP.position.A+"&access="+3)
         .success(function(data){
            console.log(data);
             for(var seg in data.details){
                drawPath(data.details[seg].path,data.details[seg].points,data.details[seg].length)
            }
            AP=null;
            BP=null;
         })
    }

}


function showPartialMarkers(bottomLeft,topRight){
    var url="/api/v1/point/?format=json&latitude__gte="+bottomLeft.lat()+"&longitude__gte="+bottomLeft.lng()+"&latitude__lte="+topRight.lat()+"&longitude__lte="+topRight.lng();
    $.get(url).success(function(data){
        var list=data.objects;
        console.log(url)
        for(i in list){
            var loc = new google.maps.LatLng(list[i].latitude,list[i].longitude);
            placeMarker(loc,"green",list[i].id);   
        }
    });
}
JUNCTIONS={};
$.get("/api/v1/junction/?format=json").success(function(data){
    var junctions = data.objects;
    for(i in junctions){
        var junction = new google.maps.Circle({
            strokeWeight: 0,
            fillColor: '#FF0000',
            fillOpacity: 0.33,
            center: new google.maps.LatLng(junctions[i].latitude,junctions[i].longitude),
            radius: 10,
            clickable: true,
            junctionID: junctions[i].id,
        })
        google.maps.event.addListener(junction,'click',function(event){
           junctionClicked(this);
        })
        JUNCTIONS[junction.junctionID]=junction;
        junction.setMap(map);
    }
});

ALPHA=null;
BETA=null;
flights=[];

function junctionClicked(junction) {
    if(!ALPHA){
        ALPHA = junction.junctionID;
    }
    else if(!BETA){
        BETA = junction.junctionID;

        $.get("/summon/?alpha="+ALPHA+"&beta="+BETA+"&access=3").success(function(data){
            for(var loc in data.array){
                //DRAW JUNCTIONS
            }
            for(var seg in data.details){
                drawPath(data.details[seg].path,data.details[seg].points,data.details[seg].length)
            }
            ALPHA=null;
            BETA=null;
        });
    }
}

function drawPath(path,points,length){

    var locarray=[];
    for(p in points){
        var loc = new google.maps.LatLng(points[p]['k'],points[p]['A']);
        locarray.push(loc);
    }
    var flightPath = new google.maps.Polyline({
        path: locarray,
        geodesic: true,

        strokeColor: '#AABBCC',
        strokeOpacity: 1.0,
        strokeWeight: 3,

        polylineID: path,
        length: length,
    });
    flights.push(flightPath);
    flightPath.setMap(map);
}