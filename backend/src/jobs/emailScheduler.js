require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { supabase } = require('../config/supabase');
const emailService = require('../services/emailService');

const SEQUENCE = [
  { delayDays: 3, type: 'behind_scenes', send: (e, n) => emailService.sendBehindTheScenesEmail(e, n) },
  { delayDays: 7, type: 'feature_preview', send: (e, n) => emailService.sendFeaturePreviewEmail(e, n) },
  { delayDays: 30, type: 'launch_countdown', send: (e, n) => emailService.sendLaunchCountdownEmail(e, n, 60) },
];

const BATCH_SIZE = 50;

function getNextSequenceStep(lastEmailType) {
  if (!lastEmailType) return SEQUENCE[0];
  const idx = SEQUENCE.findIndex(s => s.type === lastEmailType);
  return idx >= 0 && idx < SEQUENCE.length - 1 ? SEQUENCE[idx + 1] : null;
}

async function processEmailSequence() {
  console.log(`[EMAIL_SCHEDULER] Run at ${new Date().toISOString()}`);
  let totalSent = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const step of SEQUENCE) {
    const cutoff = new Date(Date.now() - step.delayDays * 24 * 60 * 60 * 1000).toISOString();

    const { data: candidates, error } = await supabase
      .from('waitlist_signups')
      .select('id, email, name, role, referral_code, last_email_type, last_email_sent')
      .eq('email_verified', true)
      .eq('unsubscribed', false)
      .lte('joined_date', cutoff)
      .limit(BATCH_SIZE);

    if (error) {
      console.error(`[EMAIL_SCHEDULER] Query error for step ${step.type}:`, error);
      continue;
    }

    for (const user of candidates || []) {
      const nextStep = getNextSequenceStep(user.last_email_type);
      if (!nextStep || nextStep.type !== step.type) {
        totalSkipped++;
        continue;
      }

      try {
        const msgId = await step.send(user.email, user.name, user.role);
        if (msgId) {
          await supabase.from('email_logs').insert([{
            waitlist_id: user.id,
            email_type: step.type,
            recipient_email: user.email,
            message_id: msgId,
            status: 'sent',
          }]);
          await supabase.from('waitlist_signups').update({
            email_status: step.type + '_sent',
            last_email_sent: new Date().toISOString(),
            last_email_type: step.type,
          }).eq('id', user.id);
          totalSent++;
        } else {
          await supabase.from('email_logs').insert([{
            waitlist_id: user.id,
            email_type: step.type,
            recipient_email: user.email,
            status: 'failed',
            error: 'send returned no msgId',
          }]);
          totalErrors++;
        }
      } catch (err) {
        totalErrors++;
        await supabase.from('email_logs').insert([{
          waitlist_id: user.id,
          email_type: step.type,
          recipient_email: user.email,
          status: 'failed',
          error: err.message,
        }]);
      }
    }
  }

  console.log(`[EMAIL_SCHEDULER] Done: ${totalSent} sent, ${totalSkipped} skipped, ${totalErrors} errors`);
  return { sent: totalSent, skipped: totalSkipped, errors: totalErrors };
}

async function sendLaunchReminders(daysUntilLaunch = 7) {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: users, error } = await supabase
    .from('waitlist_signups')
    .select('id, email, name, role')
    .eq('email_verified', true)
    .eq('unsubscribed', false)
    .or(`last_email_type.neq.launch_countdown,last_email_type.is.null`)
    .gte('joined_date', cutoff)
    .limit(BATCH_SIZE);

  if (error) {
    console.error('[EMAIL_SCHEDULER] Launch reminder query error:', error);
    return { sent: 0, errors: 1 };
  }

  let sent = 0;
  let errors = 0;
  for (const user of users || []) {
    try {
      const msgId = await emailService.sendLaunchCountdownEmail(user.email, user.name, user.role, daysUntilLaunch);
      if (msgId) {
        await supabase.from('email_logs').insert([{
          waitlist_id: user.id,
          email_type: 'launch_countdown',
          recipient_email: user.email,
          message_id: msgId,
          status: 'sent',
        }]);
        await supabase.from('waitlist_signups').update({
          email_status: 'launch_countdown_sent',
          last_email_sent: new Date().toISOString(),
          last_email_type: 'launch_countdown',
        }).eq('id', user.id);
        sent++;
      }
    } catch (err) {
      errors++;
    }
  }
  return { sent, errors };
}

if (require.main === module) {
  processEmailSequence()
    .then(r => {
      console.log(JSON.stringify(r));
      process.exit(0);
    })
    .catch(e => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { processEmailSequence, sendLaunchReminders };
