
var ut = require('../lib/ut')
,config = require('../config.js')
;

module.exports.getBearerToken = function(cb){
	var auth = new Buffer(ut.encode_rfc3986(config.twitterConsumerKey)+':'+ut.encode_rfc3986(config.twitterConsumerSecret))
		.toString('base64')
	,params = 'grant_type=client_credentials'
	;
	ut.simpleReq('https://api.twitter.com/oauth2/token','post',{
		headers: {
			authorization: 'Basic '+auth
			,'content-type': 'application/x-www-form-urlencoded'
			//,'content-length': params.length
		}
	},function(err,data){
		if (err)
			return cb(err);
		try {
			data = JSON.parse(data);
			if (!data.access_token)
				return cb(data.errors?data.errors:'unexpected response');
			cb(false, data.access_token);
		} catch (e){
			cb(e);
		}
	}).write(params);
}
