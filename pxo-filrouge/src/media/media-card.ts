// M1 — La carte d'une vidéo : affiche en AVIF avec repli JPEG, et un extrait pour le survol.
import type { Media } from '@/media/media-types';
import { formatDuration } from '@/shared/format';
import { html, type SafeHtml } from '@/shared/html';
import { todo } from '@/shared/todo';

/**
 * TODO M1 — renvoyez ce HTML, avec le tag `html` (il échappe le titre pour vous) :
 *
 * <article class="media-card" data-id="vid_…">
 *   <picture>
 *     <source type="image/avif" srcset="….avif">
 *     <img src="….jpg" alt="<title>" loading="lazy" width="480" height="270">
 *   </picture>
 *   <video class="preview" muted loop playsinline preload="none">
 *     <source type="video/mp4" src="….mp4">
 *     <source type="video/webm" src="….webm">      ← seulement si le média a un aperçu WebM
 *   </video>
 *   <h3>title</h3>
 *   <span class="duration">31:15</span>                ← formatDuration(durationSeconds)
 * </article>
 *
 * Mettez chaque attribut entre guillemets : `alt=${title}` s'arrête au premier espace du titre, `alt="${title}"` non
 * (le tag html échappe les guillemets présents dans la valeur).
 *
 * Aucun JavaScript ne choisit entre AVIF et JPEG : le navigateur prend la première <source> dont il sait
 * lire le `type`, et se rabat sur l'<img> sinon. Même chose pour les sources de la <video>.
 */
export function mediaCard(media: Media): SafeHtml {
  return todo('M1');
}
