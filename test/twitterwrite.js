

//var twitterwrite = require('../lib/twitterwrite')

var twitterstream = require('../lib/twitterstream')


var s = twitterstream('https://api.twitter.com/1.1/statuses/update.json',{
	data: {
		status: 'yooo @funwithjoey'
		,in_reply_to_status_id: 604702524134686720 // use this in actual app, must reference author in status
		//,in_reply_to_screen_name: 'funwithjoey'
	}
	,method: 'post'
})
.on('softerror',function(err){
	console.log('softerror',err);
})
.on('error',function(err){
	console.log('error',err);
})
.on('data',function(data){
	console.log('data',data);
})

