from dajax.core import Dajax

def exclaim(request, a, b):
	dajax = Dajax();
	result = str(a)+str(b);
	dajax.assign('#result','value',str(result));
	return dajax.json();