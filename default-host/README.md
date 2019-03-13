# Energy Managementy API Host

## Docker

If you're running locally, build the image with local.Dockerfile

```
docker build -f local.Dockerfile -t axc-hse .

```

## Package structure 

app                 // root 
    - svc           // common services and tools. modules can only access app and other svc modules
        - config
        - initialise
        - security
        - enum 
        - constant
        - util
    - api           // path-specific implementations. modules can access svc and app but cannot access other api modules
        - energy
        - devices
        - diagnostics

## api package File structure     
files in api module have these prefixes 
        - route
        - model
        - view
        - validate


## Sending authenticated requests

the Python client found [here][python-client] will send authenticated JWT requests using a Google Cloud service account, or using a three-legged OAuth flow.

[python-client]: https://github.com/GoogleCloudPlatform/python-docs-samples/tree/master/endpoints/getting-started
