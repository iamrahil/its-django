from math import sin, cos, atan2, radians, sqrt

from vis.models import Point

def haversine(lat1,long1,lat2,long2):
	R = 6373.0;

	lat1 = radians(lat1);
	lon1 = radians(long1);
	lat2 = radians(lat2);
	lon2 = radians(long2);

	dlon = lon2 - lon1
	dlat = lat2 - lat1
	a = (sin(dlat/2))**2 + cos(lat1) * cos(lat2) * (sin(dlon/2))**2
	c = 2 * atan2(sqrt(a), sqrt(1-a))
	distance = R * c * 1000; #Metres

	return distance;

def pointDistance(A, B):
	return haversine(A.latitude,A.longitude,B.latitude,B.longitude);


from decimal import *

def getNearby(point,mag=1):
	lat = point.latitude;
	lon = point.longitude;

	bl = {"latitude": lat-Decimal(0.00005*mag),"longitude": lon-Decimal(0.00007*mag)}
	tr = {"latitude": lat+Decimal(0.00005*mag),"longitude": lon+Decimal(0.00007*mag)}

	query = Point.objects.filter(latitude__gte=bl["latitude"],longitude__gte=bl["longitude"],latitude__lte=tr["latitude"],longitude__lte=tr["longitude"]);
	return query;

def getNearbyLoc(point,mag=1):
	lat = point['k'];
	lon = point['A'];

	bl = {"latitude": lat-Decimal(0.00005*mag),"longitude": lon-Decimal(0.00007*mag)}
	tr = {"latitude": lat+Decimal(0.00005*mag),"longitude": lon+Decimal(0.00007*mag)}

	query = Point.objects.filter(latitude__gte=bl["latitude"],longitude__gte=bl["longitude"],latitude__lte=tr["latitude"],longitude__lte=tr["longitude"]);
	return query;

