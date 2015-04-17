
var apistream = require('../lib/apistream')
,si = require('search-index')()
;

startFetching();

function startFetching(){
	//apistream('store/8/articles?search_phrase=*&sort_by=content_id%20asc&base_filters[type]=article&base_filters[status]=publish')
	apistream('store/8/articles?search_phrase=*&sort_by=content_id%20asc')
	.on('softerror',function(err){
		console.log('softerror','articles','startFetching',err);
	})
	.on('error',function(err){
		console.log('ERROR','articles','startFetching',err);
	})
	.on('data',function(data){
		si.add({
			batchName: 'sup'
			,filters: ['postTitle']
		},data,function(err){
			if (err)
				return console.log('SI ERROR',err);
			console.log('SI DONE',data.postTitle);
		});
	})
	.on('end',function(){
		console.log('API END');
		si.search({postTitle:['sad']}, function(err, results) {
			console.log('SI SEARCH',err,results);
		});
	})
	.on('close',function(){
		console.log('API CLOSE');
	})
	;
}

