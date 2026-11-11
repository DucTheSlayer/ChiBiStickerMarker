import data from './fluent-emoji.json' with { type: 'json' };

interface FluentIcon { body: string; width: number; height: number }
const ICONS = data.icons as Record<string, FluentIcon>;

export function hasFluentIcon(name: string): boolean {
  return Object.hasOwn(ICONS, name);
}

/**
 * Sticker 512x512 nền trong suốt từ một Fluent Emoji, có viền trắng kiểu sticker.
 * Viền làm bằng feMorphology trên alpha nên hợp với mọi hình.
 */
export function fluentSvg(name: string): string | undefined {
  const icon = hasFluentIcon(name) ? ICONS[name] : undefined;
  if (!icon) return undefined;
  const pad = icon.width * 0.08;
  const vb = `${-pad} ${-pad} ${icon.width + pad * 2} ${icon.height + pad * 2}`;
  const r = icon.width * 0.035;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="512" height="512">
<defs><filter id="chibi-outline" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
<feMorphology in="SourceAlpha" operator="dilate" radius="${r}" result="grow"/>
<feFlood flood-color="#ffffff"/><feComposite in2="grow" operator="in" result="outline"/>
<feGaussianBlur in="grow" stdDeviation="${r * 0.6}" result="soft"/>
<feFlood flood-color="#3a2a3f" flood-opacity=".18"/><feComposite in2="soft" operator="in"/><feOffset dy="${r * 0.5}" result="shadow"/>
<feMerge><feMergeNode in="shadow"/><feMergeNode in="outline"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter></defs>
<g filter="url(#chibi-outline)">${icon.body}</g>
</svg>`;
}
