// ==UserScript==
// @name         Trakt to Emby Jump
// ==/UserScript==

let body = $response.body;

// 插入一个跳转按钮和脚本
const insertScript = `
<script>
(async () => {
    // 等待页面加载完成
    await new Promise(r => setTimeout(r, 1500));

    const episodeData = window.__PRELOADED_STATE__?.episode;
    const tmdbId = episodeData?.tmdb_id;
    const season = episodeData?.season_number;
    const episode = episodeData?.number;

    if (!tmdbId || !season || !episode) return;

    // 创建跳转按钮
    const btn = document.createElement('button');
    btn.innerText = '▶ Emby 播放';
    btn.style.position = 'fixed';
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.zIndex = '9999';
    btn.style.padding = '10px 15px';
    btn.style.background = '#2ecc71';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.fontSize = '16px';
    btn.onclick = async () => {
        try {
            const res = await fetch("https://emby.cn2gias.uk/emby/Users/f195d71c74574faeaebf4d667430d38d/Items?Recursive=true&IncludeItemTypes=Episode&Filters=IsNotFolder&Fields=ProviderIds", {
                headers: {
                    "X-Emby-Token": "477d7e46b2804ea58521f787f473d347"
                }
            });
            const json = await res.json();
            const items = json.Items || [];
            const match = items.find(i => i.ProviderIds?.Tmdb === String(tmdbId) && i.ParentIndexNumber == season && i.IndexNumber == episode);
            if (match) {
                const url = \`https://emby.cn2gias.uk/web/index.html#!/item?id=\${match.Id}\`;
                window.location.href = url;
            } else {
                alert("未找到对应 Emby 集。");
            }
        } catch (e) {
            alert("Emby 查询失败: " + e.message);
        }
    };

    document.body.appendChild(btn);
})();
</script>
`;

// 将 script 插入 </body> 之前
body = body.replace("</body>", insertScript + "</body>");

$done({ body });
