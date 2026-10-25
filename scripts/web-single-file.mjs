// Az `expo export --platform web` kimenetéből egyetlen, önálló HTML fájlt készít
// (a JS és a képek beágyazva), ami bárhol megnyitható vagy megosztható.
// Használat: node scripts/web-single-file.mjs dist dist/mariann-jogapp.html [--fragment]
// --fragment: <html>/<head>/<body> nélküli változat beágyazáshoz (pl. Claude Artifact).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const fragment = args.includes('--fragment');
const [dist = 'dist', out = join(dist, 'mariann-jogapp.html')] = args.filter((a) => !a.startsWith('--'));
let html = readFileSync(join(dist, 'index.html'), 'utf8');

const scriptRe = /<script src="([^"]+)" defer><\/script>/g;
html = html.replace(scriptRe, (_, src) => {
  let js = readFileSync(join(dist, src), 'utf8');
  // képek (pl. a fejléc vissza-nyila) data URI-ként
  js = js.replace(/"(\/assets\/[^"]+\.png)"/g, (m, p) => {
    try {
      return JSON.stringify('data:image/png;base64,' + readFileSync(join(dist, p)).toString('base64'));
    } catch {
      return m;
    }
  });
  return `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>`;
});
html = html
  .replace('<html lang="en">', '<html lang="hu">')
  .replace(/<link rel="icon"[^>]*\/>/, '');

if (fragment) {
  const cut = html.indexOf('</head>');
  const head = html.slice(0, cut);
  const rest = html.slice(cut);
  const title = head.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? '';
  const styles = (head.match(/<style[\s\S]*?<\/style>/g) ?? []).join('\n');
  const body = rest.slice(rest.indexOf('<body>') + 6, rest.lastIndexOf('</body>'));
  html = `${title}\n${styles}\n<style>html, body { background: #f2f4f1; color: #23262e; }</style>\n${body}`;
}
writeFileSync(out, html);
console.log(`${out} (${(html.length / 1024).toFixed(0)} KB)`);
