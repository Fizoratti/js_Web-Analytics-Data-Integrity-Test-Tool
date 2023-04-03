const puppeteer = require('puppeteer')
const expect = require('chai').expect

var homeSupportUrl = 'https://www.dell.com/support/home/en-us'

describe('eSupport Site Automated Testing', () => {
	let browser
	let page

	before(async function () {
		browser = await puppeteer.launch({
			headless: true,
			slowMo: 0,
			devtools: true,
		})
		page = await browser.newPage()
		await page.setViewport({ width: 1234, height: 567 })
		await page.setDefaultTimeout(10000)
		await page.setDefaultNavigationTimeout(20000)
	})

	it('', () => {
		await page.goto('dell.com', { waitUntil: 'networkidle0' })
	})

	after(async function () {
		await browser.close()
	})
})
