/* Bundle the modular source into ONE self-contained HTML file that
   works when downloaded alone (double-click to open, no folders needed).
   Run:  node build.mjs   (from the kids-life-lab/ folder)                */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const base = dirname(fileURLToPath(import.meta.url)) + '/';
const css = readFileSync(base + 'css/styles.css', 'utf8');
const jsFiles = ['data','store','svg','views','parent','app'].map(n => readFileSync(base + 'js/' + n + '.js', 'utf8'));

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NOYA Kids · Life Lab</title>
  <meta name="description" content="孩子自己的小世界 — 学习、生活、责任、成长、金钱与选择。" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='26' font-size='26'>🏝️</text></svg>" />
  <style>
${css}
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
${jsFiles.join('\n\n/* ============================================================ */\n\n')}
  </script>
</body>
</html>
`;
writeFileSync(base + 'kids-life-lab-standalone.html', html);
console.log('bytes:', html.length);
