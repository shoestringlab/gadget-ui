const express = require('express')
const app = express()
const cuid = require('cuid')
const fs = require('fs')
const bodyParser = require('body-parser')

const fileService = require('./test/model/fileservice')
const tempPath = './test/upload/temp/'
const { resolve } = require('path')

app.use(express.static('./'))
app.use('/lib/feather-icons', express.static('./node_modules/feather-icons'))
//app.use( "/dist", express.static( '../dist' ) );
//app.use( "/", express.static( './' ) );

let options = {
	inflate: true,
	limit: '1024kb',
	type: 'application/octet-stream',
}
app.use(bodyParser.raw(options))

app.post('/upload', function (req, res) {
	let args = {
		id: req.get('x-id'),
		filename: req.get('x-filename'),
		filesize: parseInt(req.get('x-filesize'), 10),
		part: parseInt(req.get('x-filepart'), 10),
		parts: parseInt(req.get('x-parts'), 10),
		contentlength: parseInt(req.get('Content-Length'), 10),
		mimetype: req.get('x-mimetype'),
	}

	if (args.part === 1) {
		args.id = cuid()
	}

	let tempFile = cuid()
	//fs.writeFileSync( tempPath + args.id, req.rawBody );
	let wstream = fs.createWriteStream(tempPath + tempFile)
	wstream.write(req.body)
	wstream.end()

	fileService
		.upload(
			args.id,
			tempPath + tempFile,
			args.part,
			args.parts,
			args.filename,
			args.filesize
		)
		.then(function (file) {
			if (args.part === args.parts) {
				res.send(JSON.stringify(file))
			} else {
				res.set('x-Id', args.id)
				res.end('')
			}
		})
		.catch(function (error) {
			res.set('Status-Code', 500)
			res.send(error)
		})
})

// set our listener
var server = app.listen(8000, function () {})
