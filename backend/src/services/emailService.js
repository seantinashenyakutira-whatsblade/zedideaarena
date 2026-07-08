const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hello@zedideaarena.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://zedideaarena.com';

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function baseTemplate(bodyContent) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background-color:#07070a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,sans-serif}
  .container{max-width:520px;margin:0 auto;padding:24px 16px}
  .logo{text-align:center;padding:32px 0 24px}
  .logo-text{font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px}
  .logo-accent{color:#7c3aed}
  .content{background:linear-gradient(135deg,#0f0f14,#1a1a24);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px}
  .footer{text-align:center;padding:24px 0 0;font-size:12px;color:#565666;line-height:1.6}
  .footer a{color:#7c3aed;text-decoration:none}
  .social-links{margin:16px 0}
  .social-links a{display:inline-block;margin:0 6px;padding:8px;border-radius:8px;background:rgba(255,255,255,0.05)}
  h1{font-size:22px;font-weight:800;color:#fff;margin:0 0 12px;line-height:1.3}
  h2{font-size:17px;font-weight:700;color:#e4e4e7;margin:24px 0 8px}
  p{font-size:15px;color:#a1a1aa;line-height:1.6;margin:0 0 16px}
  .btn{display:inline-block;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;text-align:center;margin:8px 0}
  .btn-primary{background:#7c3aed;color:#fff}
  .btn-primary:hover{background:#6d28d9}
  .btn-outline{border:1px solid rgba(255,255,255,0.15);color:#e4e4e7}
  .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}
  .stat-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;text-align:center}
  .stat-value{font-size:24px;font-weight:800;color:#7c3aed}
  .stat-label{font-size:11px;color:#565666;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-top:4px}
  hr{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0}
  .quote{padding:16px;background:rgba(124,58,237,0.08);border-left:3px solid #7c3aed;border-radius:8px;font-style:italic;color:#a1a1aa;font-size:14px;margin:16px 0}
  @media only screen and (max-width:480px){
    .content{padding:20px 16px}
    h1{font-size:19px}
    .container{padding:16px 12px}
  }
</style></head>
<body>
  <div class="container">
    <div class="logo">
      <div class="logo-text">Zed<span class="logo-accent">Idea</span>Arena</div>
    </div>
    <div class="content">${bodyContent}</div>
    <div class="footer">
      <div class="social-links">
        <a href="https://x.com/zedideaarena">𝕏</a>
        <a href="https://youtube.com/@zedideaarena">▶</a>
        <a href="https://instagram.com/zedideaarena">📷</a>
      </div>
      <p>ZedIdeaArena — Where ideas compete, innovate wins.</p>
      <p>
        <a href="${FRONTEND_URL}/unsubscribe">Unsubscribe</a> ·
        <a href="${FRONTEND_URL}/docs/privacy">Privacy</a> ·
        <a href="${FRONTEND_URL}/docs/terms">Terms</a>
      </p>
      <p>${FRONTEND_URL}</p>
    </div>
  </div>
</body></html>`;
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

async function sendVerificationEmail(email, token, name, role) {
  if (!resend) return null;
  try {
    const safeName = escapeHtml(name || 'there');
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    const personalMsg = personalizeRole(role);
    const html = baseTemplate(`
      <h1>Welcome to ZedIdeaArena 🚀</h1>
      <p>Hey ${safeName},</p>
      <p>Thanks for joining the waitlist! You're one step away from being part of a community where ideas compete, collaborate, and win.</p>
      <div class="quote">${personalMsg}</div>
      <p style="text-align:center;margin:24px 0">
        <a href="${verifyUrl}" class="btn btn-primary">Verify Email Address</a>
      </p>
      <p style="font-size:13px;color:#565666">This link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
      <hr>
      <h2>What to expect</h2>
      <p>Once verified, you'll get exclusive updates, early access announcements, and a front-row seat as we build the future of idea innovation.</p>
    `);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to ZedIdeaArena 🚀 — Verify your email',
      html,
    });
    if (error) throw error;
    console.log(`[EMAIL] Verification sent to ${email}, id=${data?.id}`);
    return data?.id || null;
  } catch (err) {
    console.error('[EMAIL] Failed to send verification:', err.message);
    return null;
  }
}

async function sendWelcomeEmail(email, name, role, referralCode) {
  if (!resend) return null;
  try {
    const safeName = escapeHtml(name || 'there');
    const referralUrl = `${FRONTEND_URL}/waitlist?ref=${encodeURIComponent(referralCode || '')}`;
    const personalMsg = personalizeRole(role);
    const html = baseTemplate(`
      <h1>You're officially on the waitlist 🎉</h1>
      <p>Hey ${safeName},</p>
      <p>${personalMsg}</p>
      <p>Your email has been verified and you're now part of the ZedIdeaArena community. Here's what's coming:</p>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">Q4 2026</div>
          <div class="stat-label">Expected Launch</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">🌍</div>
          <div class="stat-label">Global Community</div>
        </div>
      </div>
      <h2>Spread the word</h2>
      <p>Get early access perks by inviting friends. The more you refer, the higher your priority.</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${referralUrl}" class="btn btn-primary">Share Your Referral Link</a>
      </p>
      <hr>
      <h2>What's next?</h2>
      <p>We're building the platform. You'll hear from us soon with behind-the-scenes updates, feature previews, and launch announcements.</p>
      <p>Welcome aboard. Let's build something extraordinary.</p>
    `);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "You're officially on the waitlist 🎉",
      html,
    });
    if (error) throw error;
    console.log(`[EMAIL] Welcome sent to ${email}, id=${data?.id}`);
    return data?.id || null;
  } catch (err) {
    console.error('[EMAIL] Failed to send welcome:', err.message);
    return null;
  }
}

async function sendBehindTheScenesEmail(email, name) {
  if (!resend) return null;
  try {
    const safeName = escapeHtml(name || 'there');
    const html = baseTemplate(`
      <h1>Here's what's happening behind the scenes 👀</h1>
      <p>Hey ${safeName},</p>
      <p>Our team is hard at work building the platform. Here's a peek at what we've been up to:</p>
      <h2>✅ What's done</h2>
      <p>Core platform infrastructure is live — user accounts, authentication, and our competition system are fully operational.</p>
      <h2>🛠️ In progress</h2>
      <p>We're refining the idea submission flow, building the voting system, and designing the arena experience. The foundation is solid and we're moving fast.</p>
      <h2>🔮 Coming soon</h2>
      <p>Collaborator matching, investor discovery, and real-time competition leaderboards are on the roadmap.</p>
      <hr>
      <p>Stay tuned — we're building something revolutionary for the idea economy.</p>
    `);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Here's what's happening behind the scenes 👀",
      html,
    });
    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error('[EMAIL] Failed to send behind-the-scenes:', err.message);
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
    const html = baseTemplate(`
      <h1>New Feature Preview</h1>
      <p>Hey ${safeName},</p>
      <p>We're excited to share what's coming next to ZedIdeaArena. These features will help you get the most out of the platform:</p>
      <div class="stat-grid">${featureList}</div>
      <p>Each feature is designed to help you move from idea to impact faster. We can't wait for you to try them.</p>
      <p>Stay tuned for launch announcements.</p>
    `);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'New Feature Preview',
      html,
    });
    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error('[EMAIL] Failed to send feature preview:', err.message);
    return null;
  }
}

async function sendLaunchCountdownEmail(email, name, daysUntilLaunch) {
  if (!resend) return null;
  try {
    const safeName = escapeHtml(name || 'there');
    const days = daysUntilLaunch || 90;
    const html = baseTemplate(`
      <h1>Launch is getting closer 🚀</h1>
      <p>Hey ${safeName},</p>
      <p>We're approximately <strong style="color:#7c3aed;font-size:28px">${days}</strong> days away from launch, and the momentum is building.</p>
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
      <h2>Refer your friends</h2>
      <p>The more people who join, the stronger our community will be at launch. Share your referral link and earn early access perks.</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${FRONTEND_URL}/waitlist" class="btn btn-primary">Invite Friends</a>
      </p>
      <p>Thank you for being part of this journey. Launch day will be here before we know it.</p>
    `);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Launch is getting closer 🚀',
      html,
    });
    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error('[EMAIL] Failed to send launch countdown:', err.message);
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
    const html = baseTemplate(`<h1>Idea Received!</h1><p>Thank you for submitting <strong>${safeTitle}</strong> to ZedIdeaArena.</p><p>Our team will review your submission and notify you once it's approved.</p>`);
    try { await resend.emails.send({ from: FROM_EMAIL, to: email, subject: 'We received your idea submission', html }); }
    catch (err) { console.error('[EMAIL] ideaConfirmation:', err.message); }
  },
  sendIdeaApproved: async (email, ideaTitle) => {
    if (!resend) return;
    const safeTitle = escapeHtml(ideaTitle);
    const html = baseTemplate(`<h1>Idea Approved!</h1><p>Great news — <strong>${safeTitle}</strong> is now live on ZedIdeaArena.</p><p>Share your pitch with your network and start getting votes!</p>`);
    try { await resend.emails.send({ from: FROM_EMAIL, to: email, subject: 'Your idea is now live!', html }); }
    catch (err) { console.error('[EMAIL] ideaApproved:', err.message); }
  },
  sendIdeaRejected: async (email, ideaTitle, adminNote = '') => {
    if (!resend) return;
    const safeTitle = escapeHtml(ideaTitle);
    const safeNote = escapeHtml(adminNote);
    const noteHtml = safeNote ? `<div class="quote">${safeNote}</div>` : '';
    const html = baseTemplate(`<h1>Submission Update</h1><p>Regarding <strong>${safeTitle}</strong> — we're unable to approve your idea at this time.</p>${noteHtml}<p>You're welcome to revise and resubmit.</p>`);
    try { await resend.emails.send({ from: FROM_EMAIL, to: email, subject: 'Update on your submission', html }); }
    catch (err) { console.error('[EMAIL] ideaRejected:', err.message); }
  },
  sendVoterVerified: async (email) => {
    if (!resend) return;
    const html = baseTemplate(`<h1>You're Verified!</h1><p>Your voter account has been verified. You can now vote on ideas in competitions you've registered for.</p>`);
    try { await resend.emails.send({ from: FROM_EMAIL, to: email, subject: 'You can now vote!', html }); }
    catch (err) { console.error('[EMAIL] voterVerified:', err.message); }
  },
  sendCollaboratorInvite: async (email, ideaTitle, inviterName, role) => {
    if (!resend) return;
    const safeTitle = escapeHtml(ideaTitle);
    const safeName = escapeHtml(inviterName);
    const pitchUrl = `${FRONTEND_URL}/pitch/${encodeURIComponent(ideaTitle)}`;
    const roleHtml = role ? `<p>Your role: <strong>${escapeHtml(role)}</strong></p>` : '';
    const html = baseTemplate(`<h1>Collaboration Invitation</h1><p><strong>${safeName}</strong> has invited you to collaborate on <strong>${safeTitle}</strong>.</p>${roleHtml}<p style="text-align:center;margin:24px 0"><a href="${pitchUrl}" class="btn btn-primary">View Pitch</a></p><p style="font-size:13px;color:#565666">If you don't have an account, you'll be asked to sign up first.</p>`);
    try { await resend.emails.send({ from: FROM_EMAIL, to: email, subject: `You've been invited to collaborate on "${safeTitle}"`, html }); }
    catch (err) { console.error('[EMAIL] collaboratorInvite:', err.message); }
  },
  sendVerificationEmail,
  sendWelcomeEmail,
  sendBehindTheScenesEmail,
  sendFeaturePreviewEmail,
  sendLaunchCountdownEmail,
};
