import { Resend } from 'resend';

export async function sendOrderConfirmationEmail(
  to: string,
  orderDetails: {
    orderId: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
  }
) {
  const apiKey = process.env.RESEND_API_KEY;
  const itemsList = orderDetails.items
    .map(item => `<li>${item.name} (x${item.quantity}) - $${Number(item.price).toFixed(2)}</li>`)
    .join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #111827; margin-bottom: 16px;">Order Confirmation</h2>
      <p>Thank you for your order! We are processing it right now.</p>
      <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <h3 style="color: #374151;">Items Purchased:</h3>
      <ul style="padding-left: 20px; color: #4b5563;">
        ${itemsList}
      </ul>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 18px; color: #111827;"><strong>Total:</strong> $${Number(orderDetails.total).toFixed(2)}</p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">If you have any questions, please contact our support team.</p>
    </div>
  `;

  if (!apiKey || apiKey === 'MY_RESEND_API_KEY' || apiKey.startsWith('fallback')) {
    console.log('--------------------------------------------------');
    console.log(`[EMAIL SIMULATION] Resend API key is not configured.`);
    console.log(`To: ${to}`);
    console.log(`Subject: Order Confirmation - #${orderDetails.orderId}`);
    console.log(`Items:\n${orderDetails.items.map(i => ` - ${i.name} (x${i.quantity}) @ $${i.price}`).join('\n')}`);
    console.log(`Total: $${orderDetails.total}`);
    console.log('--------------------------------------------------');
    return { success: true, logged: true };
  }

  try {
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend's standard default sender
      to: to,
      subject: `Order Confirmation - #${orderDetails.orderId}`,
      html: html,
    });
    console.log('Order confirmation email sent via Resend successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    return { success: false, error };
  }
}
