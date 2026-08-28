import type { Env } from '../env';
import type { Order } from '../types';

/**
 * Order email, sent through Resend.
 *
 * Nothing here may ever prevent an order from being written. A shop that
 * refuses a paid order because its mail provider is down is worse than a shop
 * that takes the order quietly, so every failure is logged and swallowed.
 */

const escape = (value: unknown): string =>
  String(value ?? '').replace(
    /[&<>"']/g,
    ch =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!
  );

const inr = (value: number) => `₹${Number(value ?? 0).toLocaleString('en-IN')}`;

const addressLines = (address: unknown): string => {
  if (!address) return '';
  if (typeof address === 'string') return escape(address).replace(/\n/g, '<br>');
  const a = address as Record<string, string>;
  return [a.addressLine1, a.addressLine2, a.city, a.state, a.pincode, a.country]
    .filter(Boolean)
    .map(escape)
    .join('<br>');
};

function orderHtml(order: Order, forShop: boolean): string {
  const rows = (order.items ?? [])
    .map(
      item => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #1d2b23;color:#f5f2ee;font-size:15px">
          ${escape(item.product?.name)}
          ${item.selectedSize ? `<span style="color:#a7a7a7;font-size:13px"> · Size ${escape(item.selectedSize)}</span>` : ''}
          <div style="color:#a7a7a7;font-size:13px;margin-top:4px">Quantity ${item.quantity}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #1d2b23;color:#f5f2ee;font-size:15px;text-align:right;white-space:nowrap">
          ${inr((item.product?.priceINR ?? 0) * item.quantity)}
        </td>
      </tr>`
    )
    .join('');

  const heading = forShop
    ? `New order &mdash; ${escape(order.orderNumber)}`
    : `Thank you, ${escape(String(order.customerName).split(/\s+/)[0])}.`;

  const intro = forShop
    ? `${escape(order.customerName)} has placed an order.`
    : 'Your order is confirmed. We will write again when it leaves the atelier.';

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#011f10;font-family:Georgia,'Times New Roman',serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#011f10;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#002b1b;border:1px solid #1d2b23">
        <tr><td style="padding:32px 28px 8px">
          <div style="color:#c5a059;font-size:11px;letter-spacing:3px;text-transform:uppercase">AL-KAIF</div>
          <div style="color:#a7a7a7;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:4px">Fine Jewellery &amp; Perfumes</div>
        </td></tr>

        <tr><td style="padding:20px 28px 0">
          <h1 style="margin:0;color:#f5f2ee;font-size:26px;font-weight:normal">${heading}</h1>
          <p style="margin:14px 0 0;color:#c9c6c1;font-size:15px;line-height:26px">${intro}</p>
          <p style="margin:18px 0 0;color:#dfc27c;font-size:20px;letter-spacing:1px">${escape(order.orderNumber)}</p>
        </td></tr>

        <tr><td style="padding:26px 28px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>

        <tr><td style="padding:18px 28px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#a7a7a7">
            <tr><td style="padding:4px 0">GST (included)</td><td style="text-align:right;padding:4px 0">${inr(order.taxINR)}</td></tr>
            <tr><td style="padding:4px 0">Shipping</td><td style="text-align:right;padding:4px 0;color:#dfc27c">Complimentary</td></tr>
            <tr>
              <td style="padding:14px 0 0;border-top:1px solid #1d2b23;color:#c5a059;font-size:11px;letter-spacing:2px;text-transform:uppercase">Total</td>
              <td style="padding:14px 0 0;border-top:1px solid #1d2b23;text-align:right;color:#f5f2ee;font-size:22px">${inr(order.totalINR)}</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:26px 28px 0">
          <div style="color:#c5a059;font-size:11px;letter-spacing:2px;text-transform:uppercase">Delivering to</div>
          <p style="margin:10px 0 0;color:#c9c6c1;font-size:14px;line-height:24px">
            ${escape(order.customerName)}<br>${addressLines(order.shippingAddress)}<br>${escape(order.customerPhone)}
          </p>
        </td></tr>

        ${
          forShop
            ? `<tr><td style="padding:20px 28px 0">
                 <p style="margin:0;color:#a7a7a7;font-size:13px;line-height:22px">
                   ${escape(order.customerEmail || 'no email given')} &middot; paid by ${escape(order.paymentMethod)} &middot; ${escape(order.paymentStatus)}
                 </p>
               </td></tr>`
            : `<tr><td style="padding:28px 28px 0">
                 <a href="https://www.alkaif.in/orders/${encodeURIComponent(order.orderNumber)}"
                    style="display:inline-block;background:#c5a059;color:#011f10;text-decoration:none;padding:14px 26px;font-size:11px;letter-spacing:2px;text-transform:uppercase">
                   View your order
                 </a>
               </td></tr>`
        }

        <tr><td style="padding:30px 28px 32px">
          <p style="margin:0;color:#7d8a83;font-size:12px;line-height:22px">
            Questions? Write to info@alkaif.in or call +91 70960 22333, quoting ${escape(order.orderNumber)}.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function send(
  env: Env,
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.ORDER_FROM_EMAIL || 'AL-KAIF <orders@alkaif.in>',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend refused (${res.status}): ${await res.text()}`);
  }
}

/** Tells the client their order is confirmed, and tells the maison it arrived. */
export async function sendOrderEmails(env: Env, order: Order): Promise<void> {
  if (!env.RESEND_API_KEY) return; // Not configured yet; orders still work.

  const shopAddress = env.SHOP_EMAIL || 'info@alkaif.in';

  const jobs: Promise<void>[] = [];
  if (order.customerEmail) {
    jobs.push(
      send(
        env,
        order.customerEmail,
        `Your AL-KAIF order ${order.orderNumber}`,
        orderHtml(order, false)
      )
    );
  }
  jobs.push(
    send(
      env,
      shopAddress,
      `New order ${order.orderNumber} — ${order.customerName}`,
      orderHtml(order, true)
    )
  );

  // Settled, not raced: one address failing must not stop the other.
  const results = await Promise.allSettled(jobs);
  results.forEach(result => {
    if (result.status === 'rejected') {
      console.error(`Order email failed for ${order.orderNumber}:`, result.reason);
    }
  });
}
