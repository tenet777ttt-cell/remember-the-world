# 一个想记得世界的人

独立的静态长文阅读网站。HTML/CSS/JavaScript，无运行时依赖、无后台、无追踪。支持子路径部署。

## 本地查看

直接打开 `site/index.html` 可阅读；完整测试请使用 HTTP：

```sh
npm ci
npm run build
npm test
npm run preview
```

打开终端打印的本地地址。Node.js 22 或以上版本。依赖仅用于本地构建、内容校验与二维码制作，不会加载到访问者浏览器。

## 文件说明

- `source/article.json`：从 Word 提取的原始段落、格式及顺序，是构建输入。
- `source/original.docx`：原始 Word，仅本地保留，不进入公开仓库。
- `source/一个想记得世界的人_11月2日版.docx`：授权修改两处日期的 Word 副本，仅本地保留。
- `scripts/build.mjs`：按用户授权将两处 11 月 8 日转换为 11 月 2 日，保留其他全部文字，生成完整静态 HTML 和 Word 副本。
- `scripts/verify.mjs`：独立解析原始 Word，与原始 JSON、网页、修改版 Word 逐段比较。公开仓库中无 Word 时校验 JSON 与网页。
- `site/`：唯一上传到 GitHub Pages 的网页资源目录。
- `reports/`：本地测试及审查报告，不进入公开仓库。
- `qr/`：正式部署后生成的二维码，不进入公开仓库。

## 修改文章

优先保留原始文件。原文有变动时运行 `node scripts/import.mjs 新版Word路径`，旧 JSON 会自动备份；将与新提取结果匹配的 Word 保存在本地 `source/original.docx` 用作验证基准。导入器遇到复杂 Word 结构或章节不为十章时会停止，避免遗漏。若新版已经使用 11 月 2 日，需同步调整构建与校验脚本中的两处日期授权转换规则。不要只改生成的 HTML。

执行 `npm run build` 和 `npm test`，确认正文与原文一致后提交。纯样式和交互分别修改 `site/styles.css`、`site/app.js`。不要直接修改 `site/index.html`，它会被重新生成。

## 首次公开部署（必须获得用户确认）

建议新建公开仓库 `remember-the-world`，使用 `main` 分支。在 Settings → Pages → Build and deployment 将 Source 设为 GitHub Actions。推送后由 `.github/workflows/pages.yml` 执行内容检查并发布 `site/`。

流程依据 GitHub 官方文档：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

首次创建仓库、推送与开启 Pages 前须得到用户明确确认。正文将公开，并可被搜索引擎收录。公开仓库还包含原始提取的文章文字，原始 Word 文件本身不上传。

## 正式二维码

部署成功并匿名验证最终地址后运行：

```sh
node scripts/qr.mjs https://ACCOUNT.github.io/remember-the-world/
```

脚本先检查 HTTPS 页面，再生成 2400×2800 PNG 和可打印 SVG，二维码保留四个模块的白边，并自动解码 PNG 检查网址。二维码应使用最终正式地址；改仓库名或账号后需重新生成。

## 隐私、兼容与缓存

字号和阅读位置仅保存在当前浏览器 localStorage。浏览器禁止本地存储时仍可阅读；隐私模式或清理缓存后记忆可能丢失。复制失败时提供手动选择网址，微信可使用右上角原生分享。无第三方字体、追踪、广告、cookie 或远程请求。GitHub 托管平台自身的访问日志由 GitHub 管理。

采用系统中文字体。实际字形取决于设备已安装字体，不下载大体积中文字体。静态页面自带完整正文，无 JavaScript 也可阅读并使用锚点目录。未使用 Service Worker，避免旧版本长期缓存；部署缓存由 GitHub Pages 管理。

真实 iPhone、Android、微信内置浏览器、实体二维码打印扫码与中国大陆不同网络的可达性需要用户验收；桌面浏览器模拟不能替代这些检查。
