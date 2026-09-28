// Pre-coded — renders the comments of a video (bonus B3).
import { countNodes, flattenTree, ThreadSchema } from '@/comments/comments';
import type { MediaId } from '@/media/media-types';
import { html, type SafeHtml } from '@/shared/html';
import { TodoError } from '@/shared/todo';

/** What the API sends: unknown until parsed. One thread has a reply without text — invalid. */
const RAW_THREADS: Record<MediaId, unknown> = {
  vid_generics: [
    {
      id: 'cmt_1',
      author: 'Camille',
      text: 'Enfin des génériques expliqués simplement !',
      replies: [
        { id: 'cmt_2', author: 'Alain', text: 'Merci Camille 🙂', replies: [] },
        {
          id: 'cmt_3',
          author: 'Hugo',
          text: 'Pareil, le Repository<T> est très parlant.',
          replies: [{ id: 'cmt_4', author: 'Camille', text: '+1', replies: [] }],
        },
      ],
    },
    { id: 'cmt_5', author: 'Inès', text: 'Une version avec des contraintes multiples ?', replies: [] },
  ],
  vid_zod: [
    {
      id: 'cmt_6',
      author: 'Léo',
      text: 'z.stringbool() pour les checkbox, je ne connaissais pas.',
      replies: [{ id: 'cmt_7', author: 'Spam bot', text: '', replies: [] }],
    },
  ],
};

export function commentsView(mediaId: MediaId): SafeHtml {
  try {
    const parsed = ThreadSchema.safeParse(RAW_THREADS[mediaId] ?? []);
    if (!parsed.success) {
      return html`<p class="form-alert">These comments could not be loaded (invalid data).</p>`;
    }
    const thread = parsed.data;
    return html`<h3>${countNodes(thread)} comments</h3>
      <ul class="comments">
        ${flattenTree(thread).map(
          ({ node, depth }) =>
            html`<li style="margin-left: ${depth * 1.5}rem"><strong>${node.author}</strong> ${node.text}</li>`,
        )}
      </ul>`;
  } catch (error) {
    if (error instanceof TodoError) return html`<p class="todo">⚠️ ${error.message}: no comments yet.</p>`;
    throw error;
  }
}
