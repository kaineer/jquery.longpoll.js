### poll server
from gevent import monkey; monkey.patch_all()
import gevent
from gevent.pywsgi import WSGIServer

def handle_poll(env, start_response):
    start_response("200 OK", [("Content-Type", "text/plain"), ("Access-Control-Allow-Origin", "*")])
    gevent.sleep(3)
    return iter(["Ok"])

# WSGIServer(('', 8000), handle_poll).serve_forever()
