
var twitterstream = require('./lib/twitterstream')
,s = null

process.on('message',function(message){
	if (s || typeof message != 'object') return;
	s = twitterstream('https://stream.twitter.com/1.1/statuses/filter.json',{
		data: message
	})
	.on('softerror',function(err){
		//console.log('softerror',err);
	})
	/* dont catch error here
	.on('error',function(err){
		//console.log('error',err);
	})*/
	.on('data',function(data){
		process.send(data);
	})
})

/*
process.on('disconnect',function(){
	handleExit(0);
})

function handleExit(){
	if (s) 
		s.destroy();
}
*/