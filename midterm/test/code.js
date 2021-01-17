const request = require("request");
const cheerio = require("cheerio");

const pttCrawler = () => {
    request({
        url: "https://www.ptt.cc/bbs/Stock/index.html",
        method: "GET"
    }, (error, res, body) => {
        // 如果有錯誤訊息，或沒有 body(內容)，就 return
        if (error || !body) {
            return;
        }

        const data = [];// 建立一個儲存結果的容器
        const $ = cheerio.load(body); // 載入 body
        const datax = $(".r-list-container .r-ent");
        for (let i = 0; i < datax.length; i++) {
            const title = datax.eq(i).find('.title a').text();//公告
            const author = datax.eq(i).find('.meta .author').text();//作者
            const date = datax.eq(i).find('.meta .date').text();//日期
            const link =datax .eq(i).find('.title a').attr('href');//網址

            data.push(( title),(author),(date),(link));
            //data.push({title,author,date,link});//有標題的ex  title: '[公告] Stock 股票板板規 V3   (2020/11/20 編修)'
        }

        console.log(data);
    });
};
pttCrawler();
// 一天爬一次資料
setInterval(pttCrawler,  24* 60 * 60 * 1000);