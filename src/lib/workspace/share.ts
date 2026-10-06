import { compressSync, decompressSync, strFromU8, strToU8 } from 'fflate';
import type { WorkspaceDocument } from './types';

const BASE_PATH = '/docs';
const SHARE_VERSION = '1';
const MAX_COVER_BYTES = 320_000;
const MAX_SHARE_URL_LENGTH = 16_000;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function encodeSharedDocument(document: WorkspaceDocument): string {
  const coverDataUrl =
    document.coverDataUrl && document.coverDataUrl.length <= MAX_COVER_BYTES
      ? document.coverDataUrl
      : undefined;

  const payload = JSON.stringify({
    v: SHARE_VERSION,
    title: document.title,
    content: document.content,
    icon: document.icon,
    coverDataUrl,
    published: document.published,
    updatedAt: document.updatedAt,
  });

  return bytesToBase64Url(compressSync(strToU8(payload), { level: 9 }));
}

export function decodeSharedDocument(token: string): Partial<WorkspaceDocument> | null {
  try {
    const bytes = base64UrlToBytes(token);
    const payload = JSON.parse(strFromU8(decompressSync(bytes)));

    if (payload?.v !== SHARE_VERSION || typeof payload.title !== 'string') return null;

    return {
      title: payload.title,
      content: typeof payload.content === 'string' ? payload.content : '',
      icon: typeof payload.icon === 'string' ? payload.icon : '·',
      coverDataUrl:
        typeof payload.coverDataUrl === 'string' &&
        payload.coverDataUrl.length <= MAX_COVER_BYTES &&
        /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(payload.coverDataUrl)
          ? payload.coverDataUrl
          : undefined,
      published: payload.published !== false,
      updatedAt:
        typeof payload.updatedAt === 'string' ? payload.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function createShareUrl(document: WorkspaceDocument): string {
  const token = encodeSharedDocument(document);
  const url = window.location.origin + BASE_PATH + '/publish/#d=' + token;

  if (url.length > MAX_SHARE_URL_LENGTH) {
    throw new Error(
      'Dokument je pro sdílený odkaz příliš velký. Použij Zálohu JSON nebo zkrať obsah.',
    );
  }

  return url;
}
