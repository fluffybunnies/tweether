

var querystring = require('querystring')
,request = require('hyperquest')
,crypto = require('crypto')
,config = require('../config.js')
;

module.exports.get = get;

function get(path, data, cb){
	if (data instanceof Function)
		cb = data;
	if (typeof data != 'object')
		data = {};
	path = 'store/8/'+path;

	var time = (Date.now()/1000).toFixed(0) // test speed of toFixed(0) vs floor
	,authHash = crypto.createHash('md5').update(config.api.secret+''+time).digest('hex')
	,url = config.api.endpoint+'/v'+config.api.version+'/'+path
	,buf = new Buffer('')
	,statusCode,undef
	;

	data.sig_time = time;
	url = url + (url.indexOf('?') == -1 ? '?' : '&') + querystring.stringify(data);

	//console.log('curl -v \'http://'+config.api.app+':'+authHash+'@'+url.replace(/^https?:\/\//,'')+'\' && echo');

	request.get(url,{
		auth: config.api.app+':'+authHash
	},function(err, res){
		if (err)
			return done(err);
		statusCode = res ? res.statusCode : undef;
	})
	.on('data',function(data){
		buf = Buffer.concat([buf,data]);
	})
	.on('end',function(){
		done();
	})
	.on('error',function(err){
		done(err);
	})
	;

	function done(err){
		done = function(){};
		var res = null;
		try {
			res = JSON.parse(buf.toString());
		} catch (e) {
			if (!err)
				err = e;
		}
		if (!err && res && res.code)
			err = res;
		cb(err, res, statusCode);
	}
}
