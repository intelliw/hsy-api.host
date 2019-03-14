# Energy Managementy API Host

## Docker

If you're running locally, build the image with local.Dockerfile

```
docker build -f local.Dockerfile -t axc-hse .

```

## Package structure 

app                 // root 
    - svc           // common services and tools. modules in this package can only access app and other svc modules
        - config
        - constant
        - enum 
        - security
        - util
    - api           // path-specific implementations. modules can access svc and app but cannot access other api modules
        - model
        - route
        - view
        - validate

each module stores its path relative to the app root. 
all child modules are exported through api and svc
    - api and svc modules pass their path to each child when requiring it 

## Sending authenticated requests

the Python client found [here][python-client] will send authenticated JWT requests using a Google Cloud service account, or using a three-legged OAuth flow.

[python-client]: https://github.com/GoogleCloudPlatform/python-docs-samples/tree/master/endpoints/getting-started
