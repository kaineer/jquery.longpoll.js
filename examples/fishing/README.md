To see demo, run

```shell
$ gunicorn -w 1 -k gevent server:handle
```

and then open `http://localhost:8000/index.html` in your browser
