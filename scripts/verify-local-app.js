const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css'
};

const server = http.createServer((req, res) => {
  const requestPath = req.url === '/' || req.url.startsWith('/?') ? 'index.html' : req.url.replace(/^\//, '');
  const filePath = path.join(process.cwd(), requestPath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('not found');
      return;
    }
    res.setHeader('Content-Type', mime[path.extname(filePath)] || 'text/plain');
    res.end(data);
  });
});

server.listen(8123, async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('pageerror', error => console.log('PAGEERROR_STACK:' + error.stack));
  page.on('console', message => console.log('CONSOLE_' + message.type().toUpperCase() + ':' + message.text()));

  await page.goto('http://127.0.0.1:8123/');
  const html = await page.content();
  console.log('HAS_MAINAPP=' + html.includes('<div id="mainApp">'));
  console.log('SNIP=' + html.slice(html.indexOf('<!-- ── MAIN APP ── -->'), html.indexOf('<!-- ── MAIN APP ── -->') + 120));

  await page.getByLabel('Username').fill('Barclays_Org');
  await page.getByLabel('Password').fill('PS');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(2500);

  const rowCount = await page.locator('#relTableBody tr').count().catch(() => -1);
  const buOptionCount = await page.locator('#tableBuFilter option').count().catch(() => -1);
  const nameButtonCount = await page.locator('.person-name-button').count().catch(() => -1);
  const mainAppClass = await page.locator('#mainApp').getAttribute('class').catch(() => 'MISSING');

  console.log('MAINAPP_CLASS=' + mainAppClass);
  console.log('ROWS=' + rowCount);
  console.log('TABLE_BU_OPTIONS=' + buOptionCount);
  console.log('NAME_BUTTONS=' + nameButtonCount);

  await browser.close();
  server.close();
});