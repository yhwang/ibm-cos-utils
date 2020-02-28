import { request } from 'https';
import { stringify as qsStringify} from 'querystring';
import { resolve } from 'path';

interface IAMToken {
  [key: string]: string;
}

type KeyObj = {
  apikey: string;
};

function getToken(): IAMToken {
  const tokenEnv = process.env['IAMTOKEN'];
  if (tokenEnv === undefined) {
    return undefined;
  }
  try {
    const token: IAMToken = require(resolve(process.cwd(), tokenEnv));
    const exp = new Date(parseInt(`${token['expiration']}000`, 10));
    if (exp.getTime() < Date.now()) {
      // exipred already
      console.warn(
          `The IAM token ${tokenEnv} expired, need to request a new one`);
      return undefined;
    }
    return token;
  } catch (e) {
    return undefined;
  }
}

export function getIAMToken(key: string): Promise<IAMToken> {
  if (key === undefined || typeof(key) !== 'string') {
    return Promise.reject('need apikey');
  }

  // Let's check if IAMTOKEN env presents or not
  if (IAMTOKEN) {
    return Promise.resolve(IAMTOKEN);
  }
  
  return new Promise((resolve, reject) => {
    const data = qsStringify({
      'grant_type': 'urn:ibm:params:oauth:grant-type:apikey',
      'apikey': key
    });

    const options = {
      hostname: 'iam.cloud.ibm.com',
      port: 443,
      path: '/identity/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const chunks: string[] = [];
    const req = request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      res.on('end', () => {
        IAMTOKEN = JSON.parse(chunks.join(''));
        resolve(IAMTOKEN);
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      reject(e.message);
    });

    req.write(data);
    req.end();
  });
}

export function getKey(): KeyObj {
  const apiKeyFile = process.env['APIKEY'];
  if (apiKeyFile === undefined) {
    throw new Error('Use environment variable: APIKEY to point to a JSON file containing the key info');
  }

  const fullpath = resolve(process.cwd(), apiKeyFile);
  try {
    return require(fullpath);
  } catch (e) {
    throw new Error(`Can not access key file: ${apiKeyFile}`);
  }
}

export let IAMTOKEN: IAMToken = getToken();