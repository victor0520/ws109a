# Midterm
## Web Crawler
### Code
```
async function getPage(url) {
  const res = await fetch(url);
  return await res.text();
}
//抽取超連結
function html2urls(html) {
  //正規表達式
  var r = /\shref\s*=\s*['"](.*)['"]/g
  var urls = []
  while (true) {
    let m = r.exec(html)
    if (m == null) break
    urls.push(m[1])
  }
  return urls
}

async function craw(urlList) {
  for (let i=0; i<urlList.length; i++) {
    var url = urlList[i]
    console.log(url, 'download')
    //只抓絕對路徑的網址
    if (!url.startsWith('http')) continue
    try {
      var page = await getPage(url)
      //將網頁存入data中
      await Deno.writeTextFile(`data/${i}.txt`, page)
      //抽出超連結
      var urls = html2urls(page)
      //將超連結加回urlList
      for (url of urls) {
        urlList.push(url)
      }
      //除錯 
    } catch (error) {
      console.log('error=', error)
    }
  }
}
//目標網站
var urlList = [
  'https://zh.wikipedia.org', 
]

await craw(urlList)

```
### 敘述與操作步驟
* 參考老師上課使用的程式碼，了解其運作原理後，加上一些註解
* 先在程式的資料夾裡面新增一個data資料夾，抓下來的網頁就會存在裡面
### 來源與理解程度
* 參考複製老師課程gitlab裡面的程式碼
* 理解程度: 對此程式大部分可以理解


