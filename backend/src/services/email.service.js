import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configuramos el "Transportador" (El cartero)
const transporter = nodemailer.createTransport({
  service: 'gmail', // O 'hotmail', 'outlook', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Función genérica para enviar correos
export const sendEmail = async (destinatario, asunto, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatario,
      subject: asunto,
      html: htmlContent, // Usamos HTML para que el correo se vea bonito
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Correo enviado: ' + info.response);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    return false;
  }
};

// 3. Plantilla específica para el Token de Empresa
export const sendTokenEmail = async (emailEmpresa, nombreSupervisor, token, nombreAlumno) => {
  // Aquí definimos el link donde la empresa debería entrar (aunque la página no exista aún)
  // Suponemos que la ruta será /empresa/login
  const linkAcceso = `http://localhost:5173/empresa/acceso/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0056b3; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Solicitud de Práctica Profesional</h2>
      </div>
      
      <div style="padding: 20px;">
        <p>Estimado/a <strong>${nombreSupervisor}</strong>,</p>
        
        <p>El alumno <strong>${nombreAlumno}</strong> ha postulado para realizar su práctica profesional en su empresa y lo ha indicado a usted como supervisor.</p>
        
        <p>Para validar esta solicitud y gestionar el proceso, por favor ingrese al siguiente enlace:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkAcceso}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Ingresar al Portal de Empresa
          </a>
        </div>

        <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #0056b3;">
          <strong>Su Token de Acceso:</strong> <br>
          <span style="font-family: monospace; font-size: 16px;">${token}</span>
        </p>
        
        <p>Si el botón no funciona, copie y pegue su token en el portal de acceso.</p>
      </div>
      
      <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        Universidad del Bío-Bío - Facultad de Ciencias Empresariales
      </div>
    </div>
  `;

  await sendEmail(emailEmpresa, `Solicitud de Práctica: ${nombreAlumno}`, html);
};

// 4. NUEVA FUNCIÓN: Notificación de Evaluación (Aprobación/Rechazo)
export const enviarNotificacionEvaluacion = async (practica, decision, observaciones, destinatarioError) => {
    
    const emailAlumno = practica.student?.email;
    const emailEmpresa = practica.empresaToken?.empresaCorreo;
    const nombreAlumno = practica.student?.name;

    let asunto = "";
    let mensajeHTML = "";
    let destinatarios = [];

    // --- CASO A: APROBADO ---
    if (decision === 'aprobar') {
        asunto = "✅ Práctica Profesional Aprobada - UBB";
        // En caso de aprobación, notificamos a AMBOS por defecto
        destinatarios = [emailAlumno, emailEmpresa]; 
        
        mensajeHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #28a745; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">¡Felicitaciones!</h2>
                </div>
                <div style="padding: 20px;">
                    <p>Estimado/a,</p>
                    <p>La solicitud de práctica profesional de <strong>${nombreAlumno}</strong> ha sido <strong>VALIDADA Y APROBADA</strong> por la coordinación.</p>
                    <p>El estado de la práctica es ahora: <strong style="color: #28a745;">EN CURSO</strong>.</p>
                    <p>Pueden proceder con las actividades planificadas.</p>
                </div>
                <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                    Universidad del Bío-Bío - Facultad de Ciencias Empresariales
                </div>
            </div>
        `;
    } 
    
    // --- CASO B: RECHAZADO / OBSERVADO ---
    else if (decision === 'rechazar') {
        asunto = "⚠️ Corrección Requerida - Práctica Profesional UBB";
        
        // Lógica de a quién culpar (quién recibe el correo)
        if (destinatarioError === 'alumno') destinatarios = [emailAlumno];
        else if (destinatarioError === 'empresa') destinatarios = [emailEmpresa];
        else if (destinatarioError === 'ambos') destinatarios = [emailAlumno, emailEmpresa];
        else destinatarios = [emailAlumno]; // Fallback por si acaso

        mensajeHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #dc3545; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Solicitud Observada</h2>
                </div>
                <div style="padding: 20px;">
                    <p>Se han encontrado inconsistencias en la documentación de la práctica de <strong>${nombreAlumno}</strong>.</p>
                    
                    <h3>Detalle de la Observación:</h3>
                    <blockquote style="background-color: #fff3f3; padding: 15px; border-left: 5px solid #dc3545; color: #555;">
                        ${observaciones}
                    </blockquote>

                    <p><strong>Acción Requerida:</strong> Por favor ingrese al sistema para corregir los datos solicitados a la brevedad.</p>
                </div>
                <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                    Universidad del Bío-Bío - Facultad de Ciencias Empresariales
                </div>
            </div>
        `;
    }

    // Enviar el correo usando tu función existente (sendEmail)
    // sendEmail espera un string, si son varios, los unimos con coma
    if (destinatarios.length > 0) {
        // Filtramos por si alguno es null o undefined
        const listaDestinatarios = destinatarios.filter(e => e).join(', ');
        if (listaDestinatarios) {
            await sendEmail(listaDestinatarios, asunto, mensajeHTML);
        }
    }
};