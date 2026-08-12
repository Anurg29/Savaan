import { Handler } from '@netlify/functions';

// Simple in-memory store for rate limiting (Note: resets on cold starts)
const rateLimit = new Map<string, { count: number, resetAt: number }>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour window

export const handler: Handler = async (event) => {
  // Allow CORS for local development testing
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Get client IP address securely provided by Netlify infrastructure
  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';

  // Apply Rate Limiting
  const now = Date.now();
  const record = rateLimit.get(ip);
  
  if (record && record.resetAt > now) {
    if (record.count >= MAX_REQUESTS) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: 'Rate limit exceeded. Maximum 5 requests allowed.' }),
      };
    }
    record.count += 1;
  } else {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  const { videoId, playlistId } = event.queryStringParameters || {};
  const apiKey = process.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: 'Internal Server Error: API Key missing' }) 
    };
  }

  let url = '';
  if (playlistId) {
    url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
  } else if (videoId) {
    url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  } else {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ error: 'Bad Request: Missing videoId or playlistId' }) 
    };
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (!res.ok) {
      return { statusCode: res.status, headers, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: 'Failed to fetch data from YouTube' }) 
    };
  }
};
