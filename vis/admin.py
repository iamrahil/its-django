from django.contrib import admin
from vis.models import *
# Register your models here.

admin.site.register(Point,admin.ModelAdmin);
admin.site.register(Location,admin.ModelAdmin);
admin.site.register(Path,admin.ModelAdmin);
admin.site.register(Junction,admin.ModelAdmin);
