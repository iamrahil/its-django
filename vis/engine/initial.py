from vis.models import *
from vis.engine.geometry import *
import networkx as nx

junctions = Junction.objects.all();

CAR = nx.Graph(name="IITB_car"); #road graph
CYCLE = nx.Graph(name="IITB_cycle"); #cycle graph
PEDESTRIAN = nx.Graph(name="IITB_pedestrian"); #pedestrian graph

def test():
	junction = junctions[2];
	paths = junction.paths.all();
	path  = paths[0];

	point = Point.objects.get(path=path,junction=junction);
	distance = 0;

	while 1:
		if point.name == 'Path End':
			print 'End of Path Found';
			break;
		# import pdb;pdb.set_trace();
		distance = distance + pointDistance(point,point.next_point);
		point = point.next_point;

		if point.is_junction:
			print "Junction Found";
			found = point.junction;
			return point,distance;
	return point;

def travelUp(junction,path):
	try:
		point = Point.objects.get(path=path,junction=junction);
	except Point.DoesNotExist:
		print "no point exists for path "+str(path.id)+" and junction "+str(junction.id);

	distance = 0;

	while 1:
		if point.name == 'Path End':
			return None,0;
		distance = distance + pointDistance(point,point.next_point);
		point = point.next_point;

		if point.is_junction:
			return point.junction, distance;

def travelDown(junction,path):
	try:
		point = Point.objects.get(path=path,junction=junction);
	except Point.DoesNotExist:
		print "no point exists for path "+str(path.id)+" and junction "+str(junction.id);
	distance = 0;

	while 1:
		if point.name == 'Path Begin':
			return None,0;
		distance = distance + pointDistance(point,point.prev_point);
		point = point.prev_point;

		if point.is_junction:
			return point.junction, distance;


def car_network(G): #Roads, i.e access level 0,1
	#Add junctions as nodes

	for junction in junctions:
		G.add_node(junction.id);

	#Traverse junctions
	for junction in junctions:
		#Get Path of junction
		for path in junction.paths.filter(access__lte=1):
			#Travel in forward direction
			upjunct,updist = travelUp(junction,path);
			# print junction.id;
			# import pdb;pdb.set_trace();
			downjunct,downdist = travelDown(junction,path);
			# print junction.id;
			if upjunct != None:
				G.add_edge(junction.id,upjunct.id,weight=updist);
			if downjunct != None:
				G.add_edge(junction.id,downjunct.id,weight=downdist);

def cycle_network(G): #Bycicles, i.e access level 0,1,2
	#Add junctions as nodes

	for junction in junctions:
		G.add_node(junction.id);

	#Traverse junctions
	for junction in junctions:
		#Get Path of junction
		for path in junction.paths.filter(access__lte=2):
			#Travel in forward direction
			upjunct,updist = travelUp(junction,path);
			# print junction.id;
			# import pdb;pdb.set_trace();
			downjunct,downdist = travelDown(junction,path);
			# print junction.id;
			if upjunct != None:
				G.add_edge(junction.id,upjunct.id,weight=updist);
			if downjunct != None:
				G.add_edge(junction.id,downjunct.id,weight=downdist);

def pedestrian_network(G): #Pedestrians, i.e access level 0,1,2,3
	#Add junctions as nodes

	for junction in junctions:
		G.add_node(junction.id);

	#Traverse junctions
	for junction in junctions:
		#Get Path of junction
		for path in junction.paths.filter(access__lte=3):
			#Travel in forward direction
			upjunct,updist = travelUp(junction,path);
			# print junction.id;
			# import pdb;pdb.set_trace();
			downjunct,downdist = travelDown(junction,path);
			# print junction.id;
			if upjunct != None:
				G.add_edge(junction.id,upjunct.id,weight=updist);
			if downjunct != None:
				G.add_edge(junction.id,downjunct.id,weight=downdist);

print "Building Car Network";
car_network(CAR);
print "Building Cycle Network";
cycle_network(CYCLE);
print "Building Pedestrian Network";
pedestrian_network(PEDESTRIAN);