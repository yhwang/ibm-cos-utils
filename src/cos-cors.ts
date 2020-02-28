import { createHash } from 'crypto';
import { request } from 'https';

type CORSOptions = {
  origin: string;
  methods: string[];
};

type CORSDoc = {
  xml: string;
  encode: string;
};

export function getCORSDocMD5(options: CORSOptions): CORSDoc {
  const xmlStr = optionToString(options);
  return {
      xml: xmlStr,
      encode: createHash('md5').update(xmlStr, 'ascii').digest('base64')
  };
}

export function getCORS(
    endpoint: string, bucket: string, accessToken: string) {

  return new Promise((resolve, reject) => {
    const reqOpt = {
      hostname: endpoint,
      port: 443,
      path: `/${bucket}?cors=`,
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const chunks: string[] = [];
    const req = request(reqOpt, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(chunks.join(''));
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

export function updateCORS(
    endpoint: string,
    bucket: string,
    accessToken: string,
    options: CORSOptions): Promise<number> {

  return new Promise((resolve, reject) => {
    const corsObj = getCORSDocMD5(options);
    const reqOpt = {
      hostname: endpoint,
      port: 443,
      path: `/${bucket}?cors=`,
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
        'Content-MD5': corsObj.encode,
        'Content-Length': Buffer.byteLength(corsObj.xml),
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const req = request(reqOpt, (res) => {
      res.setEncoding('utf8');
      res.on('data', () => {});
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(res.statusCode);
        } else {
          reject(`status code: ${res.statusCode}, ${res.statusMessage}`);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      reject(e.message);
    });

    req.write(corsObj.xml);
    req.end();
  });
}

function optionToString(options: CORSOptions) {
  const methods = options.methods.map((method: string) => {
    return `<AllowedMethod>${method}</AllowedMethod>`;
  }).join('');
  return `<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>${options.origin}</AllowedOrigin>
    ${methods}
  </CORSRule>
</CORSConfiguration>`;
}