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

col = {0:"#FF0000",1:"#AA0000",2:"#00FF00",3:"#0000FF"}
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
            // strokeColor: '#F27233',
            // strokeColor: "#"+((1<<24)*Math.random()|0).toString(16),
            strokeColor: col[access],
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
			console.log("Why did you click?");
			$("#info-number").html(this.polylineID);
			$("#info-name").html(this.title);
			$("#info-access").html(this.access);

		})
        flightPath.setMap(map);
    });
}
path = window.location.hash.split("#")[1];
if(path == 'all' || path==""){
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
else
    drawPath(path,"FAIL");
//TODO: Add onHashChange
