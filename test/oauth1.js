/*
node ./test/oauth1.js 'http://localhost:3000/1.1/'
*/

var crypto = require('crypto')
//,request = require('hyperquest')
,request = require('request')

,urlPrefix = 'https://stream.twitter.com/1.1/'
,urlPath = 'statuses/sample.json' // 'statuses/filter.json'
,params = {} // {follow:'jewelmint'}
,method = 'post'

/*
,urlPrefix = 'https://api.twitter.com/1.1/'
,urlPath = 'statuses/user_timeline.json'
,params = { screen_name: 'jewelmint', count: 10 }
,method = 'get'
*/

,urlPrefix = process.argv[2] ? process.argv[2] : urlPrefix

,oauthInfo = require('../lib/oauth1')(urlPrefix+urlPath, params, method)
;
console.log(oauthInfo);

var buf = new Buffer(0)
,headers, statusCode, req, undef
;
headers = {
	'content-type': 'application/x-www-form-urlencoded'
	,'content-length': oauthInfo.data ? Buffer.byteLength(oauthInfo.data,'utf8') : 0
	,authorization: oauthInfo.authHeader
	,'user-agent': 'Tweether +https://github.com/fluffybunnies/tweether'
	//,host: require('url').parse(urlPrefix).host
	//,connection: 'Close'
	//,accept: '*/*'
}
req = request[method](oauthInfo.urlGet,{
	headers: headers
},function(err, res){
	if (err)
		return done(err);
	statusCode = res ? res.statusCode : undef;
})
.on('data',function(data){
	console.log('DATA',data.toString());
	buf = Buffer.concat([buf,data]);
})
.on('end',function(){
	done();
})
.on('error',function(err){
	done(err);
})
;
if (oauthInfo.data)
	req.write(oauthInfo.data);
function done(){
	done = function(){};
	console.log('DONE\n'+buf.toString());
}


