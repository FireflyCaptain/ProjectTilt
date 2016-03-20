
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});
var server_port= process.env.PORT || 3000;
app.listen(process.env.server_port, function () {
  console.log('Example app listening on port '+server_port);
});
