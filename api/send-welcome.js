// api/send-welcome.js - TEMPORARY DIAGNOSTIC VERSION
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'API is running!',
    nodeVersion: process.version,
    hasFirebaseKey: !!process.env.FIREBASE_PRIVATE_KEY,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasResendKey: !!process.env.RESEND_API_KEY,
    keyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0
  });
}