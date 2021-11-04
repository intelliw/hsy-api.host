# Energy Management API Host

# GIT

https://github.com/intelliw/hsy-api.host

git add . ; git commit -m "ok" ; git push origin master ; git push origin --tags



## Package structure 

API packages more or less mirrors the OpenAPI specification structure.
    
    - sandbox               // ignore this package - contains stashed content which will be deleted.   
    
    - src                 
        -  definitions       // data objects
        - `environment`      // configs and enums shared by other services in the environment. 
        -  host              // setup and configuration needed by hsy-api-host (not shared). 
        - `logger`           // logging framework, shared by other services in the environment. 
        -  parameters        // base param class is for simple params, specialised classes are 
                                    for  complex params such as Period
        -  paths             // 
                router          express.js routers for each path, these handle top level routes. 
                request         each path has a request class
                response        a response object is constructed by request with a data object; it selects a view based on request headers
        -  producers         // message producers. will transform message into application-specified format 
                                then call write on a Storage class. 
                                Optionally it will also republish to a new topic
        -  consumers         // instantiates a Subscriber and listens to a topic in the Consumer's callback reference
        -  publishers        // if a Producer had optionally re-published the mesage, publishers will call broker client library
                                 to deliver a transformed message to a new topic in the Message Broker.
        -  views             // view templates

`environment` and `logger` packages are mastered in hsy-api-host (this project) and shared with hsy-api-consumers.
Before building, make sure these are checked-in and pulled into your local build.


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


## run Local 
    with Service Account authentication for GCP services

#### run locally in `vscode`
    
- set `GOOGLE_APPLICATION_CREDENTIALS` vscode env variable 

```json
"terminal.integrated.env.windows": {
        // "GOOGLE_APPLICATION_CREDENTIALS":"M:\_vlt\_credentials\sundaya-dev_compute_developer.gserviceaccount.json",
        "GOOGLE_APPLICATION_CREDENTIALS": "M:\\_vlt\\_credentials\\axc-svceaccount_my-project-85848-0c51b85ca540.json"
},
```
- or.... override vscode env variable for **this session only**, as follows
    
`$env:GOOGLE_APPLICATION_CREDENTIALS="M:\_vlt\_credentials\sundaya-dev_compute_developer.gserviceaccount.json"`

#### run in Local container

    map a volume 
    ..and reference service account key in env. var 
    note: if running in bash/wsl you need to map m drive in fstab 
    (see intelliweave.wiki/Linux#Folder Mount)
    

    ```bash 

        docker run \
        --name="hsyhost" \
        -p 8080:8081 \
        -e GOOGLE_APPLICATION_CREDENTIALS=/keys/sundaya-dev_compute_developer.gserviceaccount.json \
        -v /mnt/m/_vlt/_credentials:/keys \
            axc-hsy:latest \
    ```

    ```powershell

        docker run `
        --name="hsyhost" `
        -p 8080:8081 `
        -e GOOGLE_APPLICATION_CREDENTIALS=/keys/sundaya-dev_compute_developer.gserviceaccount.json `
        -v M:/_vlt/_credentials:/keys `
            axc-hsy:latest `
    ```



#### using Cloud Code with Secret Manager
        https://cloud.google.com/code/docs/vscode/secret-manager
        

## ---------------------------------------------
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