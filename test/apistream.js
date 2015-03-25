/*
node ./test/apistream.js

todo test
	- various errors, should reconnect
*/

var apistream = require('../lib/apistream')
;


apistream('https://stream.twitter.com/1.1/statuses/filter.json',{
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
	console.log('data',data.toString());
})
;

/*
apistream('https://stream.twitter.com/1.1/statuses/sample.json',{
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

