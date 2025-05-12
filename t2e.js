// @grant url
// @grant responseBody

(async () => {
  const html = $response.body;
  const url = $request.url;
  const match = url.match(/\/shows\/([^/]+)\/seasons\/(\d+)\/episodes\/(\d+)/);
  if (!match) return $done({ body: html });

  const [_, showSlug, season, episode] = match;

  const traktApi = `https://api.trakt.tv/shows/${showSlug}/seasons/${season}/episodes/${episode}?extended=full`;

  const traktRes = await $task.fetch({
    url: traktApi,
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": "af5df01d3f5df9a9c19b04d61dfd89c2" // 官方公开 key
    }
  });

  const traktData = JSON.parse(traktRes.body);
  const tmdbId = traktData?.ids?.tmdb;

  if (!tmdbId) return $done({ body: html });

  // 查询 Emby
  const embyRes = await $task.fetch({
    url: `https://emby.cn2gias.uk/Items?Recursive=true&IncludeItemTypes=Episode&AnyProviderIdEquals=tmdb:${tmdbId}&api_key=477d7e46b2804ea58521f787f473d347`
  });

  const embyData = JSON.parse(embyRes.body);
  const embyId = embyData?.Items?.[0]?.Id;

  if (!embyId) return $done({ body: html });

  const embyUrl = `https://emby.cn2gias.uk/web/index.html#!/item/item.html?id=${embyId}`;

  // 构造按钮并注入
  const buttonHtml = `
    <div style="position:fixed;bottom:80px;right:20px;z-index:9999;">
      <a href="${embyUrl}" target="_blank" style="padding:10px 15px;background:#4caf50;color:white;font-size:14px;border-radius:6px;text-decoration:none;box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        ▶ 打开 Emby
      </a>
    </div>
  `;

  const newHtml = html.replace('</body>', `${buttonHtml}</body>`);
  $done({ body: newHtml });
})();
