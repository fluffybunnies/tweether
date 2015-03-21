
var request = require('request')
,ut = require('../lib/ut')
,config = require('../config.js')
;

var urlPrefix = 'https://stream.twitter.com/1.1/'
,urlPath = 'statuses/sample.json' //'statuses/filter.json', params={follow:'jewelmint'}

//urlPrefix = 'https://api.twitter.com/1.1/'
//urlPath = 'statuses/user_timeline.json?screen_name=alecisawesome'

require('../lib/oauth2').getBearerToken(function(err,token){
	if (err)
		return console.log('Error: ',err);

	var buf = new Buffer(0)
	,statusCode
	;
	request.get(urlPrefix+urlPath, {
		headers: {authorization: 'Bearer '+token}
	}, function(err,res){
		if (err)
			return done(err);
		console.log('CONNECTED');
		statusCode = res ? res.statusCode : undef;
	})
	.on('data',function(data){
		console.log('DATA',data);
		buf = Buffer.concat([buf,data]);
	})
	.on('end',function(){
		done();
	})
	.on('error',function(err){
		done(err);
	})
	function done(err){
		done = function(){};
		console.log('DONE',buf.toString());
	}
});


