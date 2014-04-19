from django.conf.urls import patterns, include, url
from django.contrib import admin
from vis import views
from vis.api.resource import PathResource, PointResource
from tastypie.api import Api

admin.autodiscover()

v1_api = Api(api_name="v1");
v1_api.register(PathResource());
v1_api.register(PointResource());

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'its.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    (r'^login/', views.login),
    (r'^join/', views.assmilate),
    (r'^show/', views.preview),
    (r'^api/', include(v1_api.urls)),
)
