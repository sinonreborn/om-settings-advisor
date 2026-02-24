// Vercel Serverless Function — proxies AI requests so the API key stays hidden
// Users never see or need the key

export default async function handler(req, res) {
  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Basic rate limiting via header (optional: add IP-based limiting)
  const rateLimit = process.env.RATE_LIMIT || '30'; // requests per hour
  
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Cap prompt length to prevent abuse
    if (prompt.length > 10000) {
      return res.status(400).json({ error: 'Prompt too long' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const data = await response.json();
    
    // Return just the text content
    const text = data.content?.map(block => block.text || '').join('') || '';
    
    res.status(200).json({ text });
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
