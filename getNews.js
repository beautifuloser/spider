/**
 * @author skydriver
 * @date 2016-3-6
 * @description 抓取全部新闻信息
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var Fiber = require('fibers');
var articles = [];
Fiber(function (){
	var file = fs.readFileSync('./data/data.json','utf-8');
	var news = JSON.parse(file);
	for (var i = 0; i < news.length; i++) {
		var loopFiber = Fiber.current;
		var urlStr = news[i].link;
		var html = "";
		var chineseIndex = urlStr.match(/-/).index;
		var chinese = urlStr.substring(chineseIndex,urlStr.length);
		var preUrl = urlStr.substring(0,chineseIndex);
		urlStr = preUrl + encodeURIComponent(chinese);
		http.get(urlStr,function (res){
			res.on('data',function (chunk){
				html +=chunk;
			});

			res.on('end',function (){
				var $ = cheerio.load(html);
				var title = $('.article-title').text();
					title = title.replace(/\n/g,"").replace(/\t/g,"");	
				var contribution = $('.article-info a').first().text();
					contribution = contribution.replace(/\n/g,"").replace(/\t/g,"");	
				var time = $('.article-info a').first().next().text();
				var article = [];
				var one_news ;
				$('.article-content').find('*').each(function (index,item){
					var value = $(this).text();
					var one_section = {};
					// console.log($(this).text());
					if ($(this).text() == "") {
						//图片
						// console.log($(this).attr('src'));
						// key = "src";
						var src = $(this).attr('src');
						value = "http://www.ss.pku.edu.cn"+src;
					};
					if (index == 0) {
						one_section = {
							title : title,
							time : time,
							item : value
						}
					}else{
						one_section = {
							item : value
						}
					}
					
					article.push(one_section);
					one_news = {
						title : title,
						news : article
					}
				});
				// console.log(article);
				articles.push(one_news);
				console.log(articles);
				if (i == news.length - 1) {
					saveData("./data/imageInfo.json",items);
				};
				loopFiber.run();
			});
		})
		Fiber.yield();
		if (i == news.length -1) {
			writeToFile("./data/news.json",finalNews);
		}
	};
}).run();


function saveData (path,data){
	fs.writeFile(path,JSON.stringify(data,null,4),function(err){
		if (err) {
			console.log("error !");
		}else{
			console.log("save success !");
		}
	});
}