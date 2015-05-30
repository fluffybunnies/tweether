/*

Important: Assumes eventual success. If api returns only errors, it will continue forever.
	It is the responsibility of the caller to set reasonable limits.

*/

var through = require('through')
,sext = require('sext')
,api = require('./api')
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
		,path = opts.single ? url : (url.indexOf('?')==-1?'?':'&')+'offset='+offset+'&limit='+opts.limit
		;
		++numActive;
		api.get(path, opts.data, function(err,data){
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


