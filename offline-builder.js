/** Builds a self-contained review package with local copies of visual assets. */
const fs = require('node:fs/promises');
const path = require('node:path');
const https = require('node:https');

const source = __dirname;
const destination = path.join(source, 'outputs', 'Smile-Station-Offline-Review');
const files = ['index.html', 'app.js', 'styles.css', 'server.js', 'package.json', 'README.md'];

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Smile-Station-Offline-Builder' } }, response => {
      if ([301, 302, 307, 308].includes(response.statusCode) && response.headers.location) {
        response.resume();
        resolve(download(new URL(response.headers.location, url).href));
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Download failed (${response.statusCode}) for ${url}`));
        return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function build() {
  await fs.rm(destination, { recursive: true, force: true });
  await fs.mkdir(path.join(destination, 'assets'), { recursive: true });
  for (const file of files) await fs.copyFile(path.join(source, file), path.join(destination, file));

  const appPath = path.join(destination, 'app.js');
  let app = await fs.readFile(appPath, 'utf8');
  const urls = [...new Set(app.match(/https:\/\/images\.unsplash\.com\/[^'"`]+/g) || [])];
  for (let i = 0; i < urls.length; i += 1) {
    const localPath = `assets/photo-${i + 1}.jpg`;
    try {
      const bytes = await download(urls[i]);
      await fs.writeFile(path.join(destination, localPath), bytes);
    } catch (error) {
      const fallback = `assets/photo-${i + 1}.svg`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#092f77"/><stop offset="1" stop-color="#dbeaff"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="950" cy="130" r="220" fill="#fff" fill-opacity=".14"/><text x="90" y="390" fill="#fff" font-size="78" font-family="Arial, sans-serif" font-weight="700">Smile Station</text><text x="94" y="455" fill="#dceafe" font-size="34" font-family="Arial, sans-serif">Premium Dental Practice</text></svg>`;
      await fs.writeFile(path.join(destination, fallback), svg);
      app = app.split(urls[i]).join(fallback);
      console.warn(`Using offline fallback for unavailable image ${i + 1}.`);
      continue;
    }
    app = app.split(urls[i]).join(localPath);
  }
  await fs.writeFile(appPath, app);

  const cssPath = path.join(destination, 'styles.css');
  let css = await fs.readFile(cssPath, 'utf8');
  css = css.replace(/@import url\([^;]+;\n/, '/* Web font removed for offline review; system fonts are used. */\n');
  await fs.writeFile(cssPath, css);
  await fs.writeFile(path.join(destination, 'OFFLINE-REVIEW.txt'), [
    'Smile Station offline review package',
    '',
    '1. Install Node.js 18 or newer if it is not already installed.',
    '2. Open a terminal in this folder.',
    '3. Run: npm start',
    '4. Open: http://localhost:4173',
    '5. Owner portal: http://localhost:4173/#admin',
    '',
    'The visual assets are included locally. Google Maps directions need an internet connection when clicked.'
  ].join('\n'));
  console.log(`Offline review package built with ${urls.length} local images.`);
}

build().catch(error => { console.error(error.message); process.exitCode = 1; });
