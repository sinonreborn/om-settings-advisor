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
        // claude-sonnet-4-20250514 was retired on 15 June 2026 (requests returned 404).
        model: 'claude-sonnet-5-5',
        max_tokens: 2500,
        // Sonnet 5.5 thinks by default and thinking shares max_tokens with the answer.
        // The app only needs a short JSON reply, so use the lowest thinking setting:
        // with no tools in the request, the response is text only.
        thinking: { type: 'between_tools' },
        output_config: { effort: 'low' },
        // Newer models explain more than the old one did. The app shows these values
        // in small cards, so keep them to the bare setting.
        system: [
          'Your reply is shown in a phone app on small cards. Reply with the JSON object only.',
          'Follow the field formats in the prompt literally and keep every value short.',
          'aperture, shutter_speed and iso must be the bare setting only, 16 characters or fewer,',
          'with no brackets, alternatives or explanation. Examples: "f/6.3", "1/2500s", "Auto ≤12800".',
          'Every other single-value field is one short line (under 90 characters).',
          'Reasoning, alternatives and caveats belong only in "why" and "tips".',
          'Only ever name lenses listed in the prompt: "would_swap" must be one of the IN BAG lenses, or null.',
        ].join(' '),
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
