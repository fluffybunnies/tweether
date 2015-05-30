
var twitterstream = require('../lib/twitterstream')

module.exports = function(postData, cb){
	console.log('TWITTER WRITE',postData.status);
	process.nextTick(function(){
		cb()
	})
	return;
	var done = function(err, res){
		cb(err,res)
		cb = function(){}
	}
	var res;
	twitterstream('https://api.twitter.com/1.1/statuses/update.json',{
		data: postData
		,method: 'post'
	})
	/*.on('softerror',function(err){
		done(err);
	})*/
	.on('data',function(data){
		done(false,res=data);
	})
	.on('exit',function(code){
		done(false,res);
	})
}

