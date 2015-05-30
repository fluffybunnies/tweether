
var fork = require('child_process').fork
,apipoller = require('./lib/apipoller')
,twitterwrite = require('./lib/twitterwrite')
,tweetWorker = __dirname+'/tweetworker.js'

,workers = []
,maxWorkers = 2

,matchesBuf = []
,matchesBufMaxLen = 10
,activeResponders = 0
,maxActiveResponders = 2



var ins = apipoller('articles',{
	data: {
		search_phrase: '*'
		,sort_by: 'content_id desc'
	}
	,initialBuffer: maxWorkers
	,poll: 60000
	,pollFor: 5
})
.on('data',function(article){
	console.log('GOT ARTICLE',article.id);
	var trackParam = getTwitterTrackParamFromArticle(article)
	if (!trackParam) return;

	if (workers.length == maxWorkers) {
		var oldestWorker = workers.shift();
		process.nextTick(function(){
			//oldestWorker.disconnect();
			oldestWorker.kill();
		});
	}

	var worker = fork(tweetWorker);
	workers.push(worker);

	worker.on('error',function(err){
		logError(err, 'child');
	});

	var removed = false
	,handleExit = function(code){
		if (removed) return;
		removed = true;
		var i = workers.indexOf(worker);
		if (i != -1) workers.splice(i,1);
	}

	worker.on('disconnect',function(){
		// if something else disconnected it, we may not receive an exit event
		handleExit(0);
	});

	worker.on('exit',function(code){
		handleExit(code);
	});

	worker.on('message',function(tweet){
		//console.log('GOT MATCH FROM WORKER\n'+JSON.stringify(tweet)+'\n\n');
		if (!isValidTweet(tweet)) return;
		console.log('GOT MATCH FROM WORKER\n'+tweet.text+'\n\n');
		if (canRespond()) {
			respond(article,tweet);
		} else {
			matchesBuf.push([article,tweet]);
			if (matchesBuf.length > matchesBufMaxLen) // buffer full
				matchesBuf.shift(); // drop oldest match
		}
	});

	worker.send(trackParam);
})


function getTwitterTrackParamFromArticle(article){
	// @todo: get track to work with locations
	return {
		track: 'kim kardashian,KimKardashian'
		//,locations: '-170.534369,23.830106,-52.497261,70.416383' // us/ca
		//follow: 'jewelmint'
	}
}

function isValidTweet(t){
	return t && t.user && t.user.screen_name ? true : false;
}

function canRespond(){
	return activeResponders < maxActiveResponders;
}

function respond(article,tweet){
	++maxActiveResponders;
	twitterwrite({
		text: '@'+tweet.user.screen_name+' Check out this sweet article! <a href="http://www.luckyshops.com/article/'+article.postName+'">'+article.postTitle+'</a>'
	},function(err){
		if (err) {
			logError(err, 'responding to tweet');
		}
		--maxActiveResponders;
		if (matchesBuf.length && canRespond())
			respond.apply(null, matchesBuf.shift());
	});
}

function logError(err,label){
	console.log('ERROR '+new Date,label,err);
}

