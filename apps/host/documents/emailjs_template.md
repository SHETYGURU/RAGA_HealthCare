# EmailJS Templates

Use these HTML templates in your EmailJS dashboard for a professional onboarding experience.

## 1. Password Reset ([RESET_TEMPLATE_ID])
**Subject**: Password Reset Request - RAGA HealthCare

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
  <img src="https://reagahealthcare.netlify.app/assets/logo.png" alt="RAGA Logo" style="height: 50px; margin-bottom: 20px;">
  <h2 style="color: #1e293b;">Reset Your Password</h2>
  <p>Hello {{to_name}},</p>
  <p>We received a request to reset your password for the RAGA HealthCare portal. A secure link has been sent to you via Firebase Auth.</p>
  <p>If you did not request this, you can safely ignore this email.</p>
  <div style="margin: 30px 0;">
    <a href="https://reagahealthcare.netlify.app/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Login</a>
  </div>
  <hr style="border: 0; border-top: 1px solid #e2e8f0;">
  <p style="font-size: 12px; color: #64748b;">RAGA HealthCare Systems © 2026</p>
</div>
```

## 2. New Doctor Onboarding ([DOCTOR_TEMPLATE_ID])
**Subject**: Welcome to RAGA HealthCare - Your Account is Ready

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
  <h2 style="color: #1e293b;">Welcome to the Team, Dr. {{to_name}}!</h2>
  <p>Your portal account has been created successfully. Please log in using the temporary credentials below:</p>
  
  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Username:</strong> {{username}}</p>
    <p style="margin: 10px 0 0 0;"><strong>Password:</strong> {{password}}</p>
  </div>

  <p><strong>Login URL:</strong> <a href="https://reagahealthcare.netlify.app/login">reagahealthcare.netlify.app/login</a></p>
  
  <p style="color: #ef4444; font-weight: bold;">Please change your password immediately upon first login.</p>
  
  <p>Best regards,<br>RAGA HealthCare Admin Team</p>
</div>
```
