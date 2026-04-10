html: `
<div style="font-family: Arial, sans-serif; background:#f4f4f5; padding:20px">

  <div style="max-width:600px;margin:auto;background:white;border-radius:14px;padding:30px">

    <!-- HEADER -->
    <h2 style="color:#16a34a;margin-bottom:5px;">
      💚 Gracias por tu apoyo
    </h2>

    <p style="font-size:15px;color:#555;">
      Tu donación fue realizada con éxito 🙌
    </p>

    <!-- INFO -->
    <div style="background:#f9fafb;padding:15px;border-radius:10px;margin:20px 0;">
      <p><b>Campaña:</b></p>
      <h3 style="margin:5px 0">${campaign}</h3>
      <p><b>Monto donado:</b> $${amount.toLocaleString()}</p>
    </div>

    <!-- IMPACTO -->
    <p style="font-size:15px;color:#333;">
      Tu aporte está ayudando directamente a cambiar una vida.
    </p>

    <!-- 💣 BLOQUE EMOCIONAL -->
    <div style="background:#ecfdf5;padding:18px;border-radius:10px;margin-top:20px">

      <p style="margin:0;font-weight:bold;color:#065f46;">
        🌍 No estás solo
      </p>

      <p style="font-size:14px;color:#065f46;margin-top:6px;">
        Muchas personas ya están apoyando esta causa junto contigo.
      </p>

    </div>

    <!-- 🚀 CTA -->
    <div style="text-align:center;margin-top:25px">

      <p style="font-size:14px;color:#444;margin-bottom:10px;">
        🚀 Ayuda a que esta campaña llegue más lejos
      </p>

      <a href="https://impulsasuenos.com/campaign"
        style="display:inline-block;padding:12px 20px;background:#16a34a;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">
        Compartir campaña
      </a>

    </div>

    <!-- REFUERZO -->
    <p style="margin-top:25px;font-size:14px;color:#444;text-align:center;">
      Cada persona que comparte, multiplica el impacto 💚
    </p>

    <hr style="margin:25px 0;border:none;border-top:1px solid #eee"/>

    <!-- BRAND -->
    <p style="font-size:13px;color:#777;text-align:center;">
      Gracias por confiar en <b>ImpulsaSueños</b>
    </p>

  </div>

</div>
`