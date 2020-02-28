import { request } from 'https';

export function addPublicAccess(
    endpoint: string,
    bucket: string,
    accessToken: string,
    object: string) {

  return new Promise((resolve, reject) => {
    const reqOpt = {
      hostname: endpoint,
      port: 443,
      path: `/${bucket}/${object}?acl`,
      method: 'PUT',
      headers: {
        'x-amz-acl': 'public-read',
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const req = request(reqOpt, (res) => {
      res.setEncoding('utf8');
      res.on('data', () => {});
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(200);
        } else {
          reject(`status code: ${res.statusCode}, ${res.statusMessage}`);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      reject(e.message);
    });

    req.end();
  });
}
