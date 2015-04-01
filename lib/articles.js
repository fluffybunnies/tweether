
var apistream = require('./apistream')
,config = require('../config.js')
,level = require('level')(__dirname+'/../'+config.leveldb.engines)
,subLevel = require('level-sublevel')(level)
,articlesDb = subLevel.sublevel('articles')
,delim = 'ÿ'
,ignore = {
	'the': true
	,'a': true
	,'at': true
	,'with':  true
	,'in': true
	,'on': true
	,'to': true
	,'for': true
}
;

module.exports.startFetching = function(){
	apistream('store/8/articles?search_phrase=*&sort_by=content_id%20asc&base_filters[type]=article&base_filters[status]=publish')
	.on('softerror',function(err){
		console.log('softerror','articles','startFetching',err);
	})
	.on('error',function(err){
		console.log('ERROR','articles','startFetching',err);
	})
	.on('data',function(data){
		var key = formatKey(data.postTitle);
		console.log(key);process.exit();
		//console.log('articlesDb.put('+key+', data)');
		//articlesDb.put(key, data);
	})
}

module.exports.findBestMatch = function(){

}

function formatKey(str){
	var words = str.split(formatKey.wordSep)
	,pieces = []
	;
	words.forEach(function(word){
		word = word.replace(formatKey.ignoreAfter,'');
		if (!word || word[0] != word[0].toUpperCase())
			return;
		word = word.toLowerCase().replace(formatKey.ignoreAll,'');
		if (!ignore[word])
			pieces.push(word);
	});
	return pieces.sort().join(delim);
}
formatKey.wordSep = / +/;
formatKey.ignoreAfter = /[^a-zA-Z].*$/;
formatKey.ignoreAll = /[^a-z]/g;


