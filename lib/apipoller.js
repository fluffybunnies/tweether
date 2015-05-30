
var sext = require('sext')
,through = require('through')
,api = require('./api')


module.exports = function(path, opts){
	opts = sext({
		initialBuffer: 20
		,poll: 60000
		,pollFor: 5
		,findList: function(res){
			return (res && Array.isArray(res.entities)) ? res.entities : [];
		}
		,getItemId: function(item){
			return item ? item.id : null;
		}
	},opts)

	var s = through()
	,send = sext({}, opts.data)
	,lastId = null
	,timeout

	s.autoDestroy = false;
	s.on('exit',handleExit);
	s.on('close',handleExit);

	send.limit = opts.initialBuffer;
	fetch();

	function fetch(){
		api.get(path, send, function(err,data){
			if (!s.readable) return; // destroyed
			if (err) {
				s.emit('error', err);
			} else {
				var list = opts.findList(data)
				,itemsToQueue = [],itemId,i

				for (i=0;i<list.length;++i) {
					itemId = opts.getItemId(list[i]);
					if (itemId === null) {
						s.emit('error', 'failed to find item id');
						break;
					}
					if (lastId == itemId && lastId !== null)
						break;
					itemsToQueue.unshift(list[i]);
				}
				if (itemsToQueue.length) {
					lastId = opts.getItemId(itemsToQueue[itemsToQueue.length-1]);
					itemsToQueue.forEach(function(item){
						s.queue(item);
					});
				}
			}
			timeout = setTimeout(function(){
				send.limit = opts.pollFor;
				fetch();
			}, opts.poll);
		});
	}

	function handleExit(){
		clearTimeout(timeout);
	}

	return s;
}

