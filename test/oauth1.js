
var crypto = require('crypto')
//,request = require('hyperquest')
,request = require('request')

,urlPrefix = 'https://stream.twitter.com/1.1/'
,urlPath = 'statuses/sample.json' //'statuses/filter.json'
,params = {follow:'jewelmint'}
,method = 'post'

,urlPrefix = 'https://api.twitter.com/1.1/'
,urlPath = 'statuses/user_timeline.json'
,params = { screen_name: 'jewelmint', count: 10 }
,method = 'get'

,oauthInfo = require('../lib/oauth1')(urlPrefix+urlPath, params, method)
;


var buf = new Buffer(0)
,statusCode
;
request[method](oauthInfo.url,{
	headers: {
		'User-Agent': 'node'
		,'Content-Length': 0
		//,'Content-Type': 'application/x-www-form-urlencoded'
		,'Auth': oauthInfo.authHeader
		//,'Authorization': oauthInfo.authHeader
	}
},function(err, res){
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
;
function done(){
	done = function(){};
	console.log('DONE\n'+buf.toString());
}


