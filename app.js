
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var hbs = require('hbs');
var io = require('socket.io');
var request = require('request'); //https://github.com/mikeal/request

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('io',io);
app.engine('html', hbs.__express);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.post('/send_voting_result', function(req, res){
  var result = JSON.parse(req.body.kandidat);
  var total_voters = JSON.parse(req.body.total_voters);
  console.log("Received POST");
  console.log(result.data);
  io.of('/voting_result').emit('getResult', {result : result.data, total_voters : total_voters});
  res.send("Data recieved");
});

app.get('/voting_result', function(req, res){
    res.render('voting_result', { title: 'Express', msg: 'This is Result page'});
});

io.set('log level',1);

//-- Get socket for /voting_result
var voting_result = io.of('/voting_result');
voting_result.on('connection', function (vote_socket) {
  vote_socket.on('requestLatestResult', function(vote_socket2) {
    request({
      uri : "http://localhost/portal_alumni_online/voting_api/generateVotingResult",
      method: "GET"
    }, function(e, r, body) {
      if (typeof body === 'undefined') {
        console.log("No response from related URL");
        return;
      }
      var jsonResult = JSON.parse(body);
      var kandidat = JSON.parse(jsonResult.kandidat);
      var total_voters = JSON.parse(jsonResult.total_voters);

      console.log("Request Result");
      console.log(kandidat.data);
      voting_result.emit('getResult', {result : kandidat.data, total_voters : total_voters});
    });
  });
});