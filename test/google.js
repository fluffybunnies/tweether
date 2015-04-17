
var google = require('google')
;

google('site:www.luckyshops.com red',function(err,next,links){
	console.log(err,next,links);
});
