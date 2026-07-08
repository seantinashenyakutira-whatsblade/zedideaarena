const express = require('express');
const router = express.Router();
const { processEmailSequence } = require('../jobs/emailScheduler');

const CRON_SECRET = process.env.CRON_SECRET;

router.post('/email-sequence', async (req, res) => {
  const auth = req.headers['authorization'];
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const result = await processEmailSequence();
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
