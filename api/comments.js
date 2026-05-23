import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Allow CORS if accessed directly, though usually not needed if hosted on same domain
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const COMMENTS_KEY = 'wedding_comments';

  if (req.method === 'GET') {
    try {
      // Fetch list of comments
      const comments = await kv.lrange(COMMENTS_KEY, 0, -1);
      return res.status(200).json(comments || []);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nama, ucapan, kehadiran } = req.body;
      
      if (!nama || !ucapan || !kehadiran) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newComment = {
        nama,
        ucapan,
        kehadiran,
        date: new Date().toISOString()
      };

      // Add new comment to the list
      await kv.lpush(COMMENTS_KEY, newComment);
      
      return res.status(200).json(newComment);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to post comment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
