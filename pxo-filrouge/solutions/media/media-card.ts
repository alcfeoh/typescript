// Solution — M1.
import type { Media } from '@/media/media-types';
import { formatDuration } from '@/shared/format';
import { html, type SafeHtml } from '@/shared/html';

export function mediaCard(media: Media): SafeHtml {
  const { id, title, poster, preview, durationSeconds } = media;
  return html`<article class="media-card" data-id="${id}">
    <picture>
      <source type="image/avif" srcset="${poster.avif}" />
      <img src="${poster.jpeg}" alt="${title}" loading="lazy" width="480" height="270" />
    </picture>
    <video class="preview" muted loop playsinline preload="none">
      <source type="video/mp4" src="${preview.mp4}" />
      ${preview.webm && html`<source type="video/webm" src="${preview.webm}" />`}
    </video>
    <h3>${title}</h3>
    <span class="duration">${formatDuration(durationSeconds)}</span>
  </article>`;
}
