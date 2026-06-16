export interface TokenPayload {
  exp: number;
}

const textEncoder = new TextEncoder();

const toBase64Url = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
};

const fromBase64Url = (value: string): Uint8Array => {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
};

const getKey = (secret: string) =>
  crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );

export const signToken = async (secret: string, maxAgeSeconds = 60 * 60 * 8): Promise<string> => {
  const payload: TokenPayload = {
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const payloadPart = toBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(payloadPart));

  return `${payloadPart}.${toBase64Url(signature)}`;
};

export const verifyToken = async (token: string, secret: string): Promise<boolean> => {
  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) return false;

  const key = await getKey(secret);
  const verified = await crypto.subtle.verify(
    'HMAC',
    key,
    toArrayBuffer(fromBase64Url(signaturePart)),
    textEncoder.encode(payloadPart),
  );
  if (!verified) return false;

  const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadPart))) as TokenPayload;
  return payload.exp > Math.floor(Date.now() / 1000);
};

export const getBearerToken = (request: Request): string | null => {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  return authorization.slice('Bearer '.length);
};

export const verifyPassword = async (password: string, expected: string): Promise<boolean> => {
  if (!expected) return false;
  if (!expected.startsWith('sha256:')) return password === expected;

  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(password));
  return `sha256:${toBase64Url(digest)}` === expected;
};
