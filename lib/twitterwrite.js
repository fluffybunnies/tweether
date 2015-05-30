
module.exports = function(opts,cb){
	console.log('TWITTER WRITE',opts.text);
	process.nextTick(function(){
		cb()
	})
}

