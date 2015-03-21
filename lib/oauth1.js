
var crypto = require('crypto')
,sext = require('sext')
,ut = require('../lib/ut')
,config = require('../config.js')
;


module.exports = function(url, params, method){
	/*
	// Example from https://dev.twitter.com/oauth/overview/creating-signatures
	url = 'https://api.twitter.com/1/statuses/update.json';
	params = {include_entities:true,status:'Hello Ladies + Gentlemen, a signed OAuth request!'}
	method = 'post';
	config.twitterConsumerKey = 'xvz1evFS4wEEPTGEFPHBog';
	config.twitterNonce = 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg';
	config.twitterTimestamp = 1318622958;
	config.twitterAccessToken = '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb';
	config.twitterConsumerSecret = 'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw';
	config.twitterTokenSecret = 'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE';
	*/
	var baseUrl = url
	,method = (method||'get').toUpperCase()
	,oauthParams = getAuthParams()
	,paramsStr = getParamsStr(sext({},params,oauthParams))
	,sig = generateSignature(baseUrl, method, paramsStr)
	;
	return {
		url: baseUrl+'?'+getParamsStr(params)
		,sig: sig
		,authHeader: 'OAuth '+catParams(ut.sortByKey(sext(oauthParams,{oauth_signature:sig})))
	}
}

function getAuthParams(timestamp, nonce) {
	var timestamp = config.twitterTimestamp || Math.round(Date.now()/1000)
	,nonce = config.twitterNonce || crypto.createHash('md5').update(Math.random()+'').digest('hex')
	return {
		oauth_consumer_key: config.twitterConsumerKey
		,oauth_nonce: nonce
		,oauth_signature_method: 'HMAC-SHA1'
		,oauth_timestamp: timestamp
		,oauth_token: config.twitterAccessToken
		,oauth_version: '1.0'
	}
}

function getParamsStr(params) {
	var oauthStr = [];
	Object.keys(ut.sortByKey(params)).forEach(function(k){
		oauthStr.push(ut.oauthEncode(k)+'='+ut.oauthEncode(params[k]));
	});
	return oauthStr.join('&');
}

function generateSignature(baseUrl, method, paramsStr){
	var baseStr = method+'&'+ut.oauthEncode(baseUrl)+'&'+ut.oauthEncode(paramsStr)
	,key = ut.oauthEncode(config.twitterConsumerSecret)+'&'+ut.oauthEncode(config.twitterTokenSecret)
	;
	return crypto.createHmac('sha1',key).update(baseStr).digest('base64');
}

function catParams(params){
	var c = [];
	Object.keys(params).forEach(function(k){
		c.push(ut.oauthEncode(k)+'="'+ut.oauthEncode(params[k])+'"');
	});
	return c.join(',');
}

