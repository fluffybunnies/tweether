/*
node ./test/readlevel.js articles
*/
var config = require('../config.js')
,level = require('level')(__dirname+'/../'+config.leveldb.engines)
,subLevel = require('level-sublevel')(level)
,db = subLevel.sublevel(process.argv[2])
,key = process.argv[3] || ''

db.get(key,function(err,data){
	if (err)
		return console.log(err)
	data.createReadStream({}).on('data',function(row){
		console.log(row);
	});
});