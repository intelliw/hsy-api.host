# Energy Managementy API Host

## Docker

If you're running locally, build the image with local.Dockerfile

```
docker build -f local.Dockerfile -t axc-hse .

```

## Package structure 

The API packages more or less mirror the OpenAPI specificaiton structure.
    - sandbox               // ignore - this package contains stashed or transient content which will eventually be deleted.   
    - src                 
        - definitions       // data objects
        - host              // setup and configuration for the app runtime
        - operations        // 
        - parameters        // generic class for simple params, specialised classes for complex params such as Period
        - paths             // routers for paths these handle top level routes  
        - requests          // request handlers, these validate params, headers, and authorisation 
        - responses         // view and response handlers for data and errors. Each response is constructed with a data objectand selects a view based on headers
        - system            // shared utilities and tools.

Package associations are  

## Sending authenticated requests

the Python client found [here][python-client] will send authenticated JWT requests using a Google Cloud service account, or using a three-legged OAuth flow.

[python-client]: https://github.com/GoogleCloudPlatform/python-docs-samples/tree/master/endpoints/getting-started
