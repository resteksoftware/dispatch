let express = require('express')
let app = express()
let path = require('path')
let os = require('os')
let bodyParser = require('body-parser')
let fs = require('fs')
const PORT = 3001

app.use('/', express.static('dist-dispatch'));

app.get('/*', (req, res) => {
  res.sendFile(path.resolve('./dist-dispatch', 'index.html'))
})

let server = app.listen(PORT || 3001, function() {
  console.log('Listening on %s', PORT)
})
