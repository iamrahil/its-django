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
	distance = R * c

	return distance;

def pointDistance(A, B):
	return haversine(A.latitude,A.longitude,B.latitude,B.longitude);