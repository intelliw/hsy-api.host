# Energy Management API Host

# GIT

https://github.com/intelliw/hsy-api.host

git add . ; git commit -m "ok" ; git push origin master ; git push origin --tags


## Package structure 

API packages more or less mirror, the OpenAPI specification document structure.
    - sandbox               // ignore - this package contains stashed or transient content which will eventually be deleted.   
    - src                 
        -  definitions       // data objects
        - `environment`       // configs and enums shared by other services in the environment. 
        -  host              // setup and configuration needed by hsy-api-host (not shared). 
        - `logger`            // logging framework, shared by other services in the environment. 
        -  parameters        // generic class for simple params, specialised classes for complex params such as Period
        -  paths             // routers for paths, these handle top level routes. 
        -  producers         // message producers
        -  responses         // views and response handlers for data and errors.
                                Each response object is constructed with a data object; and selects a view based on headers
        -  views             // view templates

`environment` and `logger` packages are mastered in hsy-api-host (this project) and shared with hsy-api-consumers.
Before building copy these packages to hsy-consumer project and test.


## Cloud Build 

_check which files will be uploaded (check .gcloudignore file)_
    gcloud meta list-files-for-upload

_upload and submit build_
gcloud builds submit `
    --project=sundaya-dev `
    --tag asia.gcr.io/sundaya-dev/host-image . `

gcloud builds submit --project=sundaya-dev --tag "asia.gcr.io/sundaya-dev/host-image:latest" C:\_frg\_proj\190220-hsy-api-host\. `


## Cloud Run  

gcloud run deploy hse-host-stub `
    --image asia.gcr.io/sundaya-dev/host-image:latest `
    --region asia-northeast1 `
    --platform managed `
    --allow-unauthenticated `
    --project=sundaya-dev `
    --service-account 844926933055-compute@developer.gserviceaccount.com `

## Local Build
If running locally, build the image with local.Dockerfile (optional)

docker build -f local.Dockerfile -t axc-hsy .


## Local ESP

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
    --backend=192.168.1.113:8081 `
    --service_account_key=/esp/sundaya-dev_compute_developer.gserviceaccount.json `

_TEST_

curl -d "{ \"message\": \"hello world\" }" --request "POST" -k -H "content-type:application/json" -H "x-api-key:AIzaSyBS-hovvEYLAWQMQ35YUfBlr8AfERLtp28" http://localhost:8080/echo

.. {"version":"0.3.12.22beta","echo":"hello world"}