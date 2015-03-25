

//var request = require('hyperquest')
var request = require('request')
,through = require('through2')
,oauth = require('./oauth1')
;


module.exports = function(path, opts){

	var method = opts.method || 'post'
	,oauthInfo = oauth(path, opts.data, method)
	,headers = {
		'content-length': oauthInfo.data ? Buffer.byteLength(oauthInfo.data,'utf8') : 0
		,authorization: oauthInfo.authHeader
		,'user-agent': 'Tweether +https://github.com/fluffybunnies/tweether'
	}
	;

	if (method == 'post')
		headers['content-type'] = 'application/x-www-form-urlencoded';
	console.log(oauthInfo);

	var s = request[method](oauthInfo.urlGet,{
		headers: headers
	},function(err, res){
		if (err)
			return handleError(err, res);
		//console.log('connected',err,res);
	})
	.on('data',function(){
	})
	.on('end',function(){
	})
	.on('error',function(){
	})
	//.pipe(process.stdout)
	;

	if (oauthInfo.data)
		s.write(oauthInfo.data);

	function handleError(err, res){
		console.log('handleError',err);
	}

	return s;

}

