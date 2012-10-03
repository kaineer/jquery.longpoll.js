from gevent import monkey; monkey.patch_all()
import gevent
from gevent.pywsgi import WSGIServer

import re
import simplejson as json

import random
import datetime

### Base wsgi application
#
class WSGIApplication:
    # Inner classes
    #
    class Route: # Route description
        #
        def __init__(self, regexp_string, method):
            self.regexp = re.compile(regexp_string)
            self.method = method

        # Does route accepts incoming path
        #   (also, as side effect keeps match data)
        def accepts(self, path):
            self.md = self.regexp.match(path)
            return self.md != None

        # Process match data with specified method
        #
        def process(self, environment, start_response):
            return self.method(self.md, environment, start_response)

    class Router: # Routes container and selector
        def __init__(self):
            self.routes = []

        # Add new route to container
        #
        def add_route(self, regexp_string, method):
            self.routes.append(WSGIApplication.Route(regexp_string,  method))
            return self # Make it possible to chain calls

        # Add list of tuples to container
        #   Each tuple contains regexp_string and method
        #
        def add_routes(self, routes):
            for regexp_string, method in routes:
                self.add_route(regexp_string, method)

        def process(self, environment, start_response):
            path = environment["PATH_INFO"]
            for route in self.routes:
                if route.accepts(path):
                    return route.process(environment, start_response)

    def __init__(self, host, port):
        self.config = (host, port)
        self.router = WSGIApplication.Router()

    def handle(self, environment, start_response):
        return self.router.process(environment, start_response)

    def run(self):
        WSGIServer(self.config, self.handle).serve_forever()

class FishingServer(WSGIApplication):
    def __init__(self):
        WSGIApplication.__init__(self, "localhost", 8000)

        self.rod_state = "dry"
        
        self.router.add_routes([
                ("/poll/(\w+)/(\w+)/?", self.poll_state),
                ("/poll/(\w+)/?",       self.poll_state),
                ("/poll/?",             self.poll_state),
                ("/wet_rod",            self.wet_rod),
                ("/dry_rod",            self.dry_rod),
                ("^/?(.+)",               self.serve_file)
                ])

    def start_json(self, start_response):
        status = "200 OK"
        headers = [("Content-Type", "application/json")]

    def wrap(self, obj):
        yield json.dumps(obj)

    def now(self):
        return datetime.datetime.now()

    def timedelta(self, secs):
        return self.now() + datetime.timedelta(seconds=secs)

    def poll_rod_state(self, env, prev_state):
        time_end = self.timedelta(25)
        dice = random.randint(1, 6)
        
        while self.now() < time_end:
            if self.rod_state != prev_state:
                return self.wrap({"state": self.rod_state})
            gevent.sleep(0.2)

        if dice > 3 and self.rod_state == "wet":
            self.rod_state = "dry"

            if dice == 4:
                gotfish = "salmon"
            if dice == 5:
                gotfish = "shark"
            if dice == 6:
                gotfish = "kitten fish"

            return self.wrap({"state": self.rod_state, "got": gotfish})
        else:
            return self.wrap({"state": self.rod_state})

    def poll_state(self, md, env, start_response):
        self.start_json(start_response)

        if md.lastindex == None or md.lastindex == 0:
            return self.wrap({"state": self.rod_state})

        if md.lastindex == 1:
            prev_state = md.group(1)
            if prev_state != self.rod_state:
                return self.wrap({"state": self.rod_state})
            else:
                return self.poll_rod_state(env, prev_state)

        return self.wrap({})
        

    def wet_rod(self, md, env, start_response):
        self.start_json(start_response)
        timeout = random.uniform(0.5, 1.0)
        gevent.sleep(timeout)
        self.rod_state = "wet"
        return self.wrap({})

    def dry_rod(self, md, env, start_response):
        self.start_json(start_response)
        self.rod_state = "dry"
        return self.wrap({})

    def serve_file(self, md, env, start_response):
        filename = md.group(1)
        if filename == "jquery.longpoll.js":
            filename = "../../jquery.longpoll.js"
        if filename == "favicon.ico":
            return iter([])
        return open(filename, "r")


serverApp = FishingServer()

def handle(environment, start_response):
    return serverApp.handle(environment, start_response)
