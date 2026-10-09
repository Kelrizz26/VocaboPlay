// api/send-reminder.js
// Cron job: sends inactivity reminders (daily) + weekly reminders (Monday)

import { Resend } from 'resend';
import { db } from './_firebase.mjs';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = 'https://vocabo-play-xi.vercel.app';
const FROM_EMAIL = 'VocaboPlay <onboarding@resend.dev>';

const INACTIVITY_MESSAGES = [
  {
    subject: (name) => `We miss you, ${name}! 💙`,
    intro: (name) => `Hey ${name}! It's been a while since your last game.`,
    body: "Your vocabulary games are waiting for you! Come back and continue learning.",
  },
  {
    subject: (name) => `What's up, ${name}? Ready to play again? 🎮`,
    intro: (name) => `Hi ${name}, your words miss you!`,
    body: "Come back and continue learning — your streak is waiting!",
  },
  {
    subject: (name) => `Your vocabulary is waiting, ${name}! 📚`,
    intro: (name) => `What's up, ${name}!`,
    body: "Ready to play again? Come back to VocaboPlay and beat your high score!",
  },
];

const WEEKLY_MESSAGES = [
  {
    subject: (name) => `New week, new challenge, ${name}! 🏆`,
    intro: (name) => `Happy Monday, ${name}!`,
    body: "Start your week strong — keep learning and improve your score!",
  },
  {
    subject: (name) => `Ready to level up, ${name}? ⚡`,
    intro: (name) => `Hey ${name}, it's a brand new week!`,
    body: "Your vocabulary games are waiting for you! Come back and continue learning.",
  },
  {
    subject: (name) => `Time to play, ${name}! 🎮`,
    intro: (name) => `What's up, ${name}!`,
    body: "Ready to play again? Come back to VocaboPlay!",
  },
];

const emailHtml = (name, intro, body) => `
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
        <div style="font-size:64px;line-height:1;">🎮</div>
      </div>
      <h1 style="color:#2A2845;font-size:24px;font-weight:800;margin:0 0 12px 0;text-align:center;font-family:'Fredoka',Arial,sans-serif;">
        ${intro}
      </h1>
      <p style="color:#6B6880;font-size:15px;line-height:1.6;margin:0 0 24px 0;text-align:center;">
        ${body}
      </p>
      <div style="text-align:center;margin:32px 0 20px 0;">
        <a href="${APP_URL}/games" style="display:inline-block;background:linear-gradient(135deg,#E9A075,#DB7A64);color:#FFFFFF;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:800;font-size:15px;font-family:'Fredoka',Arial,sans-serif;box-shadow:0 4px 0 #C27E4F;">
          🚀 Play Now
        </a>
      </div>
      <p style="color:#8A8799;font-size:12px;text-align:center;margin:24px 0 0 0;line-height:1.6;">
        Keep learning, keep growing. See you soon! 💙
      </p>
    </div>
  </div>
</body>
</html>
`;

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = req.query.manual === 'true';

  if (!isCron && !isManual) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const mode = req.query.mode || 'inactivity';
  console.log(`📧 Sending ${mode} reminders...`);

  try {
    let usersSnapshot;

    if (mode === 'inactivity') {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      usersSnapshot = await db.collection('users')
        .where('lastActive', '<', threeDaysAgo)
        .limit(100)
        .get();
    } else if (mode === 'weekly') {
      usersSnapshot = await db.collection('users')
        .limit(100)
        .get();
    } else {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    if (usersSnapshot.empty) {
      console.log('No users to email');
      return res.status(200).json({ success: true, sent: 0 });
    }

    const messages = mode === 'inactivity' ? INACTIVITY_MESSAGES : WEEKLY_MESSAGES;
    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const email = userData.email;

      if (!email) continue;

      const lastReminder = userData.lastReminderSentAt;
      if (lastReminder) {
        const daysSince = (Date.now() - new Date(lastReminder).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) continue;
      }

      const firstName = (userData.displayName || email.split('@')[0] || 'there').split(' ')[0];
      const msg = messages[Math.floor(Math.random() * messages.length)];

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: msg.subject(firstName),
          html: emailHtml(firstName, msg.intro(firstName), msg.body),
        });

        await doc.ref.set(
          { lastReminderSentAt: new Date().toISOString() },
          { merge: true }
        );

        sent++;
        await new Promise(r => setTimeout(r, 100));
      } catch (emailError) {
        failed++;
        errors.push({ email, error: emailError.message });
        console.error(`Failed to send to ${email}:`, emailError.message);
      }
    }

    console.log(`✅ Sent: ${sent}, Failed: ${failed}`);
    return res.status(200).json({ success: true, sent, failed, errors: errors.slice(0, 5) });
  } catch (error) {
    console.error('Reminder error:', error);
    return res.status(500).json({ error: 'Failed to send reminders', details: error.message });
  }
}