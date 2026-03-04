import crypto from 'crypto';

let currentSalt = crypto.randomBytes(32).toString('hex');
let saltDate = new Date().toISOString().slice(0, 10);

function getSalt(): string {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== saltDate) {
    currentSalt = crypto.randomBytes(32).toString('hex');
    saltDate = today;
  }
  return currentSalt;
}

/**
 * Privacy-preserving session ID.
 * Hash of: site_id + IP + User-Agent + daily salt
 *
 * - Not reversible (SHA-256)
 * - Not linkable across days (salt rotates at midnight)
 * - Not linkable across sites (site_id included)
 * - No cookies needed
 */
export function getSessionId(siteId: string, ip: string, userAgent: string): string {
  const salt = getSalt();
  return crypto
    .createHash('sha256')
    .update(`${siteId}:${ip}:${userAgent}:${salt}`)
    .digest('hex')
    .slice(0, 16);
}