/**
 * M3 — @clamp(0, 1) on the volume setter — runtime test.
 * Run: npm run ex M3
 */
import { describe, expect, it, vi } from 'vitest';
import { VideoPlayer, type VideoLike } from '@/media/player';

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
