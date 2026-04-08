const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

/**
 * Send order confirmation email to consumer
 * @param {string} toEmail - consumer's email
 * @param {string} toName  - consumer's name
 * @param {object} order   - order object with items, totalAmount, _id
 */
const sendOrderConfirmation = async (toEmail, toName, order) => {
    const itemRows = order.items
        .map(item => `
            <tr>
                <td style="padding:10px;border-bottom:1px solid #f0f0f0;">
                    <img src="${item.image}" alt="${item.title}" 
                        style="width:50px;height:50px;object-fit:cover;border-radius:6px;vertical-align:middle;margin-right:10px;" />
                    ${item.title}
                </td>
                <td style="padding:10px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
                <td style="padding:10px;border-bottom:1px solid #f0f0f0;text-align:right;">₹ ${item.price}</td>
                <td style="padding:10px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;">₹ ${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `)
        .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8" /></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f5f6fa;">
        <div style="max-width:600px;margin:30px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:35px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:1.8rem;">Local Artisan</h1>
                <p style="color:rgba(255,255,255,0.85);margin:8px 0 0 0;font-size:1rem;">Handcrafted with ❤️</p>
            </div>

            <!-- Success Banner -->
            <div style="background:#f0fdf4;padding:20px 35px;border-bottom:1px solid #dcfce7;display:flex;align-items:center;">
                <span style="font-size:2rem;margin-right:15px;">✅</span>
                <div>
                    <h2 style="margin:0;color:#16a34a;font-size:1.2rem;">Order Confirmed!</h2>
                    <p style="margin:4px 0 0 0;color:#15803d;font-size:0.9rem;">Your order has been placed successfully.</p>
                </div>
            </div>

            <!-- Body -->
            <div style="padding:30px 35px;">
                <p style="color:#374151;font-size:1rem;">Hi <strong>${toName || "there"}</strong>,</p>
                <p style="color:#6b7280;font-size:0.95rem;">Thank you for your purchase! Here's your order summary:</p>

                <!-- Order ID -->
                <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
                    <span style="color:#9ca3af;font-size:0.85rem;">Order ID</span>
                    <p style="margin:2px 0 0 0;color:#374151;font-weight:bold;font-size:0.95rem;">#${order._id}</p>
                </div>

                <!-- Items Table -->
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                    <thead>
                        <tr style="background:#f9fafb;">
                            <th style="padding:10px;text-align:left;color:#6b7280;font-size:0.85rem;font-weight:600;">Product</th>
                            <th style="padding:10px;text-align:center;color:#6b7280;font-size:0.85rem;font-weight:600;">Qty</th>
                            <th style="padding:10px;text-align:right;color:#6b7280;font-size:0.85rem;font-weight:600;">Price</th>
                            <th style="padding:10px;text-align:right;color:#6b7280;font-size:0.85rem;font-weight:600;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>

                <!-- Total -->
                <div style="display:flex;justify-content:space-between;padding:15px 0;border-top:2px solid #e5e7eb;">
                    <span style="font-weight:bold;color:#374151;font-size:1rem;">Total Amount</span>
                    <span style="font-weight:bold;color:#667eea;font-size:1.1rem;">₹ ${order.totalAmount.toFixed(2)}</span>
                </div>

                <!-- Payment -->
                <div style="background:#eff6ff;border-radius:8px;padding:12px 16px;margin-top:10px;">
                    <span style="color:#3b82f6;font-size:0.9rem;">💳 Payment via <strong>${order.paymentMethod || "UPI"}</strong> — <span style="color:#16a34a;">✅ Paid</span></span>
                </div>

                <p style="margin-top:25px;color:#6b7280;font-size:0.9rem;">You can track your order status anytime from your <strong>My Orders</strong> page.</p>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb;padding:20px 35px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="margin:0;color:#9ca3af;font-size:0.85rem;">Thank you for supporting local artisans across India 🙏</p>
                <p style="margin:6px 0 0 0;color:#9ca3af;font-size:0.8rem;">Local Artisan Platform • Made in India</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
        from: `"Local Artisan" <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: `✅ Order Confirmed! - Local Artisan (#${String(order._id).slice(-8).toUpperCase()})`,
        html,
    });
};

module.exports = { sendOrderConfirmation };
