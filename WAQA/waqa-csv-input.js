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
	const har = new PuppeteerHar(page)
	await har.start()
	await page.goto(homePageURL)
	var events = await har.stop()
	await browser.close()

	console.log('\n # Writing files \n')

	await write('Network-Calls.har', events)
	var networkCalls = await read('Network-Calls.har')
	var queryStringParameters = [] // # Adobe Analytics data

	// # Loop to get the adobe network call.
	var x = []
	for (i in networkCalls.log.entries) {
		// x = x.concat(networkCalls.log.entries[i].request.url.includes('b/ss'))
		if (networkCalls.log.entries[i].request.url.includes('b/ss')) {
			// 'b/ss' returns the same as searching for 'sm.dell'
			queryStringParameters = queryStringParameters.concat(
				networkCalls.log.entries[i].request.queryString
			) // Caught the adobe output here
		}
	}
	// await write('Entries-var-x.json', x)

	// // # Create a file with the Analytics data we need
	await write('Query-String-Parameters.json', queryStringParameters)

	console.log('\n # Report \n')

	doesItHave(queryStringParameters, 'c2', 'us')
}

run()

function doesItHave(props, name, value) {
	for (i in props) {
		if (props[i].name == name) {
			console.log('This page does have a ' + name + ' variable')

			if (props[i].value == value) {
				console.log('It is ' + value)
			} else {
				console.log('It is *not* ' + value)
			}

			console.log(name + ': ' + props[i].value)
		}
	}
	console.log('\n')
}

async function write(file, data) {
	await promisify(fs.writeFile)(file, JSON.stringify(data, undefined, 2))
	console.log('File ' + file + ' created successfully!')
}

async function read(file) {
	return await JSON.parse(fs.readFileSync(file, 'utf8'))
}
