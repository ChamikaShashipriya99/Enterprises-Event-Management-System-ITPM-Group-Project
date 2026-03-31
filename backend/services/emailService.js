const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * Send booking confirmation email to student
 */
const sendBookingConfirmationEmail = async ({ to, studentName, booking, event }) => {
    const transporter = createTransporter();

    const eventDate = new Date(event.date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const mailOptions = {
        from: `"Event Management System" <${process.env.EMAIL_USER}>`,
        to,
        subject: `✅ Booking Confirmed – ${event.title} [${booking.bookingId}]`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background: #4F46E5; padding: 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed! 🎉</h1>
                </div>
                <div style="padding: 32px;">
                    <p style="font-size: 16px; color: #333;">Hi <strong>${studentName}</strong>,</p>
                    <p style="color: #555;">Your seat has been successfully reserved. Here are your booking details:</p>

                    <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <h2 style="color: #4F46E5; margin-top: 0;">${event.title}</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; width: 40%;">📋 Booking ID</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #111;">${booking.bookingId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">📅 Date & Time</td>
                                <td style="padding: 8px 0; color: #111;">${eventDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">📍 Location</td>
                                <td style="padding: 8px 0; color: #111;">${event.location}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">✅ Status</td>
                                <td style="padding: 8px 0; color: #16a34a; font-weight: bold;">Confirmed</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: #EEF2FF; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
                        <p style="margin: 0 0 8px; color: #4F46E5; font-weight: bold;">Your QR Code for Check-In</p>
                        <p style="margin: 0; color: #666; font-size: 14px;">Present this QR code at the event entrance for contactless check-in.</p>
                        ${booking.qrCode ? `<img src="${booking.qrCode}" alt="QR Code" style="margin-top: 16px; width: 160px; height: 160px;" />` : ''}
                    </div>

                    <p style="color: #555; font-size: 14px;">
                        ⚠️ <strong>Note:</strong> You cannot cancel your booking on the day of the event.
                        Please ensure you attend or cancel at least 1 day before the event date.
                    </p>

                    <p style="color: #888; font-size: 13px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
                        This is an automated email from the Event Management System. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

/**
 * Send booking cancellation email
 */
const sendCancellationEmail = async ({ to, studentName, booking, event, reason }) => {
    const transporter = createTransporter();

    const eventDate = new Date(event.date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const mailOptions = {
        from: `"Event Management System" <${process.env.EMAIL_USER}>`,
        to,
        subject: `❌ Booking Cancelled – ${event.title} [${booking.bookingId}]`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background: #DC2626; padding: 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Booking Cancelled</h1>
                </div>
                <div style="padding: 32px;">
                    <p style="font-size: 16px; color: #333;">Hi <strong>${studentName}</strong>,</p>
                    <p style="color: #555;">Your booking has been successfully cancelled. Here are the details:</p>

                    <div style="background: #FEF2F2; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <h2 style="color: #DC2626; margin-top: 0;">${event.title}</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666; width: 40%;">📋 Booking ID</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #111;">${booking.bookingId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">📅 Event Date</td>
                                <td style="padding: 8px 0; color: #111;">${eventDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;">❌ Status</td>
                                <td style="padding: 8px 0; color: #DC2626; font-weight: bold;">Cancelled</td>
                            </tr>
                            ${reason ? `
                            <tr>
                                <td style="padding: 8px 0; color: #666;">💬 Reason</td>
                                <td style="padding: 8px 0; color: #111;">${reason}</td>
                            </tr>` : ''}
                        </table>
                    </div>

                    <p style="color: #888; font-size: 13px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
                        This is an automated email from the Event Management System. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

/**
 * Send certificate email with PDF attachment
 */
const sendCertificateEmail = async ({ to, studentName, event, certificatePath }) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Event Management System" <${process.env.EMAIL_USER}>`,
        to,
        subject: `🎓 Your Certificate of Participation – ${event.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background: #059669; padding: 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Certificate of Participation 🎓</h1>
                </div>
                <div style="padding: 32px;">
                    <p style="font-size: 16px; color: #333;">Congratulations, <strong>${studentName}</strong>! 🎉</p>
                    <p style="color: #555;">
                        Thank you for participating in <strong>${event.title}</strong>.
                        Please find your Certificate of Participation attached to this email.
                    </p>
                    <div style="background: #ECFDF5; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                        <p style="color: #059669; font-weight: bold; font-size: 18px; margin: 0;">📄 Certificate Attached</p>
                        <p style="color: #666; margin: 8px 0 0;">Your certificate is available as a PDF attachment.</p>
                    </div>
                    <p style="color: #888; font-size: 13px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
                        This is an automated email from the Event Management System. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `,
        attachments: [
            {
                filename: `certificate_${event.title.replace(/\s+/g, '_')}.pdf`,
                path: certificatePath,
            },
        ],
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendBookingConfirmationEmail,
    sendCancellationEmail,
    sendCertificateEmail,
};
