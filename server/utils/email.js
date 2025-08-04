const nodemailer = require('nodemailer');

// Create email transporter based on environment
function createTransporter() {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development - use ethereal email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

async function sendConfirmationEmail(reservationData) {
  try {
    const transporter = createTransporter();
    
    const {
      id,
      guest_name,
      guest_email,
      site_name,
      siteType,
      check_in,
      check_out,
      guests,
      total_cost,
      special_requests,
      nights,
      verificationToken
    } = reservationData;
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirmation/${id}?token=${verificationToken}`;
    
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pine Ridge Hot Springs - Reservation Confirmation</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9, #84cc16); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280; }
        .btn { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .reservation-details { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e0f2fe; }
        .detail-label { font-weight: bold; color: #0369a1; }
        .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .mountain-emoji { font-size: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1><span class="mountain-emoji">🏔️</span> Pine Ridge Hot Springs Resort</h1>
          <p>Your Mountain Adventure Awaits!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${guest_name}! 👋</h2>
          
          <p>Thank you for choosing Pine Ridge Hot Springs Resort for your mountain getaway! Your reservation has been received and is currently pending confirmation.</p>
          
          <div class="highlight">
            <strong>⚠️ Important:</strong> Please click the confirmation button below to complete your reservation. Your booking is not final until confirmed.
          </div>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="btn">Confirm My Reservation</a>
          </div>
          
          <div class="reservation-details">
            <h3>📋 Reservation Details</h3>
            
            <div class="detail-row">
              <span class="detail-label">Confirmation #:</span>
              <span>${id}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Site:</span>
              <span>${site_name} (${siteType})</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Check-in:</span>
              <span>${formatDate(check_in)}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Check-out:</span>
              <span>${formatDate(check_out)}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Nights:</span>
              <span>${nights}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Guests:</span>
              <span>${guests}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Total Cost:</span>
              <span><strong>${formatCurrency(total_cost)}</strong></span>
            </div>
            
            ${special_requests ? `
            <div class="detail-row">
              <span class="detail-label">Special Requests:</span>
              <span>${special_requests}</span>
            </div>
            ` : ''}
          </div>
          
          <h3>🌟 What to Expect</h3>
          <ul>
            <li><strong>Natural Hot Springs:</strong> Unlimited access to our mineral-rich hot springs</li>
            <li><strong>Check-in Time:</strong> 3:00 PM</li>
            <li><strong>Check-out Time:</strong> 11:00 AM</li>
            <li><strong>WiFi:</strong> Available throughout the resort</li>
            <li><strong>Parking:</strong> Complimentary on-site parking</li>
          </ul>
          
          <h3>📍 Getting Here</h3>
          <p>
            <strong>Pine Ridge Hot Springs Resort</strong><br>
            123 Mountain Ridge Road<br>
            Alpine Valley, CO 80424<br>
            <strong>Phone:</strong> (555) SPRINGS
          </p>
          
          <h3>❓ Questions?</h3>
          <p>If you have any questions or need to modify your reservation, please contact us:</p>
          <ul>
            <li><strong>Email:</strong> info@pineridgehotsprings.com</li>
            <li><strong>Phone:</strong> (555) SPRINGS</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Pine Ridge Hot Springs Resort | 123 Mountain Ridge Road, Alpine Valley, CO 80424</p>
          <p>This email was sent regarding your reservation. Please do not reply to this automated email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    const emailText = `
Pine Ridge Hot Springs Resort - Reservation Confirmation

Hello ${guest_name}!

Thank you for choosing Pine Ridge Hot Springs Resort! Your reservation is pending confirmation.

IMPORTANT: Please visit the following link to confirm your reservation:
${verificationUrl}

Reservation Details:
- Confirmation #: ${id}
- Site: ${site_name} (${siteType})
- Check-in: ${formatDate(check_in)}
- Check-out: ${formatDate(check_out)}
- Nights: ${nights}
- Guests: ${guests}
- Total Cost: ${formatCurrency(total_cost)}
${special_requests ? `- Special Requests: ${special_requests}` : ''}

Resort Information:
Pine Ridge Hot Springs Resort
123 Mountain Ridge Road
Alpine Valley, CO 80424
Phone: (555) SPRINGS
Email: info@pineridgehotsprings.com

Check-in: 3:00 PM | Check-out: 11:00 AM

We look forward to welcoming you to our mountain paradise!
    `;
    
    const mailOptions = {
      from: `"Pine Ridge Hot Springs Resort" <${process.env.SMTP_USER || 'noreply@pineridgehotsprings.com'}>`,
      to: guest_email,
      subject: `🏔️ Confirm Your Pine Ridge Hot Springs Reservation - ${site_name}`,
      text: emailText,
      html: emailHtml,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    console.log('Confirmation email sent successfully to:', guest_email);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}

async function sendCancellationEmail(reservationData) {
  try {
    const transporter = createTransporter();
    
    const {
      id,
      guest_name,
      guest_email,
      site_name,
      check_in,
      check_out,
      total_cost
    } = reservationData;
    
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Pine Ridge Hot Springs - Reservation Cancelled</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { background: white; padding: 20px; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏔️ Pine Ridge Hot Springs Resort</h1>
          <h2>Reservation Cancelled</h2>
        </div>
        <div class="content">
          <p>Hello ${guest_name},</p>
          <p>Your reservation has been successfully cancelled.</p>
          
          <h3>Cancelled Reservation Details:</h3>
          <ul>
            <li><strong>Confirmation #:</strong> ${id}</li>
            <li><strong>Site:</strong> ${site_name}</li>
            <li><strong>Check-in:</strong> ${formatDate(check_in)}</li>
            <li><strong>Check-out:</strong> ${formatDate(check_out)}</li>
            <li><strong>Total Cost:</strong> ${formatCurrency(total_cost)}</li>
          </ul>
          
          <p>If you have any questions about this cancellation or would like to make a new reservation, please contact us at info@pineridgehotsprings.com or (555) SPRINGS.</p>
          
          <p>We hope to welcome you to Pine Ridge Hot Springs Resort in the future!</p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    const mailOptions = {
      from: `"Pine Ridge Hot Springs Resort" <${process.env.SMTP_USER || 'noreply@pineridgehotsprings.com'}>`,
      to: guest_email,
      subject: 'Pine Ridge Hot Springs - Reservation Cancelled',
      html: emailHtml,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Cancellation email sent successfully to:', guest_email);
    
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    throw error;
  }
}

module.exports = {
  sendConfirmationEmail,
  sendCancellationEmail
};