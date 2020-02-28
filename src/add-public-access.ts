import { addPublicAccess } from './cos-public-access';
import { IAMTOKEN, getKey, getIAMToken }from './ibm-token';

if (process.argv.length !== 5) {
  console.log(
      `Usage: node ${process.argv[1]} <endpoint> <bucket> <object>`);
  process.exit(-1);
}

const endpoint = process.argv[2];
const bucket = process.argv[3];
const object = process.argv[4];

const promises = [];
if (IAMTOKEN === undefined) {
  const keyObj = getKey();
  promises.push(getIAMToken(keyObj.apikey));
} else {
  promises.push(IAMTOKEN);
}

Promise.all(promises).then((token) => {
  return addPublicAccess(
      endpoint,
      bucket,
      token[0]['access_token'],
      object);
})
.then((statusCode) => {
  console.log(statusCode);
})
.catch((e) => {
  console.log(`can't add public access:${e}`);
});
