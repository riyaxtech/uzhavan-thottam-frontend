import crypto from 'crypto';

const getSecret = () => process.env.ADMIN_JWT_SECRET || 'uzhavan_thottam_admin_fallback_secret_key_2026';

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 * Token format: <base64url_payload>.<base64url_signature>
 */
export const createAdminToken = (payload = {}) => {
  const secret = getSecret();
  const tokenPayload = {
    ...payload,
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours validity
  };

  const payloadString = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadString).digest('base64url');

  return `${payloadString}.${signature}`;
};

/**
 * Verifies the token signature and expiration in constant time.
 */
export const verifyAdminToken = (token) => {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadString, signature] = parts;
  const secret = getSecret();
  const expectedSignature = crypto.createHmac('sha256', secret).update(payloadString).digest('base64url');

  // Constant-time comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadString, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
};

/**
 * Express middleware to protect admin routes
 */
export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Admin authentication token required.',
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAdminToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin session. Please log in again.',
    });
  }

  req.admin = payload;
  next();
};

export default requireAdmin;
