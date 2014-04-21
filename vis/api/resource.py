from tastypie.resources import ModelResource
from vis.models import Point, Path, Junction

class PathResource(ModelResource):
	class Meta:
		queryset = Path.objects.all();
		resource_name = "path";
		filtering = {
			'access': ['exact', 'lt', 'lte', 'gte', 'gt'],
		}

class PointResource(ModelResource):
	class Meta:
		queryset = Point.objects.all();
		resource_name = "point";
		filtering = {
			'location': ['exact', 'lt', 'lte', 'gte', 'gt'],
			'latitude': ['exact', 'lt', 'lte', 'gte', 'gt'],
			'longitude': ['exact', 'lt', 'lte', 'gte', 'gt'],
			'path' : ['exact','lt']
		}
	def get_object_list(self,request):
		if request.GET.has_key("path"):
			path = request.GET["path"];
			return super(PointResource,self).get_object_list(request).filter(path=path);
		else:
			return super(PointResource,self).get_object_list(request);

class JunctionResource(ModelResource):
	class Meta:
		queryset = Junction.objects.all();
		resource_name = "junction";
		filtering = {
			'latitude': ['exact', 'lt', 'lte', 'gte', 'gt'],
			'longitude': ['exact', 'lt', 'lte', 'gte', 'gt'],
			'path' : ['exact', 'lt', 'lte', 'gte', 'gt']
		}
