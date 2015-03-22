
var ut = require('../lib/ut')
,config = require('../config.js')
;


require('../lib/oauth2').getBearerToken(function(err,token){
	if (err)
		return console.log('Error: ',err);
	ut.simpleReq('https://stram.twitter.com/1.1/statuses/sample.json',{
	//ut.simpleReq('https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=alecisawesome',{
		headers: {authorization: 'Bearer '+token}
	},function(err,data){
		console.log(err,data);
	});
});

