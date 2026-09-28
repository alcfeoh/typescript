/**
 * M2 — Previewable — runtime test.
 * Run: npm run ex M2
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoPlayer, type VideoLike } from '@/media/player';
import { logger } from '@/shared/decorators';

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
