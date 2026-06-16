const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@zedideaarena.com';

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

let resend = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
} else {
  console.warn('[EMAIL] RESEND_API_KEY not set — emails will be skipped');
}

async function sendIdeaConfirmation(email, ideaTitle) {
  if (!resend) return;
  try {
    const safeTitle = escapeHtml(ideaTitle);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'We received your idea submission',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#4f46e5;">Idea Received!</h2>
        <p>Thank you for submitting <strong>${safeTitle}</strong> to ZedIdeaArena.</p>
        <p>Our team will review your submission and notify you once it's approved or if any changes are needed.</p>
        <p style="color:#666;">— The ZedIdeaArena Team</p>
      </div>`,
    });
  } catch (err) {
    console.error('[EMAIL] Failed to send idea confirmation:', err.message);
  }
}

async function sendIdeaApproved(email, ideaTitle) {
  if (!resend) return;
  try {
    const safeTitle = escapeHtml(ideaTitle);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your idea is now live!',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#22c55e;">Idea Approved!</h2>
        <p>Great news — your idea <strong>${safeTitle}</strong> has been approved and is now live on ZedIdeaArena.</p>
        <p>Voters can now discover and support your idea. Share your pitch with your network!</p>
        <p style="color:#666;">— The ZedIdeaArena Team</p>
      </div>`,
    });
  } catch (err) {
    console.error('[EMAIL] Failed to send idea approved:', err.message);
  }
}

async function sendIdeaRejected(email, ideaTitle, adminNote = '') {
  if (!resend) return;
  try {
    const safeTitle = escapeHtml(ideaTitle);
    const safeNote = escapeHtml(adminNote);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Update on your submission',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#ef4444;">Submission Update</h2>
        <p>Thank you for submitting <strong>${safeTitle}</strong> to ZedIdeaArena.</p>
        <p>After review, we are unable to approve your idea at this time.</p>
        ${safeNote ? `<p style="background:#f9f9f9;padding:12px;border-radius:8px;font-style:italic;">${safeNote}</p>` : ''}
        <p>You are welcome to revise and resubmit. We look forward to seeing your next idea!</p>
        <p style="color:#666;">— The ZedIdeaArena Team</p>
      </div>`,
    });
  } catch (err) {
    console.error('[EMAIL] Failed to send idea rejected:', err.message);
  }
}

async function sendVoterVerified(email) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'You can now vote!',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#22c55e;">You're Verified!</h2>
        <p>Your voter account has been verified by an admin.</p>
        <p>You can now vote on ideas in the competitions you've registered for. Your voice helps shape the future!</p>
        <p style="color:#666;">— The ZedIdeaArena Team</p>
      </div>`,
    });
  } catch (err) {
    console.error('[EMAIL] Failed to send voter verified:', err.message);
  }
}

async function sendCollaboratorInvite(email, ideaTitle, inviterName, role) {
  if (!resend) return;
  try {
    const safeTitle = escapeHtml(ideaTitle);
    const safeName = escapeHtml(inviterName);
    const safeRole = escapeHtml(role || '');
    const pitchUrl = `${process.env.FRONTEND_URL || 'https://zedideaarena.com'}/pitch/${encodeURIComponent(ideaTitle)}`;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `You've been invited to collaborate on "${safeTitle}"`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#4f46e5;">Collaboration Invitation</h2>
        <p><strong>${safeName}</strong> has invited you to collaborate on their idea <strong>${safeTitle}</strong>.</p>
        ${safeRole ? `<p>Your role: <strong>${safeRole}</strong></p>` : ''}
        <p>Click the link below to view the pitch:</p>
        <a href="${pitchUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">View Pitch</a>
        <p style="color:#666;font-size:12px;">If you don't have an account, you'll be asked to sign up first.</p>
        <p style="color:#666;">— The ZedIdeaArena Team</p>
      </div>`,
    });
    console.log(`[EMAIL] Collaborator invite sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send collaborator invite:', err.message);
  }
}

module.exports = { sendIdeaConfirmation, sendIdeaApproved, sendIdeaRejected, sendVoterVerified, sendCollaboratorInvite };
