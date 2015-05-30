
var request = require('request')
//var request = require('hyperquest')
,split = require('split')
,through = require('through')
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
	//console.log(oauthInfo);

	var s = request[method](oauthInfo.urlGet,{
		headers: headers
		,body: oauthInfo.data
	},function(err, res){
		//if (err)
		//	return handleError(err);
		//console.log('connected',err,res);
	})
	.pipe(split('\r\n'))
	.pipe(through(function(data){
		//console.log(data.toString()+'\n\n');
		try {
			var o = JSON.parse(data.toString());
			if (!(typeof o == 'object' && typeof o.text == 'string'))
				return s.emit('softerror', new Error('failed to parse item: '+data.toString()));
			this.queue(o);
		} catch (e) {
			s.emit('softerror',e);
		}
	}))
	/*
	.on('data',function(data){
		console.log('twitterstream data');
	})
	.on('end',function(){
		console.log('twitterstream end');
	})
	.on('error',function(err){
		console.log('twitterstream error');
		//handleError(err);
	})
	;

	function handleError(err){
		console.log('handleError',err);
	}
	*/

	return s;
}


/*
@todo: test this for speed

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
	//console.log(oauthInfo);

	var buf = ''
	,miniBuf = ''
	,s
	;

	s = request[method](oauthInfo.urlGet,{
		headers: headers
		,body: oauthInfo.data
	},function(err, res){
		if (err)
			return handleError(err);
		//console.log('connected',err,res);
	})
	.pipe(through(function(data){
		var chars = data.toString()
		,i,c,char
		;
		for (i=0,c=chars.length;i<c;++i) {
			char = chars[i];
			if (char == '\r') {
				miniBuf += char;
				continue;
			}
			if (miniBuf == '\r') {
				if (char == '\n') {
					try {
						this.queue(JSON.parse(buf));
					} catch (e) {
						s.emit('softerror',e);
					}
					buf = '';
				} else {
					buf += miniBuf;
				}
				miniBuf = '';
			}
			buf += char;
		}
	}))
	.on('data',function(data){
		console.log('twitterstream data');
	})
	.on('end',function(){
		console.log('twitterstream end');
	})
	.on('error',function(err){
		handleError(err);
	})
	;

	function handleError(err){
		console.log('handleError',err);
	}

	return s;
}
*/