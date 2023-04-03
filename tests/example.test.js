const puppeteer = require('puppeteer')
const expect = requite('chai').expect

// describe() is a wrapper around out test context
describe('My first Puppeteer Test', () => {
	// it() is a step of the test
	it('Should launch the browser', async function () {
		const browser = await puppeteer.launch({
			headless: false,
			slowMo: 500,
			devtools: true,
		})
		const page = await browser.newPage()
		await page.goto('http://example.com/')
		await page.waitForSelector('h1')
		await page.waitForTimeout(30000)

		await browser.close()
	})
})

describe('Screenshot Test', () => {
	it('Should take a screenshot', async function () {
		const browser = await puppeteer.launch({
			headless: false,
			slowMo: 500,
			devtools: true,
		})

		const page = await browser.newPage()
		await page.setViewport({ width: 1980, height: 800 })
		await page.goto('https://www.dell.com/en-us')
		await page.screenshot({
			path: 'example.png',
			fullPage: true,
		})

		await browser.close()
	})
})

describe('Example tests', function () {
	var answer = 42

	// AssertionError: expected 42 to equal 43.
	expect(answer).to.equal(43)

	// AssertionError: topic [answear]: expected 42 to equal 43.
	expect(answer, 'topic [answer]').to.equal(43)
})
