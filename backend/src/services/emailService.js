const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hello@zedideaarena.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://zedideaarena.com';

const FOUNDER_NAME = 'Sean';

const aiService = (() => {
  try { return require('./aiService'); } catch { return null; }
})();

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function personalizeRole(role) {
  const map = {
    'Student': 'Your next big opportunity could start with one idea.',
    'Entrepreneur': "You're joining thousands of entrepreneurs building tomorrow's startups.",
    'Startup Founder': 'You\'re among founders shaping the future of innovation.',
    'Developer': 'Get ready to collaborate with founders looking for technical talent.',
    'Designer': 'Great ideas need great design. Your skills are in demand.',
    'Investor': 'Discover promising ideas before everyone else.',
    'Creator': 'Turn your creativity into impact. The arena awaits.',
    'Freelancer': 'Find your next big project among emerging startups.',
    'Business Owner': 'Expand your network and discover the next big thing.',
    'Other': 'Everyone has ideas. Here, they compete.',
  };
  return map[role] || 'Welcome to a community where ideas compete and innovators shine.';
}

function baseTemplate(bodyContent) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background-color:#07070a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,sans-serif}
  .container{max-width:520px;margin:0 auto;padding:24px 16px}
  .logo{text-align:center;padding:24px 0 20px}
  .logo img{width:160px;height:auto;display:inline-block}
  .content{background:linear-gradient(135deg,#0f0f14,#1a1a24);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px}
  .footer{text-align:center;padding:24px 0 0;font-size:12px;color:#565666;line-height:1.6}
  .footer a{color:#7c3aed;text-decoration:none}
  .social-links{margin:16px 0}
  .social-links a{display:inline-block;margin:0 6px}
  .social-links img{width:28px;height:28px;border-radius:8px;display:inline-block}
  .signature{font-size:13px;color:#a1a1aa;line-height:1.5;margin:16px 0 0}
  h1{font-size:20px;font-weight:800;color:#fff;margin:0 0 12px;line-height:1.3}
  h2{font-size:16px;font-weight:700;color:#e4e4e7;margin:20px 0 8px}
  p{font-size:15px;color:#a1a1aa;line-height:1.6;margin:0 0 14px}
  .btn{display:inline-block;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;text-align:center;margin:8px 0}
  .btn-primary{background:#7c3aed;color:#fff}
  .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}
  .stat-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;text-align:center}
  .stat-value{font-size:24px;font-weight:800;color:#7c3aed}
  .stat-label{font-size:11px;color:#565666;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-top:4px}
  hr{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0}
  .quote{padding:16px;background:rgba(124,58,237,0.08);border-left:3px solid #7c3aed;border-radius:8px;font-style:italic;color:#a1a1aa;font-size:14px;margin:16px 0}
  .highlight{background:rgba(124,58,237,0.12);border-radius:8px;padding:16px;margin:16px 0;border:1px solid rgba(124,58,237,0.2)}
  .highlight p{color:#e4e4e7;margin:0}
  @media only screen and (max-width:480px){
    .content{padding:20px 16px}
    h1{font-size:18px}
    .container{padding:16px 12px}
  }
</style></head>
<body>
  <div class="container">
    <div class="logo">
      <img src="${FRONTEND_URL}/logo-full-light.png" alt="ZedIdeaArena" width="160" style="max-width:160px;height:auto" />
    </div>
    <div class="content">${bodyContent}</div>
    <div class="footer">
      <div class="social-links">
        <a href="https://x.com/zedideaarena"><img src="${FRONTEND_URL}/social-x.png" alt="X" width="28" height="28" /></a>
        <a href="https://youtube.com/@zedideaarena?sub_confirmation=1"><img src="${FRONTEND_URL}/social-youtube.png" alt="YouTube" width="28" height="28" /></a>
        <a href="https://instagram.com/zedideaarena"><img src="${FRONTEND_URL}/social-instagram.png" alt="Instagram" width="28" height="28" /></a>
      </div>
      <p>ZedIdeaArena — Where ideas compete, innovate wins.</p>
      <p>
        <a href="${FRONTEND_URL}/unsubscribe">Unsubscribe</a> ·
        <a href="${FRONTEND_URL}/docs/privacy">Privacy</a> ·
        <a href="${FRONTEND_URL}/docs/terms">Terms</a>
      </p>
      <p class="signature">— ${FOUNDER_NAME}, founder of ZedIdeaArena</p>
      <p style="font-size:10px;color:#3a3a4a;margin-top:8px">${FRONTEND_URL}</p>
    </div>
  </div>
</body></html>`;
}

async function personalizeIfAvailable(emailType, user) {
  if (!aiService) return { subject: null, intro: null };
  try {
    const [subject, intro] = await Promise.all([
      aiService.generateSubject(emailType, user),
      aiService.generateIntro(emailType, user),
    ]);
    return { subject, intro };
  } catch {
    return { subject: null, intro: null };
  }
}

async function sendVerificationEmail(email, token, name, role) {
  if (!resend) return null;
  try {
    const safeName = escapeHtml(name || 'there');
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    const personalized = role ? personalizeRole(role) : '';
    const ai = await personalizeIfAvailable('verification', { name, role, email });
    const aiIntro = ai.intro ? `<p>${escapeHtml(ai.intro)}</p>` : '';

    const html = baseTemplate(`
      <h1>Welcome to ZedIdeaArena</h1>
      <p>Hey ${safeName},</p>
      <p>I'm ${FOUNDER_NAME}, the founder of ZedIdeaArena. I'm building a place where ideas like yours can compete, get noticed by the right people, and win real rewards.</p>
      ${aiIntro}
      ${personalized ? `<div class="quote">${personalized}</div>` : ''}
      <p style="text-align:center;margin:24px 0">
        <a href="${verifyUrl}" class="btn btn-primary">Verify Your Email</a>
      </p>
      <p style="font-size:13px;color:#565666">This link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
      <hr>
      <p>Once you verify, I'll walk you through the onboarding myself — it takes just a few minutes and helps me tailor the experience to what you're looking for.</p>
      <p class="signature">Speak soon,<br>— ${FOUNDER_NAME}</p>
    `);

    const subject = ai.subject || 'Welcome to ZedIdeaArena — Verify your email';
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to: email, subject, html });
    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error('[EMAIL] Verification email failed:', err.message);
    return null;
  }
}

async function sendWelcomeEmail(email, name, role, referralCode) {
  if (!resend) return null;
  try {
    const safeName = escapeHtml(name || 'there');
    const referralUrl = `${FRONTEND_URL}/waitlist?ref=${encodeURIComponent(referralCode || '')}`;
    const ai = await personalizeIfAvailable('welcome', { name, role, email });
    const aiIntro = ai.intro ? `<p>${escapeHtml(ai.intro)}</p>` : '';

    const html = baseTemplate(`
      <h1>You're in! Welcome to the arena</h1>
      <p>Hey ${safeName},</p>
      <p>I'm ${FOUNDER_NAME}. Your email is verified, and you're officially part of the ZedIdeaArena community. I'm honestly thrilled to have you on board.</p>
      ${aiIntro}
      <p>I wanted to give you a personal look at what's coming:</p>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">Q4 2026</div>
          <div class="stat-label">Platform Launch</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">🌍</div>
          <div class="stat-label">Global Community</div>
        </div>
      </div>
      <h2>Spread the word — earn priority access</h2>
      <p>The more people you invite, the higher you move on the waitlist. Your personal referral link:</p>
      <p style="text-align:center;margin:20px 0">
        <a href="${referralUrl}" class="btn btn-primary">Share Your Referral Link</a>
      </p>
      <hr>
      <p>Over the next few weeks, I'll be sharing behind-the-scenes updates, previewing features, and asking for your feedback. This platform is being built with people like you in mind.</p>
      <p class="signature">Let's build something extraordinary together,<br>— ${FOUNDER_NAME}</p>
    `);

    const subject = ai.subject || "You're officially on the waitlist";
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to: email, subject, html });
    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error('[EMAIL] Welcome email failed:', err.message);
    return null;
  }
}

async function sendBehindTheScenesEmail(email, name) {
  if (!resend) return null;
  try {
    const safeName = escapeHtml(name || 'there');
    const ai = await personalizeIfAvailable('behind_scenes', { name, email });
    const aiIntro = ai.intro ? `<p>${escapeHtml(ai.intro)}</p>` : '';

    const html = baseTemplate(`
      <h1>What I've been building this week</h1>
      <p>Hey ${safeName},</p>
      <p>I wanted to share a personal update on what's happening behind the scenes at ZedIdeaArena.</p>
      ${aiIntro}
      <h2>✅ What's live</h2>
      <p>The core platform infrastructure is up — user accounts, authentication, and our competition engine are all running. It's been months of late nights, but seeing it come together makes it all worth it.</p>
      <h2>🛠️ What I'm working on now</h2>
      <p>The idea submission flow is being refined, the voting system is taking shape, and I'm designing the arena experience based on feedback from waitlist members like you.</p>
      <h2>🔮 What's on the roadmap</h2>
      <p>Collaborator matching, investor discovery, and real-time competition leaderboards. If there's something you'd love to see, just reply to this email — I read every response.</p>
      <hr>
      <p>Thanks for being part of this journey. More updates coming soon.</p>
      <p class="signature">Building the future,<br>— ${FOUNDER_NAME}</p>
    `);

    const subject = ai.subject || "Here's what I've been building this week";
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to: email, subject, html });
    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error('[EMAIL] Behind-the-scenes email failed:', err.message);
    return null;
  }
}

async function sendFeaturePreviewEmail(email, name, features) {
  if (!resend) return null;
  try {
    const safeName = escapeHtml(name || 'there');
    const featureList = (features || ['Idea Validation', 'Idea Marketplace', 'Founder Profiles', 'Innovation Leaderboard', 'Investor Discovery'])
      .map(f => `<div class="stat-card"><div class="stat-label">${escapeHtml(f)}</div></div>`)
      .join('');
    const ai = await personalizeIfAvailable('feature_preview', { name, email });
    const aiIntro = ai.intro ? `<p>${escapeHtml(ai.intro)}</p>` : '';

    const html = baseTemplate(`
      <h1>A first look at what's coming</h1>
      <p>Hey ${safeName},</p>
      <p>I'm excited to share a preview of the features we're building. Each one is designed to help you go from idea to impact faster.</p>
      ${aiIntro}
      <div class="stat-grid">${featureList}</div>
      <p>I'd love your thoughts — what excites you most? What's missing? Hit reply and let me know.</p>
      <p>Your feedback is shaping what we build next.</p>
      <p class="signature">Can't wait to show you more,<br>— ${FOUNDER_NAME}</p>
    `);

    const subject = ai.subject || 'New feature preview';
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to: email, subject, html });
    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error('[EMAIL] Feature preview email failed:', err.message);
    return null;
  }
}

async function sendLaunchCountdownEmail(email, name, daysUntilLaunch) {
  if (!resend) return null;
  try {
    const safeName = escapeHtml(name || 'there');
    const days = daysUntilLaunch || 90;
    const ai = await personalizeIfAvailable('launch_countdown', { name, email });
    const aiIntro = ai.intro ? `<p>${escapeHtml(ai.intro)}</p>` : '';

    const html = baseTemplate(`
      <h1>We're ${days} days from launch</h1>
      <p>Hey ${safeName},</p>
      <p>The countdown is real. In approximately <strong style="color:#7c3aed;font-size:32px">${days}</strong> days, ZedIdeaArena opens its doors — and you'll be among the first inside.</p>
      ${aiIntro}
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">${days}</div>
          <div class="stat-label">Days to Launch</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">🚀</div>
          <div class="stat-label">Launch Phase</div>
        </div>
      </div>
      <h2>Invite your friends</h2>
      <p>The stronger our community at launch, the better the experience for everyone. Share your referral link and earn early access perks.</p>
      <p style="text-align:center;margin:20px 0">
        <a href="${FRONTEND_URL}/waitlist" class="btn btn-primary">Invite Friends</a>
      </p>
      <p>Thank you for being part of this journey. Launch day will be here before we know it, and I can't wait to see you in the arena.</p>
      <p class="signature">See you at launch,<br>— ${FOUNDER_NAME}</p>
    `);

    const subject = ai.subject || `We're ${days} days from launch`;
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to: email, subject, html });
    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error('[EMAIL] Launch countdown email failed:', err.message);
    return null;
  }
}

let resend = null;
if (RESEND_API_KEY && RESEND_API_KEY !== 're_...') {
  resend = new Resend(RESEND_API_KEY);
} else {
  console.warn('[EMAIL] RESEND_API_KEY not set — emails will be skipped');
}

module.exports = {
  sendIdeaConfirmation: async (email, ideaTitle) => {
    if (!resend) return;
    const safeTitle = escapeHtml(ideaTitle);
    const html = baseTemplate(`<h1>We received your idea</h1><p>Hey there,</p><p>Thank you for submitting <strong>${safeTitle}</strong> to ZedIdeaArena. Our team will review it and notify you once it's approved.</p><p class="signature">— ${FOUNDER_NAME}</p>`);
    try { await resend.emails.send({ from: FROM_EMAIL, to: email, subject: 'Your idea submission was received', html }); }
    catch (err) { console.error('[EMAIL] ideaConfirmation:', err.message); }
  },
  sendIdeaApproved: async (email, ideaTitle) => {
    if (!resend) return;
    const safeTitle = escapeHtml(ideaTitle);
    const html = baseTemplate(`<h1>Your idea is live!</h1><p>Great news — <strong>${safeTitle}</strong> is now live on ZedIdeaArena.</p><p>Share your pitch with your network and start getting votes!</p><p class="signature">Proud of what you're building,<br>— ${FOUNDER_NAME}</p>`);
    try { await resend.emails.send({ from: FROM_EMAIL, to: email, subject: 'Your idea is now live!', html }); }
    catch (err) { console.error('[EMAIL] ideaApproved:', err.message); }
  },
  sendIdeaRejected: async (email, ideaTitle, adminNote = '') => {
    if (!resend) return;
    const safeTitle = escapeHtml(ideaTitle);
    const safeNote = escapeHtml(adminNote);
    const noteHtml = safeNote ? `<div class="quote">${safeNote}</div>` : '';
    const html = baseTemplate(`<h1>Update on your submission</h1><p>Regarding <strong>${safeTitle}</strong> — we're unable to approve your idea at this time.</p>${noteHtml}<p>You're welcome to revise and resubmit. I'd love to see your next iteration.</p><p class="signature">— ${FOUNDER_NAME}</p>`);
    try { await resend.emails.send({ from: FROM_EMAIL, to: email, subject: 'Update on your submission', html }); }
    catch (err) { console.error('[EMAIL] ideaRejected:', err.message); }
  },
  sendVoterVerified: async (email) => {
    if (!resend) return;
    const html = baseTemplate(`<h1>You're verified!</h1><p>Your voter account has been verified. You can now vote on ideas in competitions you've registered for.</p><p>Your voice matters in the arena.</p><p class="signature">— ${FOUNDER_NAME}</p>`);
    try { await resend.emails.send({ from: FROM_EMAIL, to: email, subject: 'You can now vote!', html }); }
    catch (err) { console.error('[EMAIL] voterVerified:', err.message); }
  },
  sendCollaboratorInvite: async (email, ideaTitle, inviterName, role) => {
    if (!resend) return;
    const safeTitle = escapeHtml(ideaTitle);
    const safeName = escapeHtml(inviterName);
    const pitchUrl = `${FRONTEND_URL}/pitch/${encodeURIComponent(ideaTitle)}`;
    const roleHtml = role ? `<p>Your role: <strong>${escapeHtml(role)}</strong></p>` : '';
    const html = baseTemplate(`<h1>Collaboration invitation</h1><p><strong>${safeName}</strong> has invited you to collaborate on <strong>${safeTitle}</strong>.</p>${roleHtml}<p style="text-align:center;margin:20px 0"><a href="${pitchUrl}" class="btn btn-primary">View Pitch</a></p><p>I love seeing collaborations form — this is what the arena is all about.</p><p class="signature">— ${FOUNDER_NAME}</p>`);
    try { await resend.emails.send({ from: FROM_EMAIL, to: email, subject: `You've been invited to collaborate on "${safeTitle}"`, html }); }
    catch (err) { console.error('[EMAIL] collaboratorInvite:', err.message); }
  },
  sendVerificationEmail,
  sendWelcomeEmail,
  sendBehindTheScenesEmail,
  sendFeaturePreviewEmail,
  sendLaunchCountdownEmail,
};
