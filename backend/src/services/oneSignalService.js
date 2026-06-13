const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

async function sendNotification({ title, content, url, userIds, segments }: {
  title: string
  content: string
  url?: string
  userIds?: string[]
  segments?: string[]
}) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.warn('[OneSignal] Missing credentials, skipping notification');
    return null;
  }

  const body: Record<string, any> = {
    app_id: ONESIGNAL_APP_ID,
    headings: { en: title },
    contents: { en: content },
  };

  if (url) body.url = url;
  if (userIds?.length) body.include_external_user_ids = userIds;
  if (segments?.length) body.included_segments = segments;
  if (!userIds?.length && !segments?.length) body.included_segments = ['All'];

  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error('[OneSignal] Send error:', err);
    return null;
  }
}

module.exports = { sendNotification };
