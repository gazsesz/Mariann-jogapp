import { CONDITION_BY_ID, planWarnings } from './cautions';
import { CHAKRA_BY_ID, ELEMENT_BY_ID, isPose, isSequence, itemKind, KINDS, levelName, POSE_BY_ID, practiceOf } from './data';
import { figureSvg } from './figure';
import { countLabel, itemSummary, repsLabel, SIDES_LABEL } from './plan';
import type { Plan, Series } from './types';

const PDF_FIGURE = { fig: '#2b2f3a', far: '#a8b1ad', mat: '#b9c8d9', eye: '#ffffff', strap: '#a86f0c' };

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/** Nyomtatható óravázlat HTML-ben (expo-print ebből készít PDF-et). */
export function planHtml(plan: Plan): string {
  const warnByItem = new Map(planWarnings(plan, practiceOf).map((w) => [w.itemKey, w]));
  const meta = [
    plan.level ? levelName(plan.level) : 'Vegyes szint',
    plan.durationMin ? `${plan.durationMin} perc` : '',
    countLabel(plan),
  ].filter(Boolean).join(' · ');
  const conditions = plan.conditions.map((c) => CONDITION_BY_ID[c]?.name).filter(Boolean);

  const sections = plan.sections
    .map((s) => {
      const rows = s.items
        .map((it, i) => {
          const p = practiceOf(it);
          if (!p) return '';
          const pattern = 'pattern' in p && typeof p.pattern === 'string' ? p.pattern : '';
          const w = warnByItem.get(it.key);
          const ch = CHAKRA_BY_ID[p.chakras.primary];
          const el = ELEMENT_BY_ID[p.elements.primary];
          const details = [pattern, repsLabel(it), it.hold, it.sides !== 'nincs' ? SIDES_LABEL[it.sides] : ''].filter(Boolean).join(' · ');
          const flow = isSequence(p)
            ? p.flow.map((f) => `${POSE_BY_ID[f.pose]?.hu ?? f.pose} (${f.breath})`).join(' → ')
            : '';
          return `<tr>
            <td class="n">${i + 1}.</td>
            <td class="fig">${isPose(p) ? figureSvg(p.figure, PDF_FIGURE, 84) : `<span class="kind">${esc(KINDS[itemKind(it)].label)}</span>`}</td>
            <td>
              <div class="name">${esc(p.hu)} <span class="sk">${esc(p.sanskrit)}</span></div>
              ${details ? `<div class="det">${esc(details)}</div>` : ''}
              ${flow ? `<div class="flow">${esc(flow)}</div>` : ''}
              ${it.note ? `<div class="note">${esc(it.note)}</div>` : ''}
              ${w ? `<div class="warn">⚠ ${esc(p.cautions)}</div>` : ''}
            </td>
            <td class="ch">${ch ? `<div><span class="dot" style="background:${ch.color}"></span>${esc(ch.name)}</div>` : ''}${el ? `<div><span class="dot" style="background:${el.color}"></span>${esc(el.name)}</div>` : ''}</td>
          </tr>`;
        })
        .join('');
      return `<h2>${esc(s.title)}</h2>${rows ? `<table>${rows}</table>` : '<p class="empty">–</p>'}`;
    })
    .join('');

  return `<!doctype html><html lang="hu"><head><meta charset="utf-8">
<style>
  @page { margin: 14mm; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #23262e; font-size: 12px; }
  h1 { font-size: 22px; margin: 0 0 2px; }
  .theme { font-size: 14px; margin: 2px 0; }
  .meta { color: #5d6470; margin-bottom: 8px; }
  .box { background: #f8e6e1; color: #a2412b; padding: 6px 10px; border-radius: 6px; margin: 6px 0; }
  .notes { background: #f2f4f1; padding: 8px 10px; border-radius: 6px; white-space: pre-wrap; margin: 6px 0; }
  h2 { font-size: 15px; border-bottom: 1px solid #d5dbd4; padding-bottom: 3px; margin: 16px 0 4px; }
  table { width: 100%; border-collapse: collapse; }
  tr { page-break-inside: avoid; border-bottom: 1px solid #eef1ed; }
  td { vertical-align: middle; padding: 3px 4px; }
  td.n { width: 18px; color: #5d6470; }
  td.fig { width: 88px; }
  td.ch { width: 110px; color: #5d6470; font-size: 11px; }
  .name { font-weight: 700; font-size: 13px; }
  .sk { font-weight: 400; font-style: italic; color: #5d6470; }
  .det { color: #3d4f8f; }
  .flow { color: #5d6470; font-size: 11px; margin-top: 2px; }
  .note { margin-top: 2px; }
  .warn { color: #a2412b; margin-top: 2px; font-size: 11px; }
  .dot { display: inline-block; width: 8px; height: 8px; border-radius: 4px; margin-right: 4px; }
  .empty { color: #5d6470; }
  .kind { display: inline-block; padding: 3px 8px; border-radius: 10px; background: #dfe4f3; color: #3d4f8f; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
</style></head><body>
  <h1>${esc(plan.title || 'Óravázlat')}</h1>
  ${plan.theme ? `<div class="theme">${esc(plan.theme)}</div>` : ''}
  <div class="meta">${esc(meta)}</div>
  ${conditions.length ? `<div class="box">A csoportban jelzett panaszok: ${esc(conditions.join(', '))}</div>` : ''}
  ${plan.notes ? `<div class="notes">${esc(plan.notes)}</div>` : ''}
  ${sections}
</body></html>`;
}

/** Tematika heti áttekintése: naponként a fókusz és az óravázlat pózai szakaszonként. */
export function seriesHtml(series: Series, plans: Map<string, Plan>): string {
  const days = series.days
    .map((d, i) => {
      const p = d.planId ? plans.get(d.planId) : undefined;
      const body = p
        ? `<div class="plan">${esc(p.title)}${p.durationMin ? ` · ${p.durationMin} perc` : ''}</div>` +
          p.sections
            .filter((s) => s.items.length)
            .map(
              (s) =>
                `<div class="sec"><b>${esc(s.title)}:</b> ${s.items
                  .map(itemSummary)
                  .filter(Boolean)
                  .map(esc)
                  .join(', ')}</div>`,
            )
            .join('')
        : '<div class="empty">Még nincs óravázlat.</div>';
      return `<div class="day"><h2>${i + 1}. nap${d.title ? ` – ${esc(d.title)}` : ''}</h2>${
        d.focus ? `<div class="focus">${esc(d.focus)}</div>` : ''
      }${body}</div>`;
    })
    .join('');
  return `<!doctype html><html lang="hu"><head><meta charset="utf-8">
<style>
  @page { margin: 14mm; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #23262e; font-size: 12px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .theme { font-size: 14px; margin-bottom: 6px; }
  .notes { background: #f2f4f1; padding: 8px 10px; border-radius: 6px; white-space: pre-wrap; margin: 6px 0; }
  .day { page-break-inside: avoid; border-bottom: 1px solid #d5dbd4; padding: 6px 0 8px; }
  h2 { font-size: 15px; margin: 6px 0 2px; color: #3d4f8f; }
  .focus { font-style: italic; color: #5d6470; margin-bottom: 4px; }
  .plan { font-weight: 700; margin: 2px 0; }
  .sec { margin: 1px 0; }
  .empty { color: #5d6470; }
</style></head><body>
  <h1>${esc(series.title || 'Tematika')}</h1>
  ${series.theme ? `<div class="theme">${esc(series.theme)}</div>` : ''}
  ${series.notes ? `<div class="notes">${esc(series.notes)}</div>` : ''}
  ${days}
</body></html>`;
}
