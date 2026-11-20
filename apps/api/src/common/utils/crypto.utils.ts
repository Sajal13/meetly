import { randomBytes, randomInt } from 'crypto';

export function generateOtpCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += randomInt(0, 10).toString();
  }
  return code;
}

export function generateSecureToken(bytes = 48): string {
  return randomBytes(bytes).toString('hex');
}
