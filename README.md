# Energy Management API Host

## Docker

If you're running locally, build the image with local.Dockerfile

```
docker build -f local.Dockerfile -t axc-hse .

```

## Package structure 

API packages more or less mirror, the OpenAPI specification's structure.
    - sandbox               // ignore - this package contains stashed or transient content which will eventually be deleted.   
    - src                 
        - definitions       // data objects
        - host              // setup and configuration for the app runtime. shared utilities and tools.
        - parameters        // generic class for simple params, specialised classes for complex params such as Period
        - paths             // routers for paths these handle top level routes. 
                            // inner Request classes validate params, headers, and authorisation
        - responses         // view and response handlers for data and errors. Each response is constructed with a data objectand selects a view based on headers
        - views             // view templates

Package associations are  

