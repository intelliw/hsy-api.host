# App Engine Flexible Environment base Docker image
# based on Debian Jessie and includes nodejs and npm, and  be used on GCE or any other Docker host.
# The source is located in https://github.com/GoogleCloudPlatform/nodejs-docker
# can be used as base image for running applications on 
#       Google App Engine Flexible, Google Kubernetes Engine, or any other Docker host

FROM gcr.io/google_appengine/nodejs

ADD . /app
WORKDIR /app

RUN npm install

ENV PORT=8081

EXPOSE 8081

ENTRYPOINT ["node", "app.js"]