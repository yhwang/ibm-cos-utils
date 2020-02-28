import { getCORS } from './cos-cors';
import { IAMTOKEN, getKey, getIAMToken }from './ibm-token';

if (process.argv.length !== 4) {
  console.log(
      `Usage: node ${process.argv[1]} <endpoint> <bucket>`);
  process.exit(-1);
}

const endpoint = process.argv[2];
const bucket = process.argv[3];

const promises = [];
if (IAMTOKEN === undefined) {
  const keyObj = getKey();
  promises.push(getIAMToken(keyObj.apikey));
} else {
  promises.push(IAMTOKEN);
}

Promise.all(promises).then((token) => {
  return getCORS(
      endpoint,
      bucket,
      token[0]['access_token']);
})
.then((corsdoc) => {
  console.log(corsdoc);
})
.catch((e) => {
  console.log(`can't get CORS:${e}`);
});
