/*
node ./test/twitterstream.js

todo test
	- various errors, should reconnect
*/

var twitterstream = require('../lib/twitterstream')
;

/*
var config = require('../config.js')
,level = require('level')(__dirname+'/../'+config.leveldb.engines)
,subLevel = require('level-sublevel')(level)
,articlesDb = subLevel.sublevel('articles')
,lev = require('fast-levenshtein')
*/


var s = twitterstream('https://stream.twitter.com/1.1/statuses/filter.json',{
	data: {
		locations: '-170.534369,23.830106,-52.497261,70.416383' // us/ca
		//locations: '-122.75,36.8,-121.75,37.8' // sf
		//follow: 'jewelmint'
		//track: 'pizza'
	}
})
.on('softerror',function(err){
	console.log('softerror',err);
})
.on('error',function(err){
	console.log('error',err);
})
.on('data',function(data){
	console.log('twitterstream test data');
	//console.log(JSON.stringify(data)+'\n\n');

	var tweet = data
	,importantWords = []
	tweet.text.split(' ').forEach(function(word){
		if (word && word.charAt(0) == word.charAt(0).toUpperCase())
			importantWords.push(word);
	});
	if (importantWords.length > 3) {
		var search = 'site:www.luckyshops.com '+importantWords.join(' ');
		require('google')(search,function(err,next,links){
			if (!err && links.length) {
				s.destroy();
				console.log(tweet.text+'\n\n'+search+'\n\n'+JSON.stringify(links)+'\n\n');
			}
		});
	}

	/*
	var tweet = data;
	s.destroy();
	articlesDb.createReadStream({}).on('data',function(data){
		var articleTitle = JSON.parse(data.value).postTitle;
		lev.getAsync(articleTitle, tweet.text, function (err, distance) {
			if (err)
				return console.log(err);
			//console.log(articleTitle);
		  //console.log(err, distance);
		  if (distance < 50)
		  	console.log(distance+'\n'+articleTitle+'\n'+tweet.text+'\n\n');
		});
	})
	*/
})
;

/*
twitterstream('https://stream.twitter.com/1.1/statuses/sample.json',{
	data: {}
})
.on('softerror',function(err){
	console.log('softerror',err);
})
.on('error',function(err){
	console.log('error',err);
})
.on('data',function(data){
	console.log('data',data.toString());
})
;
*/

