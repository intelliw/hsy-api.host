# Energy Managementy API Host


```
# If you're running locally, build the image with local.Dockerfile

docker build -f local.Dockerfile -t axc-hse .

```


## Sending authenticated requests

No Node.js client is written yet, but you can try the Python client found [here][python-client].
It will send authenticated JWT requests using a Google Cloud service account, or using a three-legged OAuth flow.

[python-client]: https://github.com/GoogleCloudPlatform/python-docs-samples/tree/master/endpoints/getting-started
