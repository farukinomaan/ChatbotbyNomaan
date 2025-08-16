// nhost/functions/send-verification-email.js
// Updated version with actual email sending functionality

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
  
      console.log('Email verification requested for:', email);
      console.log('Token:', token);
      console.log('Base URL:', baseUrl);
  
      // Create verification link
      const verificationLink = `${baseUrl}/verify-email?token=${token}`;
  
      // Email HTML template
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #007bff; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome ${userName || 'User'}!</h1>
            </div>
            <div class="content">
              <h2>Please verify your email address</h2>
              <p>Thank you for signing up! To complete your registration, please click the button below to verify your email address:</p>
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #eee; padding: 10px; border-radius: 4px;">
                ${verificationLink}
              </p>
              <p><strong>This link will expire in 24 hours.</strong></p>
            </div>
            <div class="footer">
              <p>If you didn't request this verification, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
  
      // **OPTION 1: Using Gmail with Nodemailer (Recommended for testing)**
      // First, install nodemailer: npm install nodemailer
      /*
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_PASS  // Your Gmail app password
        }
      });
  
      await transporter.sendMail({
        from: `"Your App Name" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Please verify your email address',
        html: emailHtml
      });
      */
  
      // **OPTION 2: Using SendGrid (Better for production)**
      // First, install @sendgrid/mail: npm install @sendgrid/mail
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
      const msg = {
        to: email,
        from: process.env.VERIFIED_SENDER_EMAIL, // Must be verified in SendGrid
        subject: 'Please verify your email address',
        html: emailHtml,
      };
  
      await sgMail.send(msg);
      */
  
      // **OPTION 3: Using Fetch with External Email API (e.g., EmailJS)**
      const emailPayload = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_USER_ID,
        template_params: {
          to_email: email,
          to_name: userName || 'User',
          verification_link: verificationLink,
          app_name: 'Your App Name'
        }
      };
  
      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      });
  
      if (!emailResponse.ok) {
        throw new Error(`Email service responded with status: ${emailResponse.status}`);
      }
  
      console.log('✅ Email sent successfully to:', email);
  
      return res.status(200).json({
        success: true,
        message: 'Verification email sent successfully! Please check your inbox.',
        data: { 
          email, 
          tokenSent: true,
          verificationLink: verificationLink // Remove this in production for security
        }
      });
  
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };