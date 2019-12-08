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


# Commands

git add . ; git commit -m "ok" ; git push origin master ; git push origin --tags

gcloud builds submit `
    --project=sundaya-dev `
    --tag asia.gcr.io/sundaya-dev/host-image . `



# Local ESP

docker run `
    --detach `
    --name="esp" `
    -p 8080:8080 `
    --volume=C:/_frg/credentials:/esp `
    --publish=8080 `
    gcr.io/endpoints-release/endpoints-runtime:1 `
    --service=api.stage.sundaya.monitored.equipment `
    --rollout_strategy=managed `
    --http_port=8080 `
    --backend=192.168.1.108:8081 `
    --service_account_key=/esp/sundaya-dev_compute_developer.gserviceaccount.json `

_TEST_

curl -d "{ \"message\": \"hello world\" }" --request "POST" -k -H "content-type:application/json" -H "x-api-key:AIzaSyBS-hovvEYLAWQMQ35YUfBlr8AfERLtp28" http://localhost:8080/echo

.. {"version":"0.3.12.22beta","echo":"hello world"}