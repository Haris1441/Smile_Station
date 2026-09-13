/**
 * Small dependency-free development server for Smile Station.
 * Run with: npm start
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.sql': 'text/plain; charset=utf-8'
};

http.createServer((request, response) => {
  const urlPath = decodeURIComponent((request.url || '/').split('?')[0]);
  const requested = urlPath === '/' ? 'index.html' : urlPath.replace(/^[/\\]+/, '');
  const filePath = path.resolve(root, requested);

  // Never serve files outside this project directory.
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(error.code === 'ENOENT' ? 'Not found' : 'Unable to read file');
      return;
    }
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': types[extension] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache'
    });
    response.end(content);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Smile Station is running at http://localhost:${port}`);
  console.log('Press Ctrl+C to stop the local server.');
});
