// api/send-welcome.js
// Sends welcome email after user signs up

import { Resend } from 'resend';
import { auth, db } from './_firebase.mjs';

const resend = new Resend(process.env.RESEND_API_KEY);

const welcomeHtml = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Nunito','Segoe UI',Arial,sans-serif;background:#FDF9F3;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#FFFFFF;border-radius:20px;padding:40px 32px;box-shadow:0 4px 20px rgba(42,40,69,0.08);border:1px solid #EBE2D5;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:64px;line-height:1;">🎉</div>
      </div>
      <h1 style="color:#2A2845;font-size:26px;font-weight:800;margin:0 0 12px 0;text-align:center;font-family:'Fredoka',Arial,sans-serif;">
        Welcome to VocaboPlay, ${name}!
      </h1>
      <p style="color:#6B6880;font-size:15px;line-height:1.6;margin:0 0 20px 0;text-align:center;">
        Your vocabulary journey starts now! 🚀<br>
        Play games, learn new words, and level up your English.
      </p>
      <div style="background:#F5EFE6;border-radius:12px;padding:20px;margin:24px 0;border-left:4px solid #E9A075;">
        <p style="color:#2A2845;font-size:14px;font-weight:700;margin:0 0 8px 0;">
          📚 What you can do:
        </p>
        <ul style="color:#6B6880;font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
          <li>Play vocabulary games (A1 to C2 levels)</li>
          <li>Track your progress and streaks</li>
          <li>Compete on the leaderboards</li>
          <li>Collect diamonds and unlock avatars</li>
        </ul>
      </div>
      <div style="text-align:center;margin:32px 0 20px 0;">
        <a href="https://vocabo-play-xi.vercel.app" style="display:inline-block;background:linear-gradient(135deg,#E9A075,#DB7A64);color:#FFFFFF;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:800;font-size:15px;font-family:'Fredoka',Arial,sans-serif;box-shadow:0 4px 0 #C27E4F;">
          🎮 Start Playing
        </a>
      </div>
      <p style="color:#8A8799;font-size:12px;text-align:center;margin:24px 0 0 0;line-height:1.6;">
        Ready to play again? Come back to VocaboPlay!<br>
        Keep learning and improve your score!
      </p>
    </div>
    <p style="color:#8A8799;font-size:11px;text-align:center;margin:24px 0 0 0;line-height:1.6;">
      You're receiving this email because you signed up for VocaboPlay.
    </p>
  </div>
</body>
</html>
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken' });
    }

    const decoded = await auth.verifyIdToken(idToken);
    const user = await auth.getUser(decoded.uid);

    if (!user.email) {
      return res.status(400).json({ error: 'User has no email' });
    }

    const firstName = (user.displayName || user.email.split('@')[0] || 'there').split(' ')[0];

    const userRef = db.collection('users').doc(decoded.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists && userDoc.data()?.welcomeEmailSent) {
      return res.status(200).json({ success: true, message: 'Already sent' });
    }

    const result = await resend.emails.send({
      from: 'VocaboPlay <onboarding@resend.dev>',
      to: user.email,
      subject: `Welcome to VocaboPlay, ${firstName}! 🎉`,
      html: welcomeHtml(firstName),
    });

    await userRef.set(
      { welcomeEmailSent: true, welcomeEmailSentAt: new Date().toISOString() },
      { merge: true }
    );

    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error('Welcome email error:', error);
    return res.status(500).json({ error: 'Failed to send welcome email' });
  }
}