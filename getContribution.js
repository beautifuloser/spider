/**
 * @author skydriver
 * @date 2016-3-2
 * @description 抓取新闻供稿单位
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var Fiber = require('fibers');
var finalNews = [];
Fiber(function (){
	var file = fs.readFileSync('./data/data.json','utf-8');
	var news = JSON.parse(file);
	// console.log(news.length);
	for (var i = 0; i < news.length; i++) {
		var loopFiber = Fiber.current;
		var urlStr = news[i].link;
		var html = "";
		var chineseIndex = urlStr.match(/-/).index;
		var chinese = urlStr.substring(chineseIndex,urlStr.length);
		var preUrl = urlStr.substring(0,chineseIndex);
		// console.log(preUrl);
		// console.log();
		urlStr = preUrl + encodeURIComponent(chinese);
		// console.log(urlStr);
		http.get(urlStr,function (res){
			res.on('data',function (chunk){
				html +=chunk;
			});

			res.on('end',function (){
				// console.log(html);
				var $ = cheerio.load(html);
				var contribution = $('.article-info a').first().text();
				contribution = contribution.replace(/\n/g,"").replace(/\t/g,"");
				// console.log(contribution);
				
				var tempNews = {
					index:i+1,
					title:news[i].title,
					time:news[i].time,
					link:news[i].link,
					contribution:contribution
				}
				finalNews.push(tempNews);
				console.log(i);
				loopFiber.run();
			});
		})
		Fiber.yield();
		if (i == news.length -1) {
			writeToFile("./data/data2.json",finalNews);
		}
	};
}).run();


function writeToFile (path,data){
	fs.writeFile(path,JSON.stringify(data,null,4),function(err){
		if (err) 
			console.log("save fail :",err);
		else
			console.log("save success!");
	});
}