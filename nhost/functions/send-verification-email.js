// nhost/functions/send-verification-email.js
// Clean, minimal version that will work without any dependencies

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
  
      // Create verification link (include both token and email)
      const verificationLink = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  
      console.log('📧 EMAIL VERIFICATION REQUEST:');
      console.log('To Email:', email);
      console.log('User Name:', userName || 'Unknown');
      console.log('Token:', token);
      console.log('Base URL:', baseUrl);
      console.log('Verification Link:', verificationLink);
      console.log('✅ Email details logged successfully!');
  
      return res.status(200).json({
        success: true,
        message: 'Email verification details logged! Check function logs for the verification link.',
        data: { 
          email, 
          userName,
          verificationLink: verificationLink,
          instructions: 'Check the function logs for the verification link, then copy it to test email verification.'
        }
      });
  
    } catch (error) {
      console.error('❌ Function Error:', error);
      console.error('Error Stack:', error.stack);
      
      return res.status(500).json({
        success: false,
        message: 'Function error occurred',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };