// Pre-coded — the video page (Case 3): a grid of cards, the player, and its comments (bonus B3).
import { commentsView } from '@/comments/comments-view';
import { mediaCard } from '@/media/media-card';
import { CATALOG, type Media } from '@/media/media-types';
import { VideoPlayer } from '@/media/player';
import { runShortcut } from '@/media/player-remote';
import { $ } from '@/shared/dom';
import { html, render } from '@/shared/html';
import { TodoError } from '@/shared/todo';

function attempt<T>(step: () => T, fallback: (error: TodoError) => T): T {
  try {
    return step();
  } catch (error) {
    if (error instanceof TodoError) return fallback(error);
    throw error;
  }
}

function attachHoverPreview(card: HTMLElement): void {
  // querySelector('video') would infer HTMLVideoElement by itself; with a class in the selector,
  // TypeScript only knows it is an Element — hence the explicit type argument.
  const preview = new VideoPlayer($<HTMLVideoElement>('video.preview', card));
  card.addEventListener('mouseenter', () => {
    attempt(
      // play() rejects when the mouse leaves before the clip starts: not an error for a preview.
      () => void preview.startPreview().catch(() => {}),
      (error) => console.info(error.message),
    );
  });
  card.addEventListener('mouseleave', () => attempt(() => preview.stopPreview(), () => {}));
}

function openPlayer(root: HTMLElement, media: Media): () => void {
  const section = $('#player', root);
  render(
    section,
    html`<h2>${media.title}</h2>
      <video id="main-video" src="${media.preview.mp4}" poster="${media.poster.jpeg}" playsinline></video>
      <div class="controls">
        <button data-action="togglePlay" aria-label="Play or pause">⏯</button>
        <button data-action="back" aria-label="Back 5 seconds">−5 s</button>
        <button data-action="forward" aria-label="Forward 5 seconds">+5 s</button>
        <button data-action="volumeDown" aria-label="Volume down">🔉</button>
        <button data-action="volumeUp" aria-label="Volume up">🔊</button>
        <button data-action="mute" aria-label="Mute">🔇</button>
        <output id="volume">Volume 100 %</output>
      </div>
      <p class="hint">Keyboard: space / k, ← →, ↑ ↓, m, 0</p>
      <div id="comments"></div>`,
  );

  const player = new VideoPlayer($<HTMLVideoElement>('#main-video', section));
  const volume = $('#volume', section);
  const showVolume = () => (volume.textContent = `Volume ${Math.round(player.volume * 100)} %`);

  const actions = {
    togglePlay: () => player.togglePlay(),
    back: () => player.skip(-5),
    forward: () => player.skip(5),
    volumeDown: () => player.changeVolume(-0.1),
    volumeUp: () => player.changeVolume(0.1),
    mute: () => player.toggleMute(),
  };

  section.querySelector('.controls')!.addEventListener('click', (event) => {
    const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button')?.dataset.action;
    if (action && action in actions) {
      actions[action as keyof typeof actions]();
      showVolume();
    }
  });

  const onKey = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) return;
    if (runShortcut(player, event.key)) {
      event.preventDefault();
      showVolume();
    }
  };
  document.addEventListener('keydown', onKey);

  render($('#comments', section), commentsView(media.id));
  return () => document.removeEventListener('keydown', onKey);
}

export function mountMedia(root: HTMLElement): () => void {
  const cards = attempt(
    () => CATALOG.map(mediaCard),
    (error) => [html`<p class="card todo">⚠️ ${error.message}: the video cards are not rendered yet.</p>`],
  );

  render(root, html`<section class="media-grid">${cards}</section><section id="player" class="card"></section>`);

  let closePlayer = () => {};
  root.querySelectorAll<HTMLElement>('.media-card').forEach((card) => {
    attachHoverPreview(card);
    card.addEventListener('click', () => {
      const media = CATALOG.find((m) => m.id === card.dataset.id);
      if (!media) return;
      closePlayer();
      closePlayer = openPlayer(root, media);
    });
  });

  return () => closePlayer();
}
