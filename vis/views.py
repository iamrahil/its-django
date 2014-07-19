from django.shortcuts import render
from django.core.context_processors import csrf
from django.shortcuts import render_to_response
from vis.models import Path,Point,Junction
import json
# Create your views here.
def index(request):
	c={};
	return render_to_response('index.html',c);

def login(request):
	c={};
	c.update(csrf(request))
	return render_to_response('path.html',c);

def test(request):
	c={};
	c.update(csrf(request))
	return render_to_response('test.html',c);
#CHANGE!
def preview(request):
	c={};
	c.update(csrf(request))
	return render_to_response('show.html',c);

def show_junctions(request):
	c={};
	c.update(csrf(request))
	return render_to_response('show_junctions.html',c);

def junction(request):
	c={};
	c.update(csrf(request))
	return render_to_response('junction.html',c);

#to process junction requests
def join(request):
	if request.POST:
		# import pdb;pdb.set_trace();
		junclist=[];
		request_string = request.POST.get('list');
		array = json.loads(request_string);
		for obj in array:
			#create junction
			junction = Junction();
			junction.latitude = obj['junction']['k'];
			junction.longitude = obj['junction']['A'];
			junction.name = "junction";
			junction.save();
			for pathID in obj['paths']:
				path = Path.objects.get(id=pathID);
				junction.paths.add(path);
				path.junctions.add(junction);
				path.save();
			for pointID in obj['points']:
				point = Point.objects.get(id=pointID);
				point.is_junction = True;
				point.junction = junction;
				point.save();
			junction.save();
			junclist.append(junction);
		c={"junctions":junclist};
		return render_to_response('junction_added.html',c);
	return render_to_response('junction_added.html',{})
		


def assmilate(request):
	if request.POST:
		request_string = request.POST.get("list");
		array = json.loads(request_string);
		start_point = Point();
		end_point = Point();
		start_point.latitude = array[0]['k'];
		start_point.longitude = array[0]['A'];
		start_point.name = "Path Begin";
		start_point.field_type = "P";
		start_point.save();

		end_point.latitude = array[-1]['k'];
		end_point.longitude = array[-1]['A'];
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
			newpoint.latitude = i['k'];
			newpoint.longitude = i['A'];
			newpoint.path = path;
			newpoint.name = "MidPoint";
			newpoint.prev_point = prevpoint;
			newpoint.save();
			prevpoint.next_point = newpoint;
			prevpoint.save();
			prevpoint = newpoint;
		prevpoint.next_point = end_point;
		end_point.prev_point = prevpoint;
		prevpoint.save();
		end_point.save();
		c = {"path":path};
		return render_to_response('find.html',c);
	return render_to_response('find.html',{})



import vis.engine.initial as Network
from django.http import HttpResponse
from decimal import Decimal
import json
def shortestpath(request):
	if request.GET:
		alpha = int(request.GET.get('alpha'));
		beta = int(request.GET.get('beta'));
		level = int(request.GET.get('access'));
		obj = Network.shortestpath(alpha,beta,level)
		jsondata = json.dumps(obj);
		return HttpResponse(jsondata,content_type='application/json');

def propogate(request):
	if request.GET:
		alpha = {'k':Decimal(request.GET.get('from_lat')),'A':Decimal(request.GET.get('from_lng'))};
		beta = {'k':Decimal(request.GET.get('to_lat')),'A':Decimal(request.GET.get('to_lng'))};
		level = request.GET.get('access');

		obj = Network.generic_shortestpath(alpha,beta,level);
		jsondata = json.dumps(obj);
		return HttpResponse(jsondata,content_type='application/json');
