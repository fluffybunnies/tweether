/*

Important: Assumes eventual success. If api returns only errors, it will continue forever.
	It is the responsibility of the caller to set reasonable limits.

*/

var through = require('through')
,sext = require('sext')
,request = require('hyperquest')
,crypto = require('crypto')
,config = require('../config.js')
;


module.exports = function(url, opts){

	opts = sext({
		maxActiveQueries: 20
		,limit: 20
		,findList: function(res){
			return (res && Array.isArray(res.entities)) ? res.entities : [];
		}
	},opts);
	if (opts.single) {
		opts.maxActiveQueries = 1;
		opts.findList = function(res){
			return [res];
		}
	}

	var s = through()
	,numActive = 0
	,lastNodeFound = false
	,page = 0
	;
	s.autoDestroy = false;
	function next(){
		var offset = page++ * opts.limit
		,path = opts.single ? url : qsa(url,'offset',offset)+'&limit='+opts.limit
		;
		++numActive;
		query(path, function(err,data){
			if (!s.readable) return; // destroyed
			if (err) {
				err._path = path;
				s.emit('softerror',err);
				return doneWithSubset();
			}
			var list = opts.findList(data);
			list.forEach(function(item){
				s.queue(item);
			});
			if (!list.length || opts.single)
				lastNodeFound = true;
			doneWithSubset();
			function doneWithSubset(){
				--numActive;
				if (lastNodeFound) {
					if (!numActive)
						s.queue(null);
					return;
				}
				next();
			}
		});
	}

	for (var i=0;i<opts.maxActiveQueries;++i)
		next();

	return s;

}


function query(path, cb){
	// test speed of toFixed(0) vs floor
	var time = (Date.now()/1000).toFixed(0)
	,authHash = crypto.createHash('md5').update(config.api.secret+''+time).digest('hex')
	,url = config.api.endpoint+'/v'+config.api.version+'/'+path
	,buf = new Buffer('')
	,statusCode,undef
	;
	url = qsa(url,'sig_time',time);
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

function qsa(url,k,v){
	return url + (url.indexOf('?') == -1 ? '?' : '&') + k+'='+encodeURIComponent(v);
}

