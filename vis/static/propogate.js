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
        console.log("Marker ",this.pointID);
    })
    marker.setMap(map);
}

function transcend(loc){
    bl = new google.maps.LatLng(loc.lat()-0.0005,loc.lng()-0.0005);
    tr = new google.maps.LatLng(loc.lat()+0.0005,loc.lng()+0.0005);

    showPartialMarkers(bl,tr)
    
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
function junctionClicked(junction) {
    console.log(typeof ALPHA)
    if(!ALPHA){
        ALPHA = junction.junctionID;
        flightPath.setMap(null);
    }
    else if(!BETA){
        BETA = junction.junctionID;

        $.get("/summon/?alpha="+ALPHA+"&beta="+BETA+"&access=3").success(function(data){
            console.log("Data ",data)
            locarray=[];
            for(var loc in data.array){
                locarray.push(JUNCTIONS[data.array[loc]].center)
            }
            flightPath = new google.maps.Polyline({
                path: locarray,
                geodesic: true,
                // strokeColor: '#F27233',
                // strokeColor: "#"+((1<<24)*Math.random()|0).toString(16),
                strokeColor: '#AABBCC',
                strokeOpacity: 1.0,
                strokeWeight: 3,
                title: 'name',
                access: 0,
            });
            flightPath.setMap(map);
            ALPHA=null;
            BETA=null;
        });
    }
}