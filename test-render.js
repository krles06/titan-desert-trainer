import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log('Root HTML length:', rootHtml.length);
  console.log('Root HTML snippet:', rootHtml.substring(0, 200));

  await browser.close();
})();
