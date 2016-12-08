FROM nginx

MAINTAINER ftm VERSION 1.0

COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir /var/insapp-web
COPY ./ /var/insapp-web/

EXPOSE 80
