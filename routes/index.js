var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/stream', function(req,res,next) {
	request('http://q.nqminds.com/v1/timeseries/hub-gDik3J/'+req.query.gps + '?limit=10000', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res.send(body);
		}
	});
});

module.exports = router;
