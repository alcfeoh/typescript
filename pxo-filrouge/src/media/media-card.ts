// M1 — The card of a video: poster in AVIF with a JPEG fallback, and a preview clip for the hover.
import type { Media } from '@/media/media-types';
import { formatDuration } from '@/shared/format';
import { html, type SafeHtml } from '@/shared/html';
import { todo } from '@/shared/todo';

/**
 * TODO M1 — return this markup, with the `html` tag (it escapes the title for you):
 *
 * <article class="media-card" data-id="vid_…">
 *   <picture>
 *     <source type="image/avif" srcset="….avif">
 *     <img src="….jpg" alt="<title>" loading="lazy" width="480" height="270">
 *   </picture>
 *   <video class="preview" muted loop playsinline preload="none">
 *     <source type="video/mp4" src="….mp4">
 *     <source type="video/webm" src="….webm">      ← only when the media has a WebM preview
 *   </video>
 *   <h3>title</h3>
 *   <span class="duration">31:15</span>                ← formatDuration(durationSeconds)
 * </article>
 *
 * Quote every attribute: `alt=${title}` breaks at the first space of the title, `alt="${title}"` does not
 * (the html tag escapes the quotes inside the value).
 *
 * No JavaScript decides between AVIF and JPEG: the browser takes the first <source> whose `type`
 * it supports, and falls back to the <img>. Same for the <video> sources.
 */
export function mediaCard(media: Media): SafeHtml {
  return todo('M1');
}
