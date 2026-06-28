export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { numbers, message } = req.body; // numbers should be an array of phone numbers
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;

  // We are using UltraMsg as the default provider, but this can be adapted to Twilio easily.
  if (!instanceId || !token) {
    return res.status(500).json({ error: 'WhatsApp API credentials not configured in Vercel.' });
  }

  if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: 'No phone numbers provided.' });
  }

  try {
    // Send message to all numbers concurrently
    const promises = numbers.map(async (num) => {
      // Format number (remove any non-numeric characters except +)
      const formattedNum = num.replace(/[^\d+]/g, '');
      
      const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: token,
          to: formattedNum,
          body: message,
        })
      });
      return await response.json();
    });

    const results = await Promise.all(promises);
    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
