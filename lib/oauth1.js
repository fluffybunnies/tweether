
var crypto = require('crypto')
,sext = require('sext')
,ut = require('../lib/ut')
,config = require('../config.js')
;


module.exports = function(url, params, method){
	var baseUrl = url
	,method = (method||'get').toUpperCase()
	,oauthParams = getAuthParams()
	,authParamsStr = getParamsStr(sext({},params,oauthParams))
	,sig = generateSignature(baseUrl, method, authParamsStr)
	,paramsStr = getParamsStr(params)
	;
	return {
		urlGet: baseUrl + (method == 'GET' ? (paramsStr ? (url.indexOf('?') == -1 ? '?' : '&')+paramsStr : '') : '')
		,data: method == 'GET' ? '' : paramsStr
		,sig: sig
		,authHeader: 'OAuth realm="",'+catParams(sext(oauthParams,{oauth_signature:sig}))
	}
}

function getAuthParams() { 
	return {
		oauth_consumer_key: config.twitter.consumerKey
		,oauth_nonce: crypto.createHash('md5').update(Math.random()+'').digest('hex')
		,oauth_signature_method: 'HMAC-SHA1'
		,oauth_timestamp: Math.round(Date.now()/1000)
		,oauth_token: config.twitter.accessToken
		,oauth_version: '1.0A'
	}
}

function getParamsStr(params) {
	var oauthStr = [];
	Object.keys(ut.sortByKey(params||{})).forEach(function(k){
		oauthStr.push(ut.encode_rfc3986(k)+'='+ut.encode_rfc3986(params[k]));
	});
	return oauthStr.join('&');
}

function generateSignature(baseUrl, method, paramsStr){
	var baseStr = method+'&'+ut.encode_rfc3986(baseUrl)+'&'+ut.encode_rfc3986(paramsStr)
	,key = ut.encode_rfc3986(config.twitter.consumerSecret)+'&'+ut.encode_rfc3986(config.twitter.accessSecret)
	;
	return crypto.createHmac('sha1',key).update(baseStr).digest('base64');
}

function catParams(params){
	var c = [];
	Object.keys(params).forEach(function(k){
		c.push(ut.encode_rfc3986(k)+'="'+ut.encode_rfc3986(params[k])+'"');
	});
	return c.join(',');
}

