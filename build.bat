gcloud builds submit --project=sundaya-dev --tag "asia.gcr.io/sundaya-dev/host-image:latest" . `

gcloud beta run deploy api-host `
    --image asia.gcr.io/sundaya-dev/host-image:latest `
    --allow-unauthenticated `
    --region asia-northeast1 `
    --platform managed `
    --project=sundaya-dev 
