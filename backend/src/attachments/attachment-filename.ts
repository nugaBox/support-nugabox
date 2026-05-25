const MOJIBAKE_MARKERS = /[\u0080-\u009f]|\u00c3|\u00c2|\u00e2[\u0080-\u00bf]/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f]/g;

export function normalizeAttachmentFileName(originalName: string): string {
  const decoded = decodeLatin1Mojibake(originalName);
  const fileName = stripPathSegments(decoded).replace(CONTROL_CHARS, '').trim();

  return (fileName || 'attachment').normalize('NFC');
}

export function createAttachmentDisposition(fileName: string): string {
  const normalized = normalizeAttachmentFileName(fileName);
  const fallback = createAsciiFallback(normalized);

  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeRfc5987(normalized)}`;
}

function decodeLatin1Mojibake(value: string): string {
  if (!MOJIBAKE_MARKERS.test(value)) {
    return value.normalize('NFC');
  }

  const decoded = Buffer.from(value, 'latin1').toString('utf8');
  if (decoded.includes('\uFFFD')) {
    return value.normalize('NFC');
  }

  return decoded.normalize('NFC');
}

function stripPathSegments(value: string): string {
  const segments = value.split(/[\\/]/).filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : value;
}

function createAsciiFallback(value: string): string {
  const fallback = value
    .replace(/[^\x20-\x7e]/g, '_')
    .replace(/[\\"]/g, '_')
    .trim();

  return fallback || 'attachment';
}

function encodeRfc5987(value: string): string {
  return encodeURIComponent(value)
    .replace(/['()]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/\*/g, '%2A');
}
