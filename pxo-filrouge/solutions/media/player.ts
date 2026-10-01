// Solution — M2 (Previewable). Le reste est identique à src/media/player.ts.
import { clamp } from '@/shared/clamp';
import { logged } from '@/shared/decorators';
import type { Constructor } from '@/shared/mixins';

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

/** Ce dont Previewable a besoin dans la classe qu'il étend. */
interface PlaybackControls {
  play(): Promise<void>;
  pause(): void;
  seek(seconds: number): void;
}

/**
 * M2 — L'aperçu au survol : sans le son, à partir de 10 % de la vidéo, puis retour au début.
 * La contrainte est le contrat : le mixin ne s'applique que sur une classe
 * qui sait déjà lire, mettre en pause et se déplacer dans la vidéo.
 */
export function Previewable<TBase extends Constructor<BasePlayer & PlaybackControls>>(Base: TBase) {
  return class Previewable extends Base {
    #wasMuted = false;

    startPreview(): Promise<void> {
      this.#wasMuted = this.video.muted;
      this.video.muted = true;
      this.seek(this.video.duration * 0.1);
      return this.play();
    }

    stopPreview(): void {
      this.pause();
      this.seek(0);
      this.video.muted = this.#wasMuted;
    }
  };
}

export class VideoPlayer extends Audible(Previewable(Seekable(Playable(BasePlayer)))) {}
