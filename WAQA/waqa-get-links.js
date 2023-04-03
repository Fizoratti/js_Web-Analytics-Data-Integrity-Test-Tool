// # Used on events for converting to HAR
const puppeteer = require('puppeteer')
const PuppeteerHar = require('puppeteer-har')
const Papa = require('papaparse')
const { promisify } = require('util')
const fs = require('fs')

var urls = []
var homePageURL = ''
var supportPageURL = ''

async function run() {
	console.log('\n # Loading URLs \n')

	urls = Papa.parse(await fs.readFileSync('URLs.csv', 'utf8'), {
		complete: function (results) {
			console.log(results.data)
		},
	})
	homePageURL = urls.data[0][0]
	supportPageURL = urls.data[0][1]
	console.log('\nTarget URL:  ' + homePageURL)

	const browser = await puppeteer.launch({ headless: true })
	const page = await browser.newPage()
	await page.goto(homePageURL)

	const pageLinks = await page.$$eval('a', (links) => {
		links = links
			.filter((a) => {
				if (a.href) {
					const sameOrigin =
						new URL(location).origin === new URL(a.href).origin
					const samePage = a.href === location.href
					return !samePage && sameOrigin
				}
			})
			.map((a) => a.href)

		return Array.from(new Set(links))
	})

	await browser.close()

	console.log('\n # Writing files \n')

	await write('Page-Links.json', pageLinks)
}

run()

async function write(file, data) {
	await promisify(fs.writeFile)(file, JSON.stringify(data, undefined, 2))
	console.log('File ' + file + ' created successfully!')
}

async function read(file) {
	return await JSON.parse(fs.readFileSync(file, 'utf8'))
}
