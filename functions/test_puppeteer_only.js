const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')

;(async () => {
  const browser = await puppeteer.launch({
    devtools: true,
    defaultViewport: {
      width: 915,
      height: 600,
      isLandscape: true
    },
    executablePath: "/usr/bin/chromium-browser",
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote'
    ]
  })

  const page = await browser.newPage()
  await page.goto(local_vars.app.url, { waitUntil: ['domcontentloaded'] })
  await page.waitForSelector('img')
  console.log('title of the page', await page.title())
  const test = await page.$$('#connexionCandidat')

  const delay = ms => new Promise(res => setTimeout(res, ms))
  debugger
  await delay(3000)
  await browser.close()
})
