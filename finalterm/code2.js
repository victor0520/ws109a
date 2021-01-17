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