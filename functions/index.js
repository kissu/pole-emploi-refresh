const functions = require('firebase-functions')
const chromium = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')
const admin = require('firebase-admin')

const local_vars = functions.config()
admin.initializeApp()

exports.helloWorld = functions
  .runWith({
    memory: '2GB',
    timeoutSeconds: 300,
  })
  .https.onRequest(async (request, response) => {
    const browser = await puppeteer.launch({
      devtools: local_vars.app.local_dev === true, // if true, this also runs headless: false, DON'T set it in cloud
      slowMo: 0,
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 915,
        height: 600,
        isLandscape: true,
      },
      executablePath: local_vars.app.firebase_chromium_exe_path || (await chromium.executablePath),
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
      ],
    })

    try {
      const page = await browser.newPage()
      // await page.setRequestInterception(true)
      await page.goto(local_vars.app.url)
      await page.waitFor('#identifiant')
      await page.type('#identifiant', local_vars.app.username)
      await page.keyboard.press('Enter')
      await page.waitFor('#lienAccessible')
      const link = await page.$('#lienAccessible')

      const accessibleText = await page.evaluate(link => link.innerText, link)

      if (accessibleText === 'Version accessible') {
        await page.click('#lienAccessible')
        await page.waitFor('#utilisation_clavier')
        const checkbox = await page.$('#utilisation_clavier')
        // console.log(await (await checkbox.getProperty('checked')).jsonValue())
        await checkbox.click()
        await page.click('button[type="submit"]')
      }

      await page.waitFor('#password')
      await page.type('#password', local_vars.app.password)
      await page.type('#codepostal', local_vars.app.postal_code)
      await page.keyboard.press('Enter')
      await page.waitForNavigation({ waitUntil: 'networkidle2' })

      if (!!(await page.$('.glz-pe-info-popup-close'))) {
        // if ((await page.waitForSelector('.glz-pe-info-popup-closee', { timeout: 3000 })) != null) {
        await page.click('.glz-pe-info-popup-close')
      }
      debugger

      if (local_vars.app.local_dev === false) {
        response.send('function properly finished !')
      }
    } catch (e) {
      console.trace('error >>', e)
      if (local_vars.app.local_dev === false) {
        response.status(500).send('error here >>', e)
      }
    } finally {
      // const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
      // await delay(3000)
      // await browser.close()
    }
  })

if (local_vars.app.local_dev === true) {
  exports.helloWorld()
}
