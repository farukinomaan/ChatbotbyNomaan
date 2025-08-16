// nhost/functions/send-verification-email.js
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req, res) => {
  // --- CORS FIX ---
  // Set the required headers to allow requests from any origin.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // The browser sends a "preflight" OPTIONS request first to check CORS.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- END OF CORS FIX ---

  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Method Not Allowed' });
  }

  const { email, token, baseUrl, userName } = req.body;
  if (!email || !token || !baseUrl) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'ChatBot <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify Your ChatBot Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1e293b; color: #e2e8f0; border-radius: 12px;">
          <h2>Welcome${userName ? ' ' + userName : ''}!</h2>
          <p>Thanks for signing up. Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
          <p style="font-size: 12px; margin-top: 20px;">If the button doesn't work, copy and paste this link: ${verificationUrl}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).send({ message: 'Failed to send email', details: error.message });
    }

    return res.status(200).send({ message: 'Email sent successfully', details: data });
  } catch (err) {
    console.error('A critical server error occurred:', err);
    return res.status(500).send({ message: 'An internal server error occurred.' });
  }
};