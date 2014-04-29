from django.db import models
from geoposition.fields import GeopositionField

# Create your models here.

class Point(models.Model):
    location = GeopositionField();
    latitude = models.DecimalField(max_digits=12,decimal_places=10,default=0);
    longitude = models.DecimalField(max_digits=12,decimal_places=10,default=0);
    field_type = models.CharField(max_length=1);
    name = models.CharField(max_length=60, null=True,blank=True);
    next_point= models.ForeignKey('Point', null=True, blank=True,related_name="following_point");
    can_next = models.BooleanField(default=True);
    prev_point = models.ForeignKey('Point', null=True, blank=True,related_name="previous_point");
    can_prev = models.BooleanField(default=True);
    path = models.ForeignKey('Path', null=True, blank=True);
    is_junction = models.BooleanField(default=False);
    junction = models.ForeignKey('Junction', null=True, blank=True,related_name="junction");

    def __unicode__(self):
        return self.name;

class Junction(models.Model):
    location = GeopositionField();
    latitude = models.DecimalField(max_digits=12,decimal_places=10,default=0);
    longitude = models.DecimalField(max_digits=12,decimal_places=10,default=0);
    name = models.TextField(blank=True);
    paths = models.ManyToManyField("Path");
    
    def __unicode__(self):
        return self.name;

class Path(models.Model):
    start = models.ForeignKey(Point,related_name='start_path');
    end = models.ForeignKey(Point,related_name='end_path');
    name = models.TextField();
    access = models.IntegerField();
    junctions = models.ManyToManyField('Junction');

    def __unicode__(self):
        return self.name;

class Location(models.Model):
    location = GeopositionField();
    latitude = models.DecimalField(max_digits=12,decimal_places=10,default=0);
    longitude = models.DecimalField(max_digits=12,decimal_places=10,default=0);
    name = models.TextField();
    information = models.TextField(blank=True);
    field_type = models.CharField(max_length=1);