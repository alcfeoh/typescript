// Le lecteur vidéo, construit à partir de mixins (Module D). Playable, Seekable et Audible sont déjà codés.
import { clamp } from '@/shared/clamp';
import { logged } from '@/shared/decorators';
import type { Constructor } from '@/shared/mixins';
import { todo } from '@/shared/todo';

/** La partie de HTMLVideoElement dont le lecteur se sert. Dans les tests, un faux objet suffit. */
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
    /** Va à `seconds`, borné entre 0 et la durée. */
    @logged
    seek(seconds: number): void {
      // duration vaut NaN tant que les métadonnées ne sont pas chargées (preload="none") : tout est alors ramené à 0.
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
 * M2 — L'aperçu au survol : sans le son, à partir de 10 % de la vidéo, puis retour au début.
 *
 * TODO M2.1 : ce mixin APPELLE play(), pause() et seek(). Contraignez TBase pour que
 *            Previewable(BasePlayer) ne compile pas, mais que Previewable(Seekable(Playable(BasePlayer))) compile.
 * TODO M2.2 : écrivez startPreview() et stopPreview() (voir README).
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
