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
# car_network(CAR);
print "Building Cycle Network";
# cycle_network(CYCLE);
print "Building Pedestrian Network";
pedestrian_network(PEDESTRIAN);

def shortestpath(alpha,beta,level=3):
	if level is 0:
		graph = CAR;
	elif level is 1:
		graph = CAR;
	elif level is 2:
		graph = CYCLE;
	elif level is 3:
		graph = PEDESTRIAN;
	else :
		graph=PEDESTRIAN;
	
	path = nx.dijkstra_path(graph,alpha,beta);
	weight = nx.dijkstra_path_length(graph,alpha,beta);

	details={};
	for i in zip(path,path[1:]):
		# TODO: add access
		p =Path.objects.filter(junction=i[0]).get(junction=i[1]).id;
		details[i[0]]={
			"length": int(graph.edge[i[0]][i[1]]['weight']),
			"path": p,
			"end":i[1],
			"points": getsplitpath(p,i[0],i[1])
		}
		
	obj = {"length":int(weight),"array":path,"details":details}
	
	return obj;

#TODO Check this function for edge cases
def getsplitpath(path, source, destin):
	start = Point.objects.get(junction=source,path=path);
	point = start;
	locarray = [start.getLocation()];

	direction = True; #True for forward, False for back
	while True:
		point = point.next_point if direction else point.prev_point;
		if point is None:
			locarray = [start.getLocation()];
			point = start;
			direction = not direction;
			continue;

		locarray.append(point.getLocation());

		if point.is_junction:
			if point.junction.id is destin:
				break;
			else:
				if direction:
					locarray = [start.getLocation()];
					point = start;
					direction = not direction;
				else:
					return 0;

	return locarray;

def generic_shortestpath(source_loc,destination_loc,access=3):
	source = Point();
	source.latitude = source_loc['k'];
	source.longitude = source_loc['A'];
	dest = Point();
	dest.latitude = destination_loc['k'];
	dest.longitude = destination_loc['A'];
	
	min_source = getNearestPoint(source);
	min_dest = getNearestPoint(dest);
	
	#get nearest junctions
	#Upstream
	point = min_source;
	while not point.is_junction:
		if point is min_dest:
			#Ditch ho gaya life se
			#TODO: Implement this
			pass;
		point = point.next_point;
	upstream_src = point.junction;
	#downstream
	point = min_source;
	while not point.is_junction:
		if point is min_dest:
			#Ditch ho gaya life se
			#TODO: Implement this
			pass;
		point = point.prev_point;
	downstream_src = point.junction;

	#for destinations, the same
	point = min_dest;
	while not point.is_junction:
		if point is min_source:
			#Ditch ho gaya life se
			#TODO: Implement this
			pass;
		point = point.next_point;
	upstream_dest = point.junction;
	#downstream
	point = min_dest;
	while not point.is_junction:
		if point is min_source:
			#Ditch ho gaya life se
			#TODO: Implement this
			pass;
		point = point.prev_point;
	downstream_dest = point.junction;

	#The four combinations
	shortest = min([
					shortestpath(downstream_src.id,downstream_dest.id,int(access)),
					shortestpath(downstream_src.id,upstream_dest.id,int(access)),
					shortestpath(upstream_src.id,downstream_dest.id,int(access)),
					shortestpath(upstream_src.id,upstream_dest.id,int(access))
					],key=lambda x: x['length']);

	return shortest;