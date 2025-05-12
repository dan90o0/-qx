// 注入按钮并点击后查找 Emby 中该集 ID，自动跳转

let body = $response.body;

// 匹配 Trakt 剧名/季/集
let match = $request.url.match(/shows\/([^\/]+)\/seasons\/(\d+)\/episodes\/(\d+)/);
if (!match) $done({});

let slug = match[1];
let season = parseInt(match[2]);
let episode = parseInt(match[3]);

// 你的 Emby 信息
const embyHost = "https://emby.cn2gias.uk";
const accessToken = "477d7e46b2804ea58521f787f473d347";
const userId = "f195d71c74574faeaebf4d667430d38d";

// 构建注入 HTML 和 JS
let injectHtml = 
<div id="goto-emby-btn" style="position:fixed;top:20px;right:20px;z-index:9999;">
  <button onclick="goToEmbyEpisode()" style="background:#007bff;color:white;padding:10px 15px;border:none;border-radius:5px;font-weight:bold;font-family:sans-serif;">
    跳转 Emby S${season.toString().padStart(2,'0')}E${episode.toString().padStart(2,'0')}
  </button>
</div>

<script>
async function goToEmbyEpisode() {
  const slug = "${slug}";
  const season = ${season};
  const episode = ${episode};
  const host = "${embyHost}";
  const token = "${accessToken}";
  const userId = "${userId}";

  // 搜索剧集
  let searchResp = await fetch(\\${host}/emby/Users/\${userId}/Items?SearchTerm=\${slug}&IncludeItemTypes=Series&Recursive=true&Fields=ProviderIds&Limit=1&api_key=\${token}\);
  let searchJson = await searchResp.json();
  if (!searchJson.Items || !searchJson.Items.length) return alert("找不到该剧");

  let seriesId = searchJson.Items[0].Id;

  // 查找集
  let epResp = await fetch(\\${host}/emby/Shows/\${seriesId}/Episodes?SeasonNumber=\${season}&api_key=\${token}\);
  let epJson = await epResp.json();
  let target = epJson.Items.find(e => e.IndexNumber === episode);
  if (!target) return alert("找不到该集");

  // 跳转
  let url = \\${host}/web/index.html#!/item?id=\${target.Id}\;
  window.open(url, "_blank");
}
</script>
;

body = body.replace("</body>", ${injectHtml}</body>);
$done({ body });
