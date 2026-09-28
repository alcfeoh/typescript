/**
 * Case 3 — Videos: runtime tests (M1, M2, M3). The type-level half is in media.test-d.ts.
 * Run: npm run test:watch -- 3-media
 *
 * @vitest-environment happy-dom
 * (a DOM implemented in Node: enough to query the markup; it does not decode images or videos)
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mediaCard } from '@/media/media-card';
import type { Media } from '@/media/media-types';
import { VideoPlayer, type VideoLike } from '@/media/player';
import { logger } from '@/shared/decorators';

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

/** A fake <video>: plain object, spies on play/pause. */
function fakeVideo(overrides: Partial<VideoLike> = {}): VideoLike {
  const video: VideoLike = {
    currentTime: 0,
    duration: 60,
    paused: true,
    muted: false,
    volume: 1,
    play: vi.fn(async () => {
      (video as { paused: boolean }).paused = false;
    }),
    pause: vi.fn(() => {
      (video as { paused: boolean }).paused = true;
    }),
    ...overrides,
  };
  return video;
}

describe('M2 — Previewable', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'log').mockImplementation(() => {});
  });

  it('startPreview() plays muted, from 10 % of the video', async () => {
    const video = fakeVideo();
    await new VideoPlayer(video).startPreview();

    expect(video.muted).toBe(true);
    expect(video.currentTime).toBe(6);
    expect(video.play).toHaveBeenCalledOnce();
  });

  it('stopPreview() pauses, rewinds, and restores the sound as it was', async () => {
    const video = fakeVideo();
    const player = new VideoPlayer(video);
    await player.startPreview();

    player.stopPreview();

    expect(video.pause).toHaveBeenCalledOnce();
    expect(video.currentTime).toBe(0);
    expect(video.muted).toBe(false);
  });

  it('keeps a video muted if it already was', async () => {
    const video = fakeVideo({ muted: true });
    const player = new VideoPlayer(video);
    await player.startPreview();

    player.stopPreview();

    expect(video.muted).toBe(true);
  });

  it('goes through play() and seek() — so @logged sees the preview', async () => {
    const log = vi.spyOn(logger, 'log').mockImplementation(() => {});
    await new VideoPlayer(fakeVideo()).startPreview();

    expect(log.mock.calls.map(([line]) => line)).toEqual(['VideoPlayer.seek(6)', 'VideoPlayer.play()']);
  });
});

describe('M3 — @clamp(0, 1) on the volume setter', () => {
  it('keeps the volume between 0 and 1', () => {
    const video = fakeVideo();
    const player = new VideoPlayer(video);

    player.volume = 1.4;
    expect(video.volume).toBe(1);

    player.volume = -2;
    expect(video.volume).toBe(0);

    player.volume = 0.3;
    expect(video.volume).toBe(0.3);
  });

  it('makes changeVolume() safe at the limits', () => {
    const video = fakeVideo({ volume: 1 });
    new VideoPlayer(video).changeVolume(0.1);

    expect(video.volume).toBe(1);
  });
});
