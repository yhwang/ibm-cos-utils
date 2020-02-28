# ibm-cos-utils
utility scripts for Cloud object storage

### Build the Scripts
Since I use typescript, please follow the instructions below to build the
project first.

```
npm install
npm run build
```

### Get IAM Token
Store you apikey JSON in `apikey.json` or your old IAM token in
`iam-token.json`. Then use the following command to get the
`access_token`:
```
APIKEY=apikey.json IAMTOKEN=iam-token.json node dist/get-iam-token.js
```

If the existing IAM Token in `iam-token.json` expires, it uses the API key in
`apikey.json` to request a new token and store it to `iam-token.json`.

### Add CORS for a Bucket
Add CORS to a bucket. For example, the endpoint is 
`s3.sjc.us.cloud-object-storage.appdomain.cloud` and bucket name is `mybucket`.
Then you can use the following command to add `GET` access from any domain
(`*`):
```
APIKEY=apikey.json IAMTOKEN=iam-token.json node dist/update-cors.js s3.sjc.us.cloud-object-storage.appdomain.cloud mybucket "*" get
```
If you need multiple accesses, just use comma as the separator. For example:
`GET,PUT`

### List CORS for a Bucket

```
APIKEY=apikey.json IAMTOKEN=iam-token.json node dist/get-cors.js s3.sjc.us.cloud-object-storage.appdomain.cloud mybucket
```
