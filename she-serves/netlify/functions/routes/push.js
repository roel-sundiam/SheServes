const express          = require('express');
const webpush          = require('web-push');
const PushSubscription = require('../models/PushSubscription');

const router = express.Router();

webpush.setVapidDetails(
  'mailto:sundiamr@aol.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// POST /api/push/subscribe — store or refresh a push subscription
router.post('/push/subscribe', async (req, res) => {
  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: 'Invalid subscription payload.' });
  }
  try {
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { endpoint, keys },
      { upsert: true, new: true }
    );
    res.status(201).json({ message: 'Subscribed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save subscription.' });
  }
});

// DELETE /api/push/subscribe — remove a subscription
router.delete('/push/subscribe', async (req, res) => {
  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ message: 'endpoint required.' });
  try {
    await PushSubscription.deleteOne({ endpoint });
    res.json({ message: 'Unsubscribed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove subscription.' });
  }
});

// sendPush — called internally after create operations; never exposed as an HTTP route
async function sendPush(title, body, url = '/') {
  const payload = JSON.stringify({
    notification: {
      title,
      body,
      icon:  '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data:  { url, onActionClick: { default: { operation: 'navigateLastFocusedOrOpen', url } } },
    },
  });

  const subs = await PushSubscription.find().lean();
  await Promise.allSettled(
    subs.map(sub =>
      webpush
        .sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
        .catch(async err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.deleteOne({ endpoint: sub.endpoint });
          }
        })
    )
  );
}

module.exports = { router, sendPush };
