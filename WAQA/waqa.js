var tableify = require('tableify')
var fs = require('fs')

var pageURL = '' // https://www.dell.com/en-us

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

const { promisify } = require('util')
const puppeteer = require('puppeteer')
const { harFromMessages } = require('chrome-har')
// list of events for converting to HAR

//For Running Server, Details.
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: true })
var path = require('path')

//for pug
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

//Give permission to CSS files
app.use(express.static(path.join(__dirname, 'public')))

//Validator library
//const { check } = require('express-validator')

//Check if URL exists
const urlExists = require('url-exists')
var validPage
var server = app.listen(8080, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('Server running & listening at %s:%s Port', host, port)
})

//First Form - GET
app.get('/', function (req, res) {
	res.render('getURLForm')
})

app.get('/getAdobeCall', function (req, res) {
	//  res.sendFile(path.join(__dirname +'/getURLForm.html'));
	res.render('getURLForm', { caution: 'URL should start with (http/https)' })
})

app.post('/result', urlencodedParser, async function (req, res) {
	pageURL = req.body.url
	console.log(pageURL)
	if (!pageURL.includes('http://') && !pageURL.includes('https://')) {
		pageURL = 'http://' + pageURL
	}

	urlExists(pageURL, function (err, exists) {
		if (exists) {
			//res.end('Good URL');
			validPage = 1
		} else {
			var badurl = ''
			badurl += '<body>'
			badurl += '<br/><br/><br/><br/>'
			badurl += "<div align='center'>"
			badurl += '<h2> BAD URL </h2>'
			badurl += '</div>'
			badurl += '</body>'
			//res.send(badurl);
			console.log('Bad URL is:-' + pageURL)
			res.end(badurl)
		}
	})

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
			//console.log({ method, params });
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
			// sm.dell
			queryStringParameters =
				networkCalls.log.entries[i].request.queryString // Caught the adobe output here
		}
	}

	// Create a file with the Analytics data we need
	await promisify(fs.writeFile)(
		'Query-String-Parameters.json',
		JSON.stringify(queryStringParameters, undefined, 2)
	)

	var table = await tableify(queryStringParameters)

	//POST THE RESULT
	res.render('postResult', {
		urlVar: req.body.url,
		result: table,
	})

	console.log(pageURL)

	// Business Logic
	var props = await JSON.parse(
		fs.readFileSync('Query-String-Parameters.json', 'utf8')
	)

	//console.log(props);

	//console.log(props[0].name);
	//console.log(props[0].value);

	doesItHave(props, 'c2', 'us')
})

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
