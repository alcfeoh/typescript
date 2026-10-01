// Déjà codé — affiche les commentaires d'une vidéo (bonus B3).
import { countNodes, flattenTree, ThreadSchema } from '@/comments/comments';
import type { MediaId } from '@/media/media-types';
import { html, type SafeHtml } from '@/shared/html';
import { TodoError } from '@/shared/todo';

/** Ce que l'API envoie : unknown tant que ce n'est pas validé. Un fil contient une réponse sans texte — invalide. */
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
