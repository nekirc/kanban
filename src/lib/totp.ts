import { authenticator } from 'otplib';
import qrcode from 'qrcode';

export function generateTwoFactorSecret() {
  const secret = authenticator.generateSecret();
  return secret;
}

export function generateOtpauthUrl(email: string, secret: string) {
  return authenticator.keyuri(email, 'ZenFlow', secret);
}

export async function generateQrCodeDataURL(otpauthUrl: string) {
  return qrcode.toDataURL(otpauthUrl);
}

export function verifyTwoFactorToken(token: string, secret: string) {
  return authenticator.verify({ token, secret });
}
