
var fork = require('child_process').fork
,apipoller = require('./lib/apipoller')
,twitterwrite = require('./lib/twitterwrite')
,tweetWorker = __dirname+'/tweetworker.js'

,workers = []
,maxWorkers = 2

,matchesBuf = []
,matchesBufMaxLen = 2
,activeResponders = 0
,maxActiveResponders = 2



var ins = apipoller('articles',{
	data: {
		search_phrase: '*'
		,sort_by: 'content_id desc'
	}
	,initialBuffer: maxWorkers
	,poll: 60000
	,pollFor: 5
})
.on('data',function(article){
	console.log('GOT ARTICLE',article.id);
	var trackParam = getTwitterTrackParamFromArticle(article)
	if (!trackParam) return;

	if (workers.length == maxWorkers) {
		var oldestWorker = workers.shift();
		process.nextTick(function(){
			//oldestWorker.disconnect();
			oldestWorker.kill();
		});
	}

	workers.push(createWorker());

	function createWorker(wait){
		//var worker = fork(tweetWorker);
		var worker = fork(tweetWorker, [article.postName, JSON.stringify(trackParam)]);

		worker.on('error',function(err){
			logError(err, 'child');
		});

		var removed = false
		,handleExit = function(code){
			if (removed) return;
			removed = true;
			var i = workers.indexOf(worker);
			if (i != -1) {
				//workers.splice(i,1);
				console.log('lost worker. booting back up...');
				workers.splice(i,1,createWorker(1000));
			}
		}

		worker.on('disconnect',function(){
			// if something else disconnected it, we may not receive an exit event
			handleExit(0);
		});

		worker.on('exit',function(code){
			handleExit(code);
		});

		worker.on('message',function(tweet){
			//console.log('\nGOT MATCH FROM WORKER '+JSON.stringify(trackParam)+'\n'+JSON.stringify(tweet));
			if (!isValidTweet(tweet, trackParam)) return;
			console.log('\nGOT MATCH FROM WORKER '+JSON.stringify(trackParam)+'\n'+tweet.text);
			if (canRespond()) {
				respond(article,tweet);
			} else {
				matchesBuf.push([article,tweet]);
				if (matchesBuf.length > matchesBufMaxLen) // buffer full
					matchesBuf.shift(); // drop oldest match
			}
		});

		setTimeout(function(){
			worker.send(trackParam);
		},wait||0);

		return worker;
	}
})


function getTwitterTrackParamFromArticle(article){
	// The track, follow, and locations fields should be considered to be combined with an OR operator. track=foo&follow=1234 returns Tweets matching “foo” OR created by user 1234.
	return {
		track: 'kim kardashian,KimKardashian'
		//,locations: '-170.534369,23.830106,-52.497261,70.416383' // us/ca
		//follow: 'jewelmint'
	}
}

function isValidTweet(t){
	return t && t.user && t.user.screen_name ? true : false;
}

function canRespond(){
	return activeResponders < maxActiveResponders;
}

function respond(article,tweet){
	++maxActiveResponders;
	twitterwrite({
		status: '@'+tweet.user.screen_name+' Check this out <a href="http://www.luckyshops.com/article/'+article.postName+'">'+article.postTitle+'</a>'
		,in_reply_to_status_id: tweet.id // @todo: this isnt working
	},function(err){
		if (err) {
			logError(err, 'responding to tweet');
		}
		--maxActiveResponders;
		if (matchesBuf.length && canRespond())
			respond.apply(null, matchesBuf.shift());
	});
}

function logError(err,label){
	console.log('ERROR '+new Date,label,err);
}


/*

tweet
{"created_at":"Sat May 30 17:13:08 +0000 2015","id":604697060038836200,"id_str":"604697060038836226","text":"RT @TeamKanyeKim: Kim Kardashian, North West and Penelope Disick leaving ballet class. So cute. http://t.co/AcKnwBwxNS","source":"<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>","truncated":false,"in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":387844132,"id_str":"387844132","name":"georgia","screen_name":"georgiahepburn1","location":"scotland","url":null,"description":null,"protected":false,"verified":false,"followers_count":1437,"friends_count":1434,"listed_count":2,"favourites_count":2933,"statuses_count":14388,"created_at":"Sun Oct 09 19:25:04 +0000 2011","utc_offset":null,"time_zone":null,"geo_enabled":false,"lang":"en","contributors_enabled":false,"is_translator":false,"profile_background_color":"ACDED6","profile_background_image_url":"http://abs.twimg.com/images/themes/theme18/bg.gif","profile_background_image_url_https":"https://abs.twimg.com/images/themes/theme18/bg.gif","profile_background_tile":false,"profile_link_color":"038543","profile_sidebar_border_color":"EEEEEE","profile_sidebar_fill_color":"F6F6F6","profile_text_color":"333333","profile_use_background_image":true,"profile_image_url":"http://pbs.twimg.com/profile_images/601904714624667649/hIKokR3q_normal.jpg","profile_image_url_https":"https://pbs.twimg.com/profile_images/601904714624667649/hIKokR3q_normal.jpg","profile_banner_url":"https://pbs.twimg.com/profile_banners/387844132/1432947171","default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"retweeted_status":{"created_at":"Thu May 28 21:56:26 +0000 2015","id":604043580621987800,"id_str":"604043580621987840","text":"Kim Kardashian, North West and Penelope Disick leaving ballet class. So cute. http://t.co/AcKnwBwxNS","source":"<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>","truncated":false,"in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":44517561,"id_str":"44517561","name":"Kardashian2West","screen_name":"TeamKanyeKim","location":"Living Life ","url":"http://teamkanyekim.tumblr.com/","description":"All things related to Kim Kardashian,Kanye West and the clique.You like Kim and Kanye ?Cool! You Don't? Fast Forward. http://Instagram.com/kimkardashian2west","protected":false,"verified":false,"followers_count":8230,"friends_count":281,"listed_count":17,"favourites_count":1002,"statuses_count":14351,"created_at":"Thu Jun 04 01:55:23 +0000 2009","utc_offset":-18000,"time_zone":"Central Time (US & Canada)","geo_enabled":true,"lang":"en","contributors_enabled":false,"is_translator":false,"profile_background_color":"1A1B1F","profile_background_image_url":"http://pbs.twimg.com/profile_background_images/433112664433127424/ds2-Nfxt.jpeg","profile_background_image_url_https":"https://pbs.twimg.com/profile_background_images/433112664433127424/ds2-Nfxt.jpeg","profile_background_tile":true,"profile_link_color":"2FC2EF","profile_sidebar_border_color":"000000","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"profile_image_url":"http://pbs.twimg.com/profile_images/595771017664036864/wi5W781-_normal.jpg","profile_image_url_https":"https://pbs.twimg.com/profile_images/595771017664036864/wi5W781-_normal.jpg","profile_banner_url":"https://pbs.twimg.com/profile_banners/44517561/1428491893","default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"retweet_count":34,"favorite_count":50,"entities":{"hashtags":[],"trends":[],"urls":[],"user_mentions":[],"symbols":[],"media":[{"id":604043546962722800,"id_str":"604043546962722816","indices":[78,100],"media_url":"http://pbs.twimg.com/media/CGH-Z9WUgAANho_.jpg","media_url_https":"https://pbs.twimg.com/media/CGH-Z9WUgAANho_.jpg","url":"http://t.co/AcKnwBwxNS","display_url":"pic.twitter.com/AcKnwBwxNS","expanded_url":"http://twitter.com/TeamKanyeKim/status/604043580621987840/photo/1","type":"photo","sizes":{"thumb":{"w":150,"h":150,"resize":"crop"},"small":{"w":340,"h":471,"resize":"fit"},"large":{"w":637,"h":884,"resize":"fit"},"medium":{"w":600,"h":832,"resize":"fit"}}}]},"extended_entities":{"media":[{"id":604043546962722800,"id_str":"604043546962722816","indices":[78,100],"media_url":"http://pbs.twimg.com/media/CGH-Z9WUgAANho_.jpg","media_url_https":"https://pbs.twimg.com/media/CGH-Z9WUgAANho_.jpg","url":"http://t.co/AcKnwBwxNS","display_url":"pic.twitter.com/AcKnwBwxNS","expanded_url":"http://twitter.com/TeamKanyeKim/status/604043580621987840/photo/1","type":"photo","sizes":{"thumb":{"w":150,"h":150,"resize":"crop"},"small":{"w":340,"h":471,"resize":"fit"},"large":{"w":637,"h":884,"resize":"fit"},"medium":{"w":600,"h":832,"resize":"fit"}}}]},"favorited":false,"retweeted":false,"possibly_sensitive":false,"filter_level":"low","lang":"en"},"retweet_count":0,"favorite_count":0,"entities":{"hashtags":[],"trends":[],"urls":[],"user_mentions":[{"screen_name":"TeamKanyeKim","name":"Kardashian2West","id":44517561,"id_str":"44517561","indices":[3,16]}],"symbols":[],"media":[{"id":604043546962722800,"id_str":"604043546962722816","indices":[96,118],"media_url":"http://pbs.twimg.com/media/CGH-Z9WUgAANho_.jpg","media_url_https":"https://pbs.twimg.com/media/CGH-Z9WUgAANho_.jpg","url":"http://t.co/AcKnwBwxNS","display_url":"pic.twitter.com/AcKnwBwxNS","expanded_url":"http://twitter.com/TeamKanyeKim/status/604043580621987840/photo/1","type":"photo","sizes":{"thumb":{"w":150,"h":150,"resize":"crop"},"small":{"w":340,"h":471,"resize":"fit"},"large":{"w":637,"h":884,"resize":"fit"},"medium":{"w":600,"h":832,"resize":"fit"}},"source_status_id":604043580621987800,"source_status_id_str":"604043580621987840"}]},"extended_entities":{"media":[{"id":604043546962722800,"id_str":"604043546962722816","indices":[96,118],"media_url":"http://pbs.twimg.com/media/CGH-Z9WUgAANho_.jpg","media_url_https":"https://pbs.twimg.com/media/CGH-Z9WUgAANho_.jpg","url":"http://t.co/AcKnwBwxNS","display_url":"pic.twitter.com/AcKnwBwxNS","expanded_url":"http://twitter.com/TeamKanyeKim/status/604043580621987840/photo/1","type":"photo","sizes":{"thumb":{"w":150,"h":150,"resize":"crop"},"small":{"w":340,"h":471,"resize":"fit"},"large":{"w":637,"h":884,"resize":"fit"},"medium":{"w":600,"h":832,"resize":"fit"}},"source_status_id":604043580621987800,"source_status_id_str":"604043580621987840"}]},"favorited":false,"retweeted":false,"possibly_sensitive":false,"filter_level":"low","lang":"en","timestamp_ms":"1433005988498"}

article
{"id":168485,"postAuthor":"Maura Brannigan","postDate":null,"postDateGmt":"2015-05-29T21:28:20+00:00","postContent":"<p>On Wednesday, pint-sized Oscar winner <a href=\"http://www.luckyshops.com/article/natalie-portman-ruth-bader-ginsberg\" target=\"_blank\">Natalie Portman </a>delivered the keynote address at her alma mater Harvard’s Class Day ceremonies (i.e., commencement). The 33-year-old actress, who graduated in 2003 with a Psychology major, spoke about the hardships of her own undergraduate education, which included a myriad of insecurities.</p>\n<p><strong>RELATED:</strong> <a href=\"http://www.luckyshops.com/article/natalie-portman-ruth-bader-ginsberg\" target=\"_blank\">You’ll Never Guess What Role Natalie Portman’s Playing Next!</a></p>\n<p>“When I got to Harvard just after the release of <em>Star Wars: Episode 1</em>,” she spoke, “I feared people would assume I had gotten in just for being famous, and not worthy of the intellectual rigor here.”</p>\n<p>She described feeling alienated by her fame, leading to “some pretty dark moments,” in her own words. She explained: “There were several occasions I started crying in meetings with professors, overwhelmed with what I was supposed to pull off, when I could barely get myself out of bed in the morning.”</p>\n<p>But as with any proper graduation speech, she administered a particularly stirring dose of inspiration, perfectly posed for an infinite number of <a href=\"https://www.pinterest.com/luckymagazine/\" target=\"_blank\">Pinterest</a> boards. “You can never be the best,” she advised, seasoned with a decade of post-grad experience. “The only thing you can be the best at is developing your own self. Make use of the fact that you don’t doubt yourself too much right now. As we get older we get more realistic, and that realism does us no favors.”</p>\n<p>Ain’t that the truth.</p>\n<p><iframe width=\"474\" height=\"267\" src=\"https://www.youtube.com/embed/jDaZu_KEMCY?feature=oembed\" frameborder=\"0\" allowfullscreen></iframe></p>\n","postTitle":"Your Weekend Watch: Natalie Portman’s Absolutely Inspiring Harvard Commencement Speech","postExcerpt":"On Wednesday, pint-sized Oscar winner Natalie Portman delivered the keynote address at her alma mater Harvard’s Class Day ceremonies (i.e., commencement). The 33-year-old actress, who graduated in 2003 with a Psychology major, spoke about the hardships of her own undergraduate education, which included a myriad of insecurities. RELATED: You’ll Never Guess What Role Natalie Portman’s […]","postStatus":"publish","commentStatus":null,"pingStatus":null,"postPassword":null,"postName":"natalie-portman-harvard-speech","toPing":null,"pinged":null,"postModified":null,"postModifiedGmt":"2015-05-29T21:28:20+00:00","postContentFiltered":null,"postParent":0,"guid":"http://prod-wordpress.luckyshops.com/?post_type=article&p=168485","menuOrder":0,"postType":"article","postMimeType":null,"commentcount":null,"categories":[],"terms_subject_name":[],"slideshow":null,"featuredImage":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero.jpg","additionalMetadata":{"lucky_override_byline":"","lucky_tracking_pixel":"","lucky_impression_tag":"","lucky_native_sponsored":"","lucky_legacy_url":"","lucky_sponsored_headline":"","lucky_private_flag":"public","lucky_override_slideshow_links_1":"","lucky_override_slideshow_links_tracking_1":"","lucky_override_slideshow_links_2":"","lucky_override_slideshow_links_tracking_2":"","lucky_override_slideshow_links_3":"","lucky_override_slideshow_links_tracking_3":"","lucky_override_slideshow_links_4":"","lucky_override_slideshow_links_tracking_4":"","lucky_product_category":[38343],"lucky_product_sub_category":[],"lucky_brand":[],"lucky_color_family":[],"lucky_season_code":[]},"articleMetadata":{"lucky_article_page_title":"Watch Natalie Portman's Inspirational Harvard Commencement Speech (VIDEO)","lucky_article_description":"On Wednesday, Natalie Portman delivered the keynote address at her alma mater Harvard's Class Day ceremonies (i.e., graduation).","lucky_article_search_status":"","lucky_article_ad_keywords":"celeb, f_news","lucky_article_headline":"","lucky_newsletter_signup":"","lucky_related_links":"","lucky_zergnet_module":"","lucky_legacy_template":"","lucky_article_rubric_id":"","lucky_article_rubric_term":"","lucky_article_slideshow_reference":{"lucky_article_slideshow_reference_id":"","lucky_article_slideshow_reference_name":""}},"terms":{"author":[{"ID":86,"name":"mbrannigan","slug":"cap-mbrannigan","description":"Maura Brannigan Maura Brannigan mbrannigan 15 mbrannigan@condenast.com","parent":null,"count":0,"link":"http://prod-wordpress.luckyshops.com/?taxonomy=author&term=cap-mbrannigan","meta":{"links":{"collection":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/author/terms","self":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/author/terms/80"}}}],"keyword":[{"ID":65,"name":"Celebrities","slug":"celebrities","description":"","parent":null,"count":5502,"link":"http://prod-wordpress.luckyshops.com/keyword/celebrities/","meta":{"links":{"collection":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/keyword/terms","self":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/keyword/terms/61"}}},{"ID":148,"name":"Film","slug":"film","description":"","parent":null,"count":469,"link":"http://prod-wordpress.luckyshops.com/keyword/film/","meta":{"links":{"collection":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/keyword/terms","self":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/keyword/terms/141"}}},{"ID":669,"name":"hp","slug":"hp","description":"","parent":null,"count":1278,"link":"http://prod-wordpress.luckyshops.com/keyword/hp/","meta":{"links":{"collection":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/keyword/terms","self":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/keyword/terms/650"}}},{"ID":1142,"name":"Natalie Portman","slug":"natalie-portman","description":"","parent":null,"count":1,"link":"http://prod-wordpress.luckyshops.com/keyword/natalie-portman/","meta":{"links":{"collection":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/keyword/terms","self":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/keyword/terms/1122"}}},{"ID":51,"name":"News","slug":"news","description":"","parent":null,"count":4471,"link":"http://prod-wordpress.luckyshops.com/keyword/news/","meta":{"links":{"collection":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/keyword/terms","self":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/keyword/terms/2"}}}],"subject":[{"ID":2,"name":"News","slug":"news","description":"","parent":null,"count":1109,"link":"http://prod-wordpress.luckyshops.com/subject/news/","meta":{"links":{"collection":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/subject/terms","self":"http://prod-wordpress.luckyshops.com/wp-json/taxonomies/subject/terms/2"}}}]},"author":{"ID":15,"username":"mbrannigan","name":"Maura Brannigan","first_name":"Maura","last_name":"Brannigan","nickname":"mbrannigan","slug":"mbrannigan","URL":"","avatar":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/02/maura_headshot2.jpg","description":"","title":"","twitter":"@maura_brannigan","registered":"2015-01-08T04:44:59+00:00","meta":{"links":{"self":"http://prod-wordpress.luckyshops.com/wp-json/users/15","archives":"http://prod-wordpress.luckyshops.com/wp-json/users/15/posts"}}},"images":[{"sizes":{"thumbnail":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-150x150.jpg","width":150,"height":150},"medium":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-300x245.jpg","width":300,"height":245},"large":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-1024x838.jpg","width":1024,"height":838},"post-thumbnail":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-672x372.jpg","width":672,"height":372},"twentyfourteen-full-width":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-1038x576.jpg","width":1038,"height":576},"guest-author-32":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-32x32.jpg","width":32,"height":32},"guest-author-64":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-64x64.jpg","width":64,"height":64},"guest-author-96":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-96x96.jpg","width":96,"height":96},"guest-author-128":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-128x128.jpg","width":128,"height":128},"article-page-unit-image":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-615x410-1432934409.jpg","width":615,"height":410},"article-side-image":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-405x270.jpg","width":405,"height":270},"article-thumnail-image":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-252x168.jpg","width":252,"height":168},"article-tbar-image":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-195x130.jpg","width":195,"height":130},"article-mobile-image":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-180x122.jpg","width":180,"height":122},"article-product-page-image":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-300x200.jpg","width":300,"height":200},"article-crop-large":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-195x195-1432934418.jpg","width":195,"height":195},"article-crop-mobile":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-120x120.jpg","width":120,"height":120},"article-main-image":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-720x480-1432934409.jpg","width":720,"height":480},"article-hero":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-1410x470-1432934425.jpg","width":1410,"height":470},"article-legacy":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-510x364-1432934432.jpg","width":510,"height":364},"slideshow":{"url":"http://prod-content-cdn.luckyshops.com/wp-content/uploads/2015/05/natalie-portman-harvard-hero-890x650-1432934436.jpg","width":890,"height":650}},"credit":"Jonathan Wiggs/<i>The Boston Globe</i> via Getty Images"}],"class_name":"app\\dto\\cms\\WordpressPost","class_id":null}

*/



