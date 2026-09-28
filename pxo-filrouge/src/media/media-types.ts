// Pre-coded — media model. Template literal types make the file formats part of the type:
// swapping the AVIF and JPEG URLs, or forgetting an extension, does not compile.

export type AvifUrl = `${string}.avif`;
export type JpegUrl = `${string}.jpg` | `${string}.jpeg`;
export type Mp4Url = `${string}.mp4`;
export type WebmUrl = `${string}.webm`;
export type MediaId = `vid_${string}`;

export interface Media {
  id: MediaId;
  title: string;
  durationSeconds: number;
  /** AVIF when the browser supports it, JPEG otherwise. */
  poster: { avif: AvifUrl; jpeg: JpegUrl };
  /** Short silent clip played on hover. WebM is an optional fallback. */
  preview: { mp4: Mp4Url; webm?: WebmUrl };
}

export const CATALOG: readonly Media[] = [
  {
    id: 'vid_generics',
    title: 'Generics, the practical way',
    durationSeconds: 1875,
    poster: { avif: '/media/poster-1.avif', jpeg: '/media/poster-1.jpg' },
    preview: { mp4: '/media/preview-1.mp4', webm: '/media/preview-1.webm' },
  },
  {
    id: 'vid_zod',
    title: 'Zod 4 & <forms> — validate at the boundary',
    durationSeconds: 2410,
    poster: { avif: '/media/poster-2.avif', jpeg: '/media/poster-2.jpg' },
    preview: { mp4: '/media/preview-2.mp4', webm: '/media/preview-2.webm' },
  },
  {
    id: 'vid_infer',
    title: 'infer & distributive conditional types',
    durationSeconds: 3725,
    poster: { avif: '/media/poster-3.avif', jpeg: '/media/poster-3.jpg' },
    preview: { mp4: '/media/preview-3.mp4' },
  },
];
