
//var request = require('hyperquest')
var request = require('request')

module.exports.simpleReq = function(/*url, method, opts, cb*/){
	var buf = new Buffer(0)
	,url,method,opts,cb
	,statusCode,undef
	;
	for (var i=0;i<arguments.length;++i) {
		switch (typeof arguments[i]) {
			case 'string': url ? (method = arguments[i]) : (url = arguments[i]); break;
			case 'object': opts = arguments[i]; break;
			case 'function': cb = arguments[i];
		}
	}
	return request[method||'get'](url, opts, function(err,res){
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
	function done(err){
		done = function(){};
		cb(err, buf.toString());
	}
}

module.exports.encode_rfc3986 = function(v){
	return encodeURIComponent(v)
	.replace(/\!/g, '%21')
	.replace(/\*/g, '%2A')
	.replace(/\'/g, '%27')
	.replace(/\(/g, '%28')
	.replace(/\)/g, '%29')
}

module.exports.sortByKey = function(o){
	var keys = []
	,o2 = {}
	;
	Object.keys(o).forEach(function(k){
		keys.push(k);
	});
	keys.sort();
	keys.forEach(function(k){
		o2[k] = o[k];
	});
	return o2;
}

