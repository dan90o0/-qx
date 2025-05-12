// QX Script: trakt2emby.js
// 类型: response-body

(async function() {
  const html = $response.body;

  // 尝试从 HTML 中提取 TMDB ID（通常嵌在 data-attributes 或 JSON 中）
  const tmdbMatch = html.match(/data-tmdb-id="(\d+)"/) || html.match(/"tmdb":\s*(\d+)/);
  if (!tmdbMatch) {
    $done({});
    return;
  }

  const tmdbId = tmdbMatch[1];

  // 查询 Emby
  const embyToken = '477d7e46b2804ea58521f787f473d347';
  const userId = 'f195d71c74574faeaebf4d667430d38d';
  const embyUrl = 'https://emby.cn2gias.uk';

  const searchUrl = `${embyUrl}/emby/Items?SearchTerm=${tmdbId}&IncludeItemTypes=Episode&Recursive=true&api_key=${embyToken}`;

  const searchResp = await fetch(searchUrl);
  const searchJson = await searchResp.json();

  const matched = searchJson.Items?.find(item => item.ProviderIds?.Tmdb == tmdbId);
  if (!matched) {
    $done({});
    return;
  }

  const episodeId = matched.Id;
  const jumpUrl = `${embyUrl}/web/index.html#!/item?id=${episodeId}&serverId=${userId}`;

  // 构造跳转（QX中可做302 redirect或弹窗提示）
  $done({
    response: {
      status: 302,
      headers: {
        Location: jumpUrl
      }
    }
  });

})();
