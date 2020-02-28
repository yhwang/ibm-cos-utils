import { getIAMToken, getKey, IAMTOKEN } from './ibm-token';
import { writeFileSync } from 'fs';

if (IAMTOKEN) {
  console.log(IAMTOKEN['access_token']);
  process.exit(0);
}

const apiKey = getKey();

getIAMToken(apiKey.apikey).then((tokenObj) => {
  for(const key in tokenObj) {
    console.log(`${key}: ${tokenObj[key]}`);
  }
  writeFileSync('iam-token.json', JSON.stringify(tokenObj, null, 2));
});