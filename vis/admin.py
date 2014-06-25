from django.contrib import admin
from vis.models import *
# Register your models here.

admin.site.register(Point,admin.ModelAdmin);
admin.site.register(Path,admin.ModelAdmin);
admin.site.register(Junction,admin.ModelAdmin);

class LocationAdmin(admin.ModelAdmin):
    def get_form(self, request, obj=None, **kwargs):
        self.exclude = ['latitude','longitude'];
        return super(LocationAdmin,self).get_form(request,obj=None,**kwargs);
        pass

    def save_model(self,request,obj,form,change):
        obj.latitude = obj.location.latitude;
        obj.longitude = obj.location.longitude;
        obj.save();

admin.site.register(Location,LocationAdmin);
