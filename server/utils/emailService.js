import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Lazy initialization to avoid crash when RESEND_API_KEY is not set
let resend = null;
const getResend = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

// Fallback nodemailer for backward compatibility (if needed)
const createTransporter = () => {
  // This is now a fallback - Resend is the primary method
  return null;
};

// Send OTP email
export const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      // Fallback: log to console for testing
      console.log('📧 [EMAIL FALLBACK] OTP Email would be sent:');
      console.log('   To:', email);
      console.log('   Name:', name);
      console.log('   OTP Code:', otp);
      console.log('   ⚠️ Configure EMAIL_USER and EMAIL_PASS in .env for real emails');
      return { success: true, messageId: 'console-fallback' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Email Verification - Portfolio Creator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Portfolio Creator</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for signing up! To complete your registration and start creating amazing portfolios, 
              please verify your email address using the verification code below:
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 25px; text-center; margin: 25px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: monospace;">
                ${otp}
              </div>
              <p style="color: #999; font-size: 14px; margin: 15px 0 0 0;">
                This code will expire in 10 minutes
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't create an account with us, please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                Best regards,<br>
                The Portfolio Creator Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully to:', email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('📧 [EMAIL FALLBACK] Welcome email would be sent to:', email);
      return { success: true, messageId: 'console-fallback' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Welcome to Portfolio Creator!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Portfolio Creator!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your email has been verified successfully</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              🎉 Congratulations! Your email has been verified successfully. You're now ready to create 
              stunning professional portfolios from your resume.
            </p>
            
            <div style="background: white; border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin: 0 0 15px 0;">What you can do now:</h3>
              <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Upload your resume PDF and get instant portfolio generation</li>
                <li>Customize your portfolio with professional themes</li>
                <li>Share your portfolio with potential employers</li>
                <li>Track your portfolio views and engagement</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Get Started Now
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                Best regards,<br>
                The Portfolio Creator Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('📧 [EMAIL FALLBACK] Password reset email would be sent to:', email);
      return { success: true, messageId: 'console-fallback' };
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset Request - Portfolio Creator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Portfolio Creator</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                Best regards,<br>
                The Portfolio Creator Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully to:', email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send daily job digest email
export const sendJobDigestEmail = async (email, name, jobs = []) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ Resend API key not configured. Using console fallback.');
      console.log('📧 [EMAIL FALLBACK] Job digest email would be sent to:', email);
      console.log('   Jobs count:', jobs.length);
      return { success: true, messageId: 'console-fallback' };
    }

    if (!jobs || jobs.length === 0) {
      console.log('ℹ️ No new jobs to send to:', email);
      return { success: true, messageId: 'no-jobs' };
    }

    const jobsHtml = jobs.slice(0, 10).map((job) => `
            <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: white;">
                <h3 style="color: #667eea; margin: 0 0 10px 0; font-size: 18px;">${job.title || 'Job Title'}</h3>
                <p style="color: #666; margin: 5px 0; font-weight: bold;">📍 ${job.company || 'Company Name'}</p>
                <p style="color: #999; margin: 5px 0; font-size: 14px;">📍 ${job.location || 'Remote'}</p>
                <p style="color: #666; margin: 15px 0; line-height: 1.6;">${(job.description || '').substring(0, 200)}...</p>
                <a href="${job.sourceUrl || '#'}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 14px;">View Job</a>
            </div>
        `).join('');

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">💼 Your Daily Job Digest</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${jobs.length} new opportunities matching your profile</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              We found ${jobs.length} new job opportunities that match your skills and experience. 
              Check them out below and apply to positions that interest you!
            </p>
            
            ${jobsHtml}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View All Jobs
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
              You're receiving this email because you're a registered user. 
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings" style="color: #667eea; text-decoration: none;">Manage email preferences</a>
            </p>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #999; font-size: 14px;">
                Best regards,<br>
                The Portfolio Creator Team
              </p>
            </div>
          </div>
        </div>
      `;

    const result = await getResend().emails.send({
      from: 'OneClickFolio <onboarding@resend.dev>',
      to: email,
      subject: `Daily Job Digest - ${jobs.length} New Opportunities For You!`,
      html: html
    });

    if (result.error) {
      console.error('❌ Resend error:', result.error);
      return { success: false, error: result.error };
    }

    console.log('✅ Job digest email sent to:', email, `(${jobs.length} jobs)`);
    return { success: true, messageId: result.data?.id, jobsCount: jobs.length };
  } catch (error) {
    console.error('❌ Failed to send job digest email:', error);
    return { success: false, error: error.message };
  }
};
