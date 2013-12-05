
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express', msg: 'This is index page' });
};

// POST
exports.get_result = function(req, res){
  var result = JSON.parse(req.body.kandidat);
  console.log("This is POST Result");
  console.log(result.data);
  io.sockets.emit('my other event', req.body);
  //res.render('voting_result', { title: 'Voting Result', msg: 'This is index page', kandidat : kandidat });
};

// GET
exports.generate_result = function(req, res){
	console.log("Generate Result inside");
  	res.render('voting_result', { title: 'Express', msg: 'This is Result page'});
};