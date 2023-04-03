var app = require('express')(),
	bodyParser = require('body-parser'),
	backend = require('./backend')

// ----- Parse JSON requests

app.use(bodyParser.json())

// ----- Allow CORS

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Headers', 'Content-Type')
	res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE')
	res.header('Access-Control-Allow-Origin', '*')
	next()
})

// ----- The API implementation
