# Energy Management API Host

## Deployment
'environment' and 'logger' pacakges are shared with hse-consumer. 
Before building copy these packages to hse-consumer project and test.

If running locally, build the image with local.Dockerfile

```
docker build -f local.Dockerfile -t axc-hse .

```

## Package structure 

API packages more or less mirror, the OpenAPI specification's structure.
    - sandbox               // ignore - this package contains stashed or transient content which will eventually be deleted.   
    - src                 
        - definitions       // data objects
        - environment       // configs and enums shared with other services runing in the environment. Mastered in hse-api-host project and shared by hse-api-consumers.
        - host              // setup and configuration needed by hse-api-host (not shared). 
        - logger            // logging framework, shared with other services runing in the environment. Mastered in hse-api-host project and shared by hse-api-consumers. 
        - parameters        // generic class for simple params, specialised classes for complex params such as Period
        - paths             // routers for paths, these handle top level routes. 
        - producers         // message producers
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