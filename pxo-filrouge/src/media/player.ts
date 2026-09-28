// The video player, built from mixins (Module D). Playable, Seekable and Audible are pre-coded.
import { clamp } from '@/shared/clamp';
import { logged } from '@/shared/decorators';
import type { Constructor } from '@/shared/mixins';
import { todo } from '@/shared/todo';

/** The part of HTMLVideoElement the player uses. A fake object is enough in the tests. */
export interface VideoLike {
  play(): Promise<void>;
  pause(): void;
  currentTime: number;
  readonly duration: number;
  readonly paused: boolean;
  muted: boolean;
  volume: number;
}

export class BasePlayer {
  constructor(readonly video: VideoLike) {}
}

export function Playable<TBase extends Constructor<BasePlayer>>(Base: TBase) {
  return class Playable extends Base {
    @logged
    play(): Promise<void> {
      return this.video.play();
    }

    @logged
    pause(): void {
      this.video.pause();
    }

    togglePlay(): void {
      if (this.video.paused) void this.play();
      else this.pause();
    }

    get isPlaying(): boolean {
      return !this.video.paused;
    }
  };
}

export function Seekable<TBase extends Constructor<BasePlayer>>(Base: TBase) {
  return class Seekable extends Base {
    /** Jumps to `seconds`, kept within [0, duration]. */
    @logged
    seek(seconds: number): void {
      // duration is NaN until the metadata is loaded (preload="none"): everything clamps to 0 then.
      const end = Number.isFinite(this.video.duration) ? this.video.duration : 0;
      this.video.currentTime = Math.min(Math.max(0, seconds || 0), end);
    }

    skip(deltaSeconds: number): void {
      this.seek(this.video.currentTime + deltaSeconds);
    }
  };
}

export function Audible<TBase extends Constructor<BasePlayer>>(Base: TBase) {
  return class Audible extends Base {
    get volume(): number {
      return this.video.volume;
    }

    @clamp(0, 1) // M3
    set volume(value: number) {
      this.video.volume = value;
    }

    changeVolume(delta: number): void {
      this.volume = Math.round((this.volume + delta) * 10) / 10;
    }

    toggleMute(): void {
      this.video.muted = !this.video.muted;
    }
  };
}

/**
 * M2 — The hover preview: muted, from 10 % of the video, then back to the start.
 *
 * TODO M2.1: this mixin CALLS play(), pause() and seek(). Constrain TBase so that
 *            Previewable(BasePlayer) does not compile, but Previewable(Seekable(Playable(BasePlayer))) does.
 * TODO M2.2: implement startPreview() and stopPreview() (see README).
 */
export function Previewable<TBase extends Constructor<BasePlayer>>(Base: TBase) {
  return class Previewable extends Base {
    startPreview(): Promise<void> {
      return todo('M2');
    }

    stopPreview(): void {
      todo('M2');
    }
  };
}

export class VideoPlayer extends Audible(Previewable(Seekable(Playable(BasePlayer)))) {}
