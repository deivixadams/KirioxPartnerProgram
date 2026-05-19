import nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendConfirmationCode(email: string, code: string): Promise<void> {
  const transporter = createTransporter()
  const from = process.env.SMTP_FROM || 'Kiriox Partner Program <noreply@kiriox.com>'

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Código de Verificación — Kiriox</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="
          background: linear-gradient(135deg, rgba(14,21,47,0.95) 0%, rgba(10,15,30,0.95) 100%);
          border: 1px solid rgba(56,189,248,0.2);
          border-radius: 20px;
          overflow:hidden;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        ">
          <!-- Header -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%);
              padding: 32px 40px;
              text-align: center;
            ">
              <div style="
                display:inline-block;
                width:52px;height:52px;
                border-radius:14px;
                background:rgba(255,255,255,0.2);
                backdrop-filter:blur(10px);
                line-height:52px;
                font-size:24px;
                font-weight:900;
                color:#fff;
                margin-bottom:16px;
              ">K</div>
              <br/>
              <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
                Kiriox Partner Program
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#f1f5f9;letter-spacing:-0.5px;">
                Verificación de acceso
              </h1>
              <p style="margin:0 0 32px;color:#94a3b8;font-size:15px;line-height:1.6;">
                Ingresa el siguiente código de 6 dígitos para completar tu inicio de sesión.
                Este código expira en <strong style="color:#0ea5e9;">5 minutos</strong>.
              </p>

              <!-- OTP Code Box -->
              <div style="
                background: rgba(14,165,233,0.08);
                border: 1px solid rgba(14,165,233,0.3);
                border-radius: 16px;
                padding: 28px;
                text-align: center;
                margin-bottom: 32px;
              ">
                <div style="
                  font-size: 48px;
                  font-weight: 900;
                  letter-spacing: 12px;
                  color: #38bdf8;
                  font-family: 'Courier New', monospace;
                  text-shadow: 0 0 20px rgba(56,189,248,0.4);
                ">${code}</div>
                <p style="margin:12px 0 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;">
                  Código de verificación
                </p>
              </div>

              <p style="margin:0 0 12px;color:#64748b;font-size:13px;line-height:1.6;">
                ⚠️ Si no iniciaste sesión en Kiriox, ignora este correo. Tu cuenta permanece segura.
              </p>
              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                🔒 Nunca compartas este código con nadie. El equipo de Kiriox jamás te lo solicitará.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding: 20px 40px;
              border-top: 1px solid rgba(255,255,255,0.06);
              text-align: center;
            ">
              <p style="margin:0;color:#334155;font-size:12px;">
                © ${new Date().getFullYear()} Kiriox Partner Program. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  await transporter.sendMail({
    from,
    to: email,
    subject: `${code} — Tu código de verificación Kiriox`,
    html,
    text: `Tu código de verificación Kiriox es: ${code}\n\nEste código expira en 5 minutos.\n\nSi no iniciaste sesión, ignora este correo.`,
  })
}
