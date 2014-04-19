from django.shortcuts import render
from django.core.context_processors import csrf
from django.shortcuts import render_to_response
from vis.models import Path,Point
import json
# Create your views here.
def login(request):
	c={};
	c.update(csrf(request))
	return render_to_response('index.html',c);

def preview(request):
	c={};
	c.update(csrf(request))
	return render_to_response('show.html',c);

def assmilate(request):
	if request.POST:
		# import pdb;pdb.set_trace();
		request_string = request.POST.get("list");
		array = json.loads(request_string);
		start_point = Point();
		end_point = Point();
		start_point.location.latitude = array[0]['A'];
		start_point.location.longitude = array[0]['k'];
		start_point.name = "Path Begin";
		start_point.field_type = "P";
		start_point.save();

		end_point.location.latitude = array[-1]['A'];
		end_point.location.longitude = array[-1]['k'];
		end_point.name = "Path End";
		end_point.field_type = "P";
		end_point.save();

		path = Path();
		path.start = start_point;
		path.end = end_point;
		path.name = request.POST.get("name");
		path.access = int(request.POST.get("access"));
		path.save()

		start_point.path = path;
		end_point.path = path;

		prevpoint = start_point;
		for i in array[1:-1]:
			newpoint = Point();
			newpoint.location.latitude = i['A'];
			newpoint.location.longitude = i['k'];
			newpoint.path = path;
			newpoint.name = "MidPoint";
			prevpoint.next_point = newpoint;
			newpoint.prev_point = prevpoint;
			prevpoint.save();
			newpoint.save();
			prevpoint = newpoint;
		prevpoint.next_point = end_point;
		end_point.prev_point = prevpoint;
		prevpoint.save();
		end_point.save();


		
		# request_array = request_string.split(',');
		# array = zip(request_array[::2],request_array[1::2]);
		# start_point = Point();
		# start_point.location.latitude = array[0][0];
		# start_point.location.longitude = array[0][1];
		# start_point.field_type = "P";
		# start_point.name="Path_Begin";
		# start_point.save();
		# end_point = Point();
		# end_point.location.latitude = array[-1][0];
		# end_point.location.longitude = array[-1][1];
		# end_point.field_type = "P";
		# end_point.name="Path_End";
		# end_point.save();

		# path = Path()
		# path.start = start_point;
		# path.end = end_point;
		# path.name = request.POST.get("name");
		# path.access = 0;
		# path.save();

		# start_point.path = path;
		# end_point.path = path;
		# start_point.save();
		# end_point.save();
		# prevpoint = start_point;
		# newpoint = end_point;
		# for i in array[1:-1]:
		# 	# import pdb;
		# 	# pdb.set_trace();
		# 	newpoint = Point();
		# 	newpoint.location.latitude = i[0];
		# 	newpoint.location.longitude = i[0];
		# 	newpoint.path = path;
		# 	newpoint.field_type="P";
		# 	newpoint.name="MidPoint";
		# 	newpoint.save();
		# 	prevpoint.next_point = newpoint;
		# 	newpoint.prev_point = prevpoint;
		# 	newpoint.save();
		# 	prevpoint.save();
		# 	prevpoint = newpoint;
		# prevpoint.next_point = end_point;
		# end_point.prev_point = prevpoint;
		# prevpoint.save();
		# end_point.save();
		c = {"path":path};
		return render_to_response('find.html',c);
	return render_to_response('find.html',{})