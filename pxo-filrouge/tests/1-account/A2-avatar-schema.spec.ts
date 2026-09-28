/**
 * A2 — AvatarSchema & UploadSchema — runtime test.
 * Run: npm run ex A2
 */
import { describe, expect, it } from 'vitest';
import { AvatarSchema, UploadSchema } from '@/account/account-schema';

const file = (sizeInBytes: number, type: string, name = 'avatar') => new File([new Uint8Array(sizeInBytes)], name, { type });

describe('A2 — AvatarSchema & UploadSchema', () => {
  it('accepts a 1 MB PNG', () => {
    expect(AvatarSchema.safeParse(file(1024 * 1024, 'image/png')).success).toBe(true);
  });

  it('accepts JPEG, WebP and AVIF', () => {
    for (const type of ['image/jpeg', 'image/webp', 'image/avif']) {
      expect(AvatarSchema.safeParse(file(10, type)).success, type).toBe(true);
    }
  });

  it('rejects a file over 2 MB', () => {
    const result = AvatarSchema.safeParse(file(2 * 1024 * 1024 + 1, 'image/png'));

    expect(result.error?.issues.map((i) => i.message)).toEqual(['2 MB maximum']);
  });

  it('rejects a GIF', () => {
    const result = AvatarSchema.safeParse(file(10, 'image/gif'));

    expect(result.error?.issues.map((i) => i.message)).toEqual(['PNG, JPEG, WebP or AVIF only']);
  });

  it('accepts an optional caption of at most 140 characters', () => {
    const avatar = file(10, 'image/png');

    expect(UploadSchema.safeParse({ avatar }).success).toBe(true);
    expect(UploadSchema.safeParse({ avatar, caption: 'Me, in Lorient' }).success).toBe(true);
    expect(UploadSchema.safeParse({ avatar, caption: 'x'.repeat(141) }).success).toBe(false);
  });
});
