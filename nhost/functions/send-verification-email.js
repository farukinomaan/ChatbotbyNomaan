// nhost/functions/send-verification-email.js
// Simplified version without problematic dependencies

export default async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    try {
      const { email, token, baseUrl, userName } = req.body;
      
      if (!email || !token || !baseUrl) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // For now, let's just return success to test CORS
      // We'll add email functionality once CORS is working
      console.log('Email verification requested for:', email);
      console.log('Token:', token);
      console.log('Base URL:', baseUrl);
      
      return res.status(200).json({ 
        success: true,
        message: 'Function is working! Email sending temporarily disabled for testing.',
        data: { email, token, baseUrl, userName }
      });
  
    } catch (error) {
      console.error('Function error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message 
      });
    }
  };