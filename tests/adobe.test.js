const puppeteer = require('puppeteer')
const expect = require('chai').expect

var homeSupportUrl = 'https://www.dell.com/support/home/en-us'
var orderSupportUrl =
	'https://www.dell.com/support/order-status/en-us/order-support'

describe('eSupport Site Automated Testing', () => {
	let browser
	let page

	before(async function () {
		browser = await puppeteer.launch({
			headless: true, 		// false
			slowMo: 0, 				// 200
			devtools: true,			// false
			defaultViewport: { width: 1440, height: 800 },
		})
		page = await browser.newPage()
		// await page.setDefaultTimeout(10000)
		// await page.setDefaultNavigationTimeout(20000)

		await page.setCookie({
			name: 'login_email',
			value: 'set_by_cookie@domain.com',
			domain: '.paypal.com',
			url: 'https://www.paypal.com/',
			path: '/',
			httpOnly: true,
			secure: true,
		})
	})

	it('Should open the browser', async function () {})

	it('Should go to Home Support website', async function () {
		await page.goto(homeSupportUrl, { waitUntil: 'domcontentloaded' })
		await page.waitForTimeout(800)
	})

	it('Should open Order Support webpage', async function () {
		await page.goto(orderSupportUrl)
		await page.waitForSelector('#textOrderSearch')
	})

	it('Should fill order #320032144 in text field', async function () {
		await page.type('#textOrderSearch', '320032144', { delay: 0 })
		await page.waitForTimeout(800)
	})

	it("Should hit button 'Find My Order'", async function () {
		await page.waitForSelector('#btnFindOrder-mob')
		//await page.click('#btnFindOrder-mob')
		await page.keyboard.press('Enter')
	})

	it('Should open Order Details webpage', async function () {
		await page.waitForSelector('#dpid')
		await page.waitForTimeout(3200)

		var title = await page.title()
		expect(title).to.contain('Order Details | Dell US')
	})

	it('Should fail an expected clause', function () {
		expect().fail('Explicitly forces an error')
	})

	it('Should close the browser', async function () {})

	after(async function () {
		await browser.close()
	})
})
