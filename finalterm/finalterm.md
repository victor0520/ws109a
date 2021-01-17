# Finalterm
## Search Engine
### 爬蟲部分
* code
```
import { get, post } from './esearch.js'
//import { writeJson } from 'https://deno.land/std/fs/mod.ts'
import { writeJson, writeJsonSync } from 'https://deno.land/x/jsonfile/mod.ts';
var urlList = [
  // 'http://msn.com', 
  'https://en.wikipedia.org/wiki/Main_Page'
]

var urlMap = {}

async function getPage(url) {
  try {
    const res = await fetch(url);
    return await res.text();  
  } catch (error) {
    console.log('getPage:', url, 'fail!')
  }
}

function html2urls(html) {
  var r = /\shref\s*=\s*['"](.*?)['"]/g
  var urls = []
  while (true) {
    let m = r.exec(html)
    if (m == null) break
    urls.push(m[1])
  }
  return urls
}

// await post(`/web/page/${i}`, {url, page})
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function craw(urlList, urlMap) {
  var count = 0
  for (let i=0; i<urlList.length; i++) {
  // for (let i=0; i<10; i++) {
    var url = urlList[i]
    console.log('url=', url)
    await sleep(2000);//delay
    if (!url.startsWith("https://en.wikipedia.org/wiki")) continue;
    console.log(url, 'download')
    count ++
    if (count >=10) break
    try {
      var page = await getPage(url)
      await post(`/web9/page/${count}`, {url, page})
      // await Deno.writeTextFile(`data/${i}.txt`, page)
      var urls = html2urls(page)
      // console.log('urls=', urls)
      for (let surl of urls) {
        var purl = surl.split(/[#\?]/)[0]
        var absurl = purl
        if (surl.indexOf("//")<0) { // 是相對路徑
           absurl = (new URL(purl, url)).href
           // console.log('absurl=', absurl)
        }
        if (urlMap[absurl] == null) {
          urlList.push(absurl)
          urlMap[absurl] = 0
        }
      }
    } catch (error) {
      console.log('error=', error)
    }

    writeJson("./users1.json",urlList);
  }
}

await craw(urlList, urlMap)
```
### 搜尋引擎部分
* code
```
import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import {
  viewEngine,
  engineFactory,
  adapterFactory,
} from "https://ccc-js.github.io/view-engine/mod.ts" // from "https://deno.land/x/view_engine/mod.ts";
import { get, post } from "./essearch.js";
import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();

const router = new Router();

router
  .get('/', (ctx)=>{
    ctx.response.redirect('/public/search.html')
  })
  .get('/search', search)
  .get('/public/(.*)', pub)

const app = new Application();
app.use(viewEngine(oakAdapter, ejsEngine));
app.use(router.routes());
app.use(router.allowedMethods());
const parser = new DOMParser();

async function search(ctx) {
  const query = ctx.request.url.searchParams.get('query')
  console.log('query =', query)

  let docs = await get('/web9/page/_search', {page:query})
  docs=docs.hits.hits
  let document=[]
  let title1=[]
  
  for(var i=0;i<docs.length;i++){
    let s = ""
    let s1=""
    docs[i]["_title"]=""
    title1=parser.parseFromString(docs[i]["_source"]["page"],"text/html")//JSON字串轉換成 JavaScript的數值或是物件
    title1.querySelectorAll('title').forEach((node)=>s1+=(node.textContent))//querySelectorAll()，這個不但可以把同樣的元素選起來外，還會以陣列的方式被傳回
    docs[i]["_title"]=s1
    console.log("title=",s1)
    console.log(docs[i])
    document = parser.parseFromString(docs[i]["_source"]["page"],"text/html")//.querySelector('#mw-content-text') 
    document.querySelectorAll('p').forEach((node)=>s += (node.textContent))//返回與指定選擇器匹配的文檔中所有Element節點的列表。
    var j=s.indexOf(query)
    docs[i]["_source"]["page"]=s.substring(j-150,j+150)
  }

  ctx.render('views/search.ejs', {docs:docs})
}

async function pub(ctx) {
  var path = ctx.params[0]
  await send(ctx, path, {
    root: Deno.cwd()+'/public',
    index: "index.html",
  });
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });
```
### 操作步驟 
1. 先載好[Elasticsearch](https://www.elastic.co/guide/cn/elasticsearch/guide/current/running-elasticsearch.html)，載好後在終端機裡到bin資料夾裡面，輸入.\elasticsearch，讓elasticsearch執行
![PICTURE](https://github.com/victor0520/ws109a/blob/master/finalterm/image/3.JPG)
2. 執行爬蟲程式(code2.js)，爬完資料會自動停止
3. 執行搜尋引擎程式(app.js)，跑完最後會顯示Server run at http://127.0.0.1:8000 點下超連結就會開啟網頁
![PICTURE](https://github.com/victor0520/ws109a/blob/master/finalterm/image/5.JPG)
4. 在網頁中搜尋關鍵字，就會出現一些維基百科的連結
![PICTURE](https://github.com/victor0520/ws109a/blob/master/finalterm/image/2.JPG)
