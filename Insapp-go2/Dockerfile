FROM golang

MAINTAINER ftm VERSION 1.0

RUN mkdir /go/src/app
COPY ./ /go/src/app/
RUN cd /go/src/app/src && go get

RUN wget https://bootstrap.pypa.io/get-pip.py
RUN python2.7 get-pip.py
RUN pip install colorthief

RUN ls /go/src/app

EXPOSE 9000

ENTRYPOINT cd /go/src/app/src && go run *.go
