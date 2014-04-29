from vis.models  import *

def no_next():
	paths = Path.objects.all();

	for path in paths:
		print "On path "+str(path.id);
		end_point = Point.objects.get(path=path,name="Path End");

		previous_point = end_point;
		point = end_point.prev_point;
		while point.name != "Path Begin":
			point.next_point = previous_point;
			point.save();
			previous_point = point;
			point = point.prev_point;
		point.next_point = previous_point;
		point.save();
	return;

def prev_next():
	points = Point.objects.filter(name='Path Begin');
	for point in points:
		point.next_point = point.prev_point;
		point.prev_point = None;
		point.save();
	return;

def path_end_junction():
	paths  = Path.objects.all();
	for path in paths:
		point = path.end;
		if point.is_junction:
			continue;
		else:
			print "Fixing Path "+str(path.id);
			point.is_junction=True;
			junction = Junction();
			junction.name = 'Path End Junction';
			junction.latitude = point.latitude;
			junction.longitude = point.longitude;
			junction.save();
			junction.paths.add(path);
			junction.save();
			path.junctions.add(junction);
			point.junction = junction;
			point.save();
			path.save();
	return paths;

def path_start_junction():
	paths  = Path.objects.all();
	for path in paths:
		point = path.start;
		if point.is_junction:
			continue;
		else:
			print "Fixing Path "+str(path.id);
			point.is_junction=True;
			junction = Junction();
			junction.name = 'Path Begin Junction';
			junction.latitude = point.latitude;
			junction.longitude = point.longitude;
			junction.save();
			junction.paths.add(path);
			junction.save();
			path.junctions.add(junction);
			point.junction = junction;
			point.save();
			path.save();
	return paths;

def point_not_junction(junction,path):
	pass;