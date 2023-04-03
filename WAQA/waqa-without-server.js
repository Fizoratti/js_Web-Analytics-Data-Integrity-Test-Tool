// Used on events for converting to HAR
const { promisify } = require('util')
const puppeteer = require('puppeteer')
const { harFromMessages } = require('chrome-har')
var fs = require('fs')

var pageURL = 'https://www.dell.com/en-us' // https://www.dell.com/en-us

var networkCalls = '' // From Chrome DevTools
var queryStringParameters = [] // Adobe Analytics

//validators
const events = []

//From getNetCal
const observe = [
	'Page.loadEventFired',
	'Page.domContentEventFired',
	'Page.frameStartedLoading',
	'Page.frameAttached',
	'Network.requestWillBeSent',
	'Network.requestServedFromCache',
	'Network.dataReceived',
	'Network.responseReceived',
	'Network.resourceChangedPriority',
	'Network.loadingFinished',
	'Network.loadingFailed',
]

async function run() {
	console.log(pageURL)

	// event types to observe
	const browser = await puppeteer.launch({ headless: true })
	const page = await browser.newPage()

	// register events listeners
	const client = await page.target().createCDPSession()
	await client.send('Page.enable')
	await client.send('Network.enable')
	observe.forEach((method) => {
		client.on(method, (params) => {
			events.push({ method, params })
			// console.log({ method, params })
		})
	})

	// perform tests
	await page.goto(pageURL)
	await browser.close()

	// convert events to HAR file
	const har = harFromMessages(events)
	//console.log(events);

	await promisify(fs.writeFile)(
		'networkCalls.har',
		JSON.stringify(har, undefined, 4)
	)
	console.log('File created successfully')

	networkCalls = await JSON.parse(fs.readFileSync('networkCalls.har', 'utf8'))

	// Loop to get the adobe network call.
	var x
	for (i in networkCalls.log.entries) {
		x += networkCalls.log.entries[i]
		if (networkCalls.log.entries[i].request.url.includes('b/ss')) {
			// 'b/ss' returns the same as searching for 'sm.dell'
			queryStringParameters =
				networkCalls.log.entries[i].request.queryString // Caught the adobe output here
		}
	}

	// Create a file with the Analytics data we need
	await promisify(fs.writeFile)(
		'Query-String-Parameters.json',
		JSON.stringify(queryStringParameters, undefined, 2)
	)

	// Business Logic
	var props = await JSON.parse(
		fs.readFileSync('Query-String-Parameters.json', 'utf8')
	)

	doesItHave(props, 'c2', 'us')
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
}
