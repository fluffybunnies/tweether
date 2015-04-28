/*
node ./test/twitterstream.js

todo test
	- various errors, should reconnect
*/

var twitterstream = require('../lib/twitterstream')
,config = require('../config.js')
;

/*
var level = require('level')(__dirname+'/../'+config.leveldb.engines)
,subLevel = require('level-sublevel')(level)
,articlesDb = subLevel.sublevel('articles')
,lev = require('fast-levenshtein')
*/

//var google = require('google');

var GoogleSearch = require('google-search')
,googleSearch = new GoogleSearch({
	key: config.google.key
	,cx: config.google.cx
});


var s = twitterstream('https://stream.twitter.com/1.1/statuses/filter.json',{
	data: {
		//locations: '-170.534369,23.830106,-52.497261,70.416383' // us/ca
		track: '#KristenStewart'
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
	if (data.entities.hashtags && data.entities.hashtags.length)
		console.log('HASHTAGS\n',data.entities.hashtags);
	console.log(JSON.stringify(data)+'\n');
	//console.log('twitterstream test data',data);


	var tweet = data
	,importantWords = []
	tweet.text.split(' ').forEach(function(word){
		if (word && word.charAt(0) == word.charAt(0).toUpperCase() && /[a-zA-Z]/.test(word.charAt(0)))
			importantWords.push(word);
	});
	if (importantWords.length > 3) {
		var search = importantWords.join(' ');
		googleSearch.build({
			q: search,
			start: 0,
			//fileType: 'pdf',
			//gl: 'tr', //geolocation, 
			//lr: 'lang_tr',
			num: 1,
			siteSearch: 'http://www.luckyshops.com'
		},function(err,data) {
			//console.log(err,data);
			//console.log('\nwefwefwe');
		});
		/*
		var search = 'site:www.luckyshops.com '+importantWords.join(' ');
		google(search,function(err,next,links){
			if (err)
				return console.log('ERROR',err);
			if (!links[0])
				return;
			//s.destroy();
			//console.log(tweet.text+'\n\n'+search+'\n\n'+JSON.stringify(links[0])+'\n\n');
			console.log(tweet.user.screen_name+': '+tweet.text);
			console.log('LuckyMagazine: @'+tweet.user.screen_name+' Check this out! <a href="'+links[0].link+'">'+links[0].title+'</a>');
			console.log('\n\n');
		});
		*/
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

