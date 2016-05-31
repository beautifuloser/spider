/**
 * @author skydriver
 * @date 2016-3-5
 * @description 抓取图片信息
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var Fiber = require('fibers');

Fiber(function (){
	var news = fs.readFileSync('./data/data.json','utf-8');
	news = JSON.parse(news);
	for (var i = 0; i < news.length; i++) {
		var loopFiber = Fiber.current;
		var urlStr = news[i].link;
		// console.log(urlStr);
		var chineseIndex = urlStr.match(/-/).index;
		var chineseStr = urlStr.substring(chineseIndex,urlStr.length);
		chineseStr = encodeURIComponent(chineseStr);
		urlStr = urlStr.substring(0,chineseIndex);
		urlStr +=chineseStr; 
		// console.log(urlStr);
		// urlStr = "";
		http.get(urlStr,function (res){
			var html = "";
			res.on('data',function (chunk){
				html += chunk;
			});
			res.on('end',function (){
				var $ = cheerio.load(html);
				var pictures = [];
				var items = [];
				$('.item-page img').each(function (index,item){
					// console.log($(this).attr('src'));
					// console.log($(this).parent().parent().next().find('span').text());
					// console.log($(this).parent().next().find('span').text());
					var src = $(this).attr('src');
					var des = "";
					if ($(this).parent().parent().next().find('span').text() != "") {
						des = $(this).parent().parent().next().find('span').text();
					}else if ($(this).parent().next().find('span').text() != "") {
						des = $(this).parent().next().find('span').text();
					};
					var picture = {
						src : "http://www.ss.pku.edu.cn"+src,
						des : des
					}	
					
					
					pictures.push(picture);
					// console.log(one_item);
				});
				items = {
					title : news[i].title,
					picture : pictures
				}
				console.log(i);
				// var info = {
				// 	link : "http://www.ss.pku.edu.cn" +$('')
				// }
				if (i == news.length - 1) {
					saveData("./data/imageInfo.json",items);
				};
				loopFiber.run();
			});	
		});
		Fiber.yield();
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

// http://www.ss.pku.edu.cn/images/images/00_archive/stories/02_news/IMG_2084-1.JPG
						// /images/images/00_archive/stories/02_news/IMG_2084-1.JPG