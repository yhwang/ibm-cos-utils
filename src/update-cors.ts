import { updateCORS } from './cos-cors';
import { IAMTOKEN, getKey, getIAMToken }from './ibm-token';

if (process.argv.length !== 6) {
  console.log(
      `Usage: node ${process.argv[1]} <endpoint> <bucket> <origin> GET|[,POST...]`);
  process.exit(-1);
}

const endpoint = process.argv[2];
const bucket = process.argv[3];
const origin = process.argv[4];
const methods = process.argv[5];

const promises = [];
if (IAMTOKEN === undefined) {
  const keyObj = getKey();
  promises.push(getIAMToken(keyObj.apikey));
} else {
  promises.push(IAMTOKEN);
}

Promise.all(promises).then((token) => {
  return updateCORS(
      endpoint,
      bucket,
      token[0]['access_token'], 
      {
        origin,
        methods: methods.split(',').map((m) => m.toUpperCase())
      });
})
.then((statusCode) => {
  if (statusCode === 200) {
    console.log('updated CORS');
  }
})
.catch((e) => {
  console.log(`cant update CORS:${e}`);
});
