/**
 * @author skydriver
 * @date 2016-3-1
 * @description 抓取新闻标题列表
 */
var Fiber = require('fibers');
var http = require("http");
var cheerio = require("cheerio");
var fs = require("fs");
var news = [];
var no = 1;
Fiber(function () {
    for (var i = 0; i < 25; i++) {
        console.log("====="+i+"=====");
        var httpFiber = Fiber.current;
        var html = "";
        var urlStr = "http://www.ss.pku.edu.cn/index.php/newscenter/news?start="+i*20;
        http.get(urlStr, function (res) {
            var dataFiber = Fiber.current;
            res.on("data", function (data) {
                html += data;
            });
            res.on("end", function (data) {
                var $ = cheerio.load(html);
                $("#info-list-ul li").each(function (index,item){
                    var oneNews = {
                        page : i+1,
                        index : index+1,
                        newsNO. : no++,
                        title : $(".info-title",this).text(),
                        time : $(".time",this).text(),
                        link : "http://www.ss.pku.edu.cn/index.php/newscenter/news/" + $("a",this).attr("href")
                    }
                    news.push(oneNews);
                });
                httpFiber.run();
            });
        });
        Fiber.yield();
        if (i == 24) {
            saveData("./data/data.json",news);    
        };
         // console.log(news);
    };
}).run();

function saveData(path,data){
    fs.writeFile(path,JSON.stringify(data,null,4),function(err){
        if(err)
            console.log("save error!");
        else
            console.log("save success!");
    })
}