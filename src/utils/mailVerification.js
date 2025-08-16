// utils/emailVerification.js
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

// Generate a random verification token
export const generateVerificationToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Send verification email
export const sendVerificationEmail = async (email, token, userName = '') => {
  try {
    const verificationUrl = `${window.location.origin}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    const { data, error } = await resend.emails.send({
      from: 'ChatBot <onboarding@resend.dev>', // Use resend.dev for testing, change later
      to: [email],
      subject: 'Verify Your ChatBot Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1e293b; color: #e2e8f0; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">ChatBot</h1>
          </div>
          
          <div style="background-color: #334155; padding: 30px; border-radius: 8px; text-align: center;">
            <h2 style="color: #f8fafc; margin-top: 0;">Welcome${userName ? ' ' + userName : ''}!</h2>
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5; margin: 20px 0;">
              Thanks for signing up for ChatBot. To complete your registration and verify your email address, please click the button below:
            </p>
            
            <div style="margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(to right, #3b82f6, #8b5cf6, #a855f7); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
              If you didn't create an account with ChatBot, you can safely ignore this email.
            </p>
            
            <div style="border-top: 1px solid #475569; margin-top: 30px; padding-top: 20px;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin: 10px 0 0 0;">
                ${verificationUrl}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
            <p>&copy; Nomaan Faruki - 2025</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

// Store verification token (you'll need to implement this with your Nhost GraphQL)
export const storeVerificationToken = async (nhost, email, token) => {
  try {
    // This will store the token in your Nhost database
    // You'll need to create a table called 'email_verifications' in Hasura
    const query = `
      mutation InsertEmailVerification($email: String!, $token: String!, $expires_at: timestamptz!) {
        insert_email_verifications_one(object: {
          email: $email,
          token: $token,
          expires_at: $expires_at,
          verified: false
        }) {
          id
        }
      }
    `;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    const result = await nhost.graphql.request(query, {
      email,
      token,
      expires_at: expiresAt.toISOString(),
    });

    return { success: true, result };
  } catch (error) {
    console.error('Error storing verification token:', error);
    return { success: false, error };
  }
};

// Verify email token
export const verifyEmailToken = async (nhost, email, token) => {
  try {
    const query = `
      query VerifyEmailToken($email: String!, $token: String!) {
        email_verifications(where: {
          email: {_eq: $email},
          token: {_eq: $token},
          verified: {_eq: false},
          expires_at: {_gt: "now()"}
        }) {
          id
          email
        }
      }
    `;

    const result = await nhost.graphql.request(query, { email, token });
    
    if (result.data?.email_verifications?.length > 0) {
      // Mark as verified and update user
      const updateQuery = `
        mutation VerifyEmail($email: String!, $token: String!) {
          update_email_verifications(
            where: {email: {_eq: $email}, token: {_eq: $token}},
            _set: {verified: true}
          ) {
            affected_rows
          }
          update_users(
            where: {email: {_eq: $email}},
            _set: {emailVerified: true}
          ) {
            affected_rows
          }
        }
      `;

      await nhost.graphql.request(updateQuery, { email, token });
      return { success: true, verified: true };
    }

    return { success: false, error: 'Invalid or expired token' };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { success: false, error };
  }
};