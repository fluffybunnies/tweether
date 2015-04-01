
var mysql = require('mysql')
,conns = {}
;

module.exports = function(key){
	if (!conns[key]) {
		var dbc = require('../config.js')[key+'Sql']
		if (!dbc)
			throw new Error('invalid mysql config key');
		conns[key] = mysql.createPool({
			host: dbc.host
			,user: dbc.user
			,password: dbc.pass
			,database: dbc.db
			//,connectionLimit: 20 // default 10
			//,acquireTimeout: 30000 // default 10000
		});
	}
	return conns[key];
}
