const http = require('http');
const https = require('https');
const url = require('url');

class HttpClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.timeout = 30000;
  }

  async request(method, path, data = null) {
    const fullUrl = this.baseUrl + path;
    const parsed = url.parse(fullUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.path,
        method: method,
        headers: { 'Content-Type': 'application/json' }
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(this.timeout, () => req.destroy());
      
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  get(path) { return this.request('GET', path); }
  post(path, data) { return this.request('POST', path, data); }
  put(path, data) { return this.request('PUT', path, data); }
  delete(path) { return this.request('DELETE', path); }
}

module.exports = { HttpClient };