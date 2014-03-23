var http = require('http');

var s = http.createServer( function (req, res){
  console.log(req, res);
  res.writeHead(200);
  req.on('data', function(data){
    console.log(data);
  });

  req.end("hi there from node");
}).listen(1337);

s.on('connect', function(req, cSock, head){
  console.log('Connect', req,cSock,head);
})


var io = require('socket.io').listen(1336);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
