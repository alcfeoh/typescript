/**
 * M1 — mediaCard — runtime test.
 * Run: npm run ex M1
 *
 * @vitest-environment happy-dom
 * (a DOM implemented in Node: enough to query the markup; it does not decode images or videos)
 */
import { describe, expect, it } from 'vitest';
import { mediaCard } from '@/media/media-card';
import type { Media } from '@/media/media-types';

const media: Media = {
  id: 'vid_test',
  title: 'Tips & <tricks>',
  durationSeconds: 75,
  poster: { avif: '/p.avif', jpeg: '/p.jpg' },
  preview: { mp4: '/c.mp4', webm: '/c.webm' },
};

function mount(m: Media): HTMLElement {
  document.body.innerHTML = mediaCard(m).markup;
  return document.querySelector<HTMLElement>('article.media-card')!;
}

describe('M1 — mediaCard', () => {
  it('is an <article class="media-card"> that carries the media id', () => {
    expect(mount(media).dataset.id).toBe('vid_test');
  });

  it('offers the AVIF poster first, the JPEG <img> as the fallback', () => {
    const picture = mount(media).querySelector('picture')!;
    const [source, img] = [...picture.children];

    expect(source?.tagName).toBe('SOURCE');
    expect(source?.getAttribute('type')).toBe('image/avif');
    expect(source?.getAttribute('srcset')).toBe('/p.avif');
    expect(img?.tagName).toBe('IMG');
    expect(img?.getAttribute('src')).toBe('/p.jpg');
    expect(img?.getAttribute('alt')).toBe('Tips & <tricks>');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('has a silent, looping preview that is not downloaded until needed', () => {
    const video = mount(media).querySelector('video.preview')!;

    for (const attribute of ['muted', 'loop', 'playsinline']) {
      expect(video.hasAttribute(attribute), attribute).toBe(true);
    }
    expect(video.getAttribute('preload')).toBe('none');
  });

  it('lists the MP4 source, then the WebM one', () => {
    const sources = [...mount(media).querySelectorAll('video source')].map((s) => [
      s.getAttribute('type'),
      s.getAttribute('src'),
    ]);

    expect(sources).toEqual([
      ['video/mp4', '/c.mp4'],
      ['video/webm', '/c.webm'],
    ]);
  });

  it('has no WebM source when the media has no WebM preview', () => {
    const card = mount({ ...media, preview: { mp4: '/c.mp4' } });

    expect(card.querySelectorAll('video source')).toHaveLength(1);
  });

  it('shows the title as text (escaped), and the formatted duration', () => {
    const card = mount(media);

    expect(card.querySelector('h3')?.textContent).toBe('Tips & <tricks>');
    expect(card.querySelector('h3 tricks')).toBeNull();
    expect(card.querySelector('.duration')?.textContent).toBe('1:15');
  });
});
