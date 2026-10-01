// Déjà codé — la liste des pays utilisée par le formulaire d'inscription.
//
// `as const` garde chaque code comme type littéral ('FR', pas string) : l'union des codes
// valides est dérivée des données. Ajoutez un pays ici, le type suit.

export const COUNTRIES = [
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'BE', name: 'Belgique', dialCode: '+32' },
  { code: 'CH', name: 'Suisse', dialCode: '+41' },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'DE', name: 'Deutschland', dialCode: '+49' },
  { code: 'ES', name: 'España', dialCode: '+34' },
  { code: 'IT', name: 'Italia', dialCode: '+39' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'US', name: 'United States', dialCode: '+1' },
] as const;

export type Country = (typeof COUNTRIES)[number];
export type CountryCode = Country['code'];

/** ['FR', 'BE', …] typé comme un tuple non vide de littéraux — exactement ce qu'attend z.enum(). */
export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [CountryCode, ...CountryCode[]];

/** 'FR' → '🇫🇷' (deux symboles « regional indicator »). */
export function flagEmoji(code: CountryCode): string {
  return String.fromCodePoint(...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65));
}
