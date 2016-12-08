insapp-web
==========

## Dependencies

You need jade to compile `.jade` files in `.html`.
The installation is straightforward : `npm install -g jade`.
If you don't have npm, just look on the internet how to install it on your OS.
Using jade is as simple as : `jade index.jade`. Jade will output the corresponding html files.

## Web server

You can't open directly the html file on your browser. The reason is that we are doing CORS requests which are not authorized by your browser. You have to serve this file with Apache or Nginx or PHP Builtin WebServer (`php -S 0.0.0.0:9001`) or Python Builtin Webserver...

Now you can just go to [http://127.0.0.1:9001](http://127.0.0.1:9001) (if your server listen on port 9001) and test the interface. You must have launched `insapp-go` on localhost on port 9000.
