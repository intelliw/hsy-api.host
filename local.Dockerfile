# The Google App Engine Flexible Environment base Docker image can
# also be used on Google Container Engine, or any other Docker host.
# This image is based on Debian Jessie and includes nodejs and npm
# installed from nodejs.org. The source is located in
# https://github.com/GoogleCloudPlatform/nodejs-docker
# can be used as base image for running applications on 
#       Google App Engine Flexible, Google Kubernetes Engine, or any other Docker host

FROM gcr.io/google_appengine/nodejs

ADD . /app
WORKDIR /app

RUN npm install
RUN npm install -g nodemon

ENV PORT=8081

EXPOSE 8081

ENTRYPOINT ["nodemon", "start"]
