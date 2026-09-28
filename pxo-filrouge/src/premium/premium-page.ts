// Pre-coded — the premium offer picker (bonus B2).
import { monthlyCost, OFFERS, priceLabel, type Offer } from '@/premium/offers';
import { $ } from '@/shared/dom';
import { formatPrice } from '@/shared/format';
import { html, render } from '@/shared/html';
import { TodoError } from '@/shared/todo';

export function mountPremium(root: HTMLElement): void {
  let labels: string[];
  try {
    labels = OFFERS.map((offer: Offer) => priceLabel(offer));
  } catch (error) {
    if (!(error instanceof TodoError)) throw error;
    render(root, html`<section class="card todo"><h2>Premium</h2><p>⚠️ ${error.message}.</p></section>`);
    return;
  }

  render(
    root,
    html`<form id="offer-form" class="card">
      <h2>Choose your plan</h2>
      ${OFFERS.map(
        (offer, i) =>
          html`<label class="inline offer"><input type="radio" name="offer" value="${i}" ${i === 0 && 'checked'} />
            <strong>${offer.kind}</strong> — ${labels[i]}</label>`,
      )}
      <output id="per-month"></output>
    </form>`,
  );

  const form = $<HTMLFormElement>('#offer-form', root);
  const output = $('#per-month', form);
  form.addEventListener('change', () => {
    const offer = OFFERS[Number(new FormData(form).get('offer'))];
    output.textContent = offer && offer.kind !== 'free' ? `≈ ${formatPrice(monthlyCost(offer))} / month` : '';
  });
}
