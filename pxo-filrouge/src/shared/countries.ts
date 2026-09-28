// Pre-coded — the country list used by the sign-up form.
//
// `as const` keeps every code as a literal type ('FR', not string), so the union of
// valid codes is derived from the data: add a country here, the type follows.

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

/** ['FR', 'BE', …] typed as a non-empty tuple of literals — exactly what z.enum() expects. */
export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [CountryCode, ...CountryCode[]];

/** 'FR' → '🇫🇷' (two regional indicator symbols). */
export function flagEmoji(code: CountryCode): string {
  return String.fromCodePoint(...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65));
}
