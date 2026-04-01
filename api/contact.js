const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const CCD_EMAIL = 'contacto@construyecondatos.com';

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nombre, email, empresa, proyectos, mensaje } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email son obligatorios' });
    }

    const fecha = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });

    // 1. Notificación a CCD
    await resend.emails.send({
      from: 'CCD Contacto <noreply@construyecondatos.com>',
      to: [CCD_EMAIL],
      replyTo: email,
      subject: `Nuevo contacto CCD: ${nombre} — ${empresa || 'Sin empresa'}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0B5ED7;padding:20px;border-radius:12px 12px 0 0">
            <h2 style="color:white;margin:0">Nuevo contacto</h2>
            <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:14px">construyecondatos.com</p>
          </div>
          <div style="background:#f8f8f8;padding:24px;border:1px solid #e5e5e5">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 12px;font-weight:bold;color:#666;width:120px">Nombre</td><td style="padding:8px 12px">${nombre}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:bold;color:#666">Email</td><td style="padding:8px 12px"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:8px 12px;font-weight:bold;color:#666">Empresa</td><td style="padding:8px 12px">${empresa || 'No indicada'}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:bold;color:#666">Proyectos</td><td style="padding:8px 12px">${proyectos || 'No indicado'}</td></tr>
            </table>
            <div style="margin-top:16px;padding:16px;background:white;border-radius:8px;border:1px solid #e5e5e5">
              <p style="margin:0 0 4px;font-weight:bold;color:#666;font-size:13px">Mensaje:</p>
              <p style="margin:0;line-height:1.6">${(mensaje || 'Sin mensaje').replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          <div style="background:#1a1a2e;padding:16px;border-radius:0 0 12px 12px;text-align:center">
            <p style="color:rgba(255,255,255,.4);margin:0;font-size:12px">${fecha}</p>
          </div>
        </div>`,
    });

    // 2. Confirmación al lead
    await resend.emails.send({
      from: 'Construye con Datos <noreply@construyecondatos.com>',
      to: [email],
      subject: `Recibimos tu mensaje, ${nombre}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0B5ED7;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h2 style="color:white;margin:0">Construye con Datos</h2>
            <p style="color:#E1BA10;margin:8px 0 0;font-size:14px;font-weight:bold">Del dato al informe que decide</p>
          </div>
          <div style="padding:32px 24px;background:white;border:1px solid #e5e5e5">
            <p style="font-size:16px;margin:0 0 16px">Hola <strong>${nombre}</strong>,</p>
            <p style="line-height:1.8;color:#333;margin:0 0 16px">
              Recibimos tu mensaje y nos encanta que estes explorando como mejorar el control de tus obras.
            </p>
            <p style="line-height:1.8;color:#333;margin:0 0 16px">
              Nuestro equipo revisara tu consulta y te contactaremos en las proximas <strong>24 horas habiles</strong>.
            </p>
            <p style="line-height:1.8;color:#333;margin:0 0 24px">
              Mientras tanto, puedes agendar una demo directamente:
            </p>
            <div style="text-align:center;margin:0 0 24px">
              <a href="https://calendar.app.google/2BLVGKbUKmfJHgkK6"
                style="background:#0B5ED7;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block">
                Agendar Demo Gratuita
              </a>
            </div>
            <p style="color:#999;font-size:12px;margin:0">
              Si no solicitaste esto, puedes ignorar este correo.
            </p>
          </div>
          <div style="background:#f8f8f8;padding:16px;border-radius:0 0 12px 12px;text-align:center;border:1px solid #e5e5e5;border-top:0">
            <p style="color:#999;margin:0;font-size:11px">Construye con Datos — construyecondatos.com</p>
          </div>
        </div>`,
    });

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
