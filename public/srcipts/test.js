import puppeteer from 'puppeteer-core'

export default {
  label: '测试',
  fn: async () => {
    let browser
    try {
      browser = await puppeteer.launch({
        executablePath: CHROME_EXE_PATH,
        headless: false,
        defaultViewport: {
          width: 700,
          height: 700
        },
        slowMo: 100,
        args: ['--disable-gpu', '--disable-infobars']
      })

      const page = await browser.newPage()
      await page.goto('https://finance.sina.com.cn/china/')
      await page.content()

      console.log('完成！')
      browser.close()
    } catch (error) {
      console.log(error)
      browser.close()
    }
  }
}
