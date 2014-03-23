var http = require('http');

http.createServer( function (req, res){
  console.log(req, res);
  res.writeHead(200);
  req.on('data', function(data){
    console.log(data);
  });

  req.end("hi there from node");
}).listen(1337);

