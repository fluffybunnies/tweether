

require('http').createServer(function(req,res){
	console.log(Object.keys(req).join('\n'));
	console.log(req.headers);
	console.log(req.method);
})
.listen(3000)
;
