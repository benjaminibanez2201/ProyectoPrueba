/**
 * SERVICIO DE CORREO ELECTRÓNICO (NODEMAILER)
 * Encargado de las notificaciones automáticas
 */
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// CONFIGURACIÓN DEL TRANSPORTADOR
// Se conecta al servidor de correo (Gmail por defecto) usando variables de entorno (.env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * FUNCIÓN GENÉRICA DE ENVÍO
 * Base para todas las notificaciones del sistema
 */
export const sendEmail = async (destinatario, asunto, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatario,
      subject: asunto,
      html: htmlContent, // Usamos HTML para que el correo se vea bonito
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado: " + info.response);
    return true;
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return false;
  }
};

/**
 * TOKEN DE ACCESO EMPRESA (Magic Link Inicial)
 * Envía el enlace de acceso al supervisor cuando el alumno postula
 */
export const sendTokenEmail = async (
  emailEmpresa,
  nombreSupervisor,
  token,
  nombreAlumno
) => {
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

/**
 * NOTIFICACIÓN DE EVALUACIÓN (Aprobación/Rechazo)
 * Notifica al alumno y/o empresa sobre la decisión del coordinador
 */
export const enviarNotificacionEvaluacion = async (
  practica,
  decision,
  observaciones,
  destinatarioError
) => {
  const emailAlumno = practica.student?.email;
  const emailEmpresa = practica.empresaToken?.empresaCorreo;
  const nombreAlumno = practica.student?.name;

  let asunto = "";
  let mensajeHTML = "";
  let destinatarios = [];

  // CASO APROBADO: Notificamos a ambos que la práctica está 'En Curso'
  if (decision === "aprobar") {
    asunto = "[UBB] Práctica Profesional Aprobada Exitosamente";
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

  // CASO RECHAZADO: Se define quién debe corregir (Alumno, Empresa o Ambos)
  else if (decision === "rechazar") {
    asunto = "[CORRECCIÓN REQUERIDA] - Práctica Profesional UBB";
    const respuestaPostulacion = Array.isArray(practica?.formularioRespuestas)
      ? practica.formularioRespuestas.find(
          (r) => r?.plantilla?.tipo === "postulacion"
        ) || practica.formularioRespuestas[0]
      : null;
    const respuestaId = respuestaPostulacion?.id;
    const linkAlumno = respuestaId
      ? `http://localhost:5173/alumno/correccion/${respuestaId}`
      : null;
    // Link para empresa (token)
    const tokenEmpresa = practica?.empresaToken?.token;
    const linkEmpresa = tokenEmpresa
      ? `http://localhost:5173/empresa/acceso/${tokenEmpresa}`
      : null;

    // Lógica de a quién culpar (quién recibe el correo)
    if (destinatarioError === "alumno") destinatarios = [emailAlumno];
    else if (destinatarioError === "empresa") destinatarios = [emailEmpresa];
    else if (destinatarioError === "ambos")
      destinatarios = [emailAlumno, emailEmpresa];
    else destinatarios = [emailAlumno];

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
            ${
              linkAlumno &&
              (destinatarioError === "alumno" || destinatarioError === "ambos")
                ? `
            <div style="text-align:center; margin:24px 0;">
              <a href="${linkAlumno}" style="background-color:#0d6efd; color:white; padding:12px 20px; text-decoration:none; border-radius:6px; display:inline-block;">Corregir como Alumno</a>
            </div>
            <p style="font-size:12px; color:#666; text-align:center;">Si el botón no funciona, use este enlace: ${linkAlumno}</p>
            `
                : ""
            }
            ${
              linkEmpresa && destinatarioError === "empresa"
                ? `
            <div style="text-align:center; margin:24px 0;">
              <a href="${linkEmpresa}" style="background-color:#198754; color:white; padding:12px 20px; text-decoration:none; border-radius:6px; display:inline-block;">Corregir como Empresa</a>
            </div>
            <p style="font-size:12px; color:#666; text-align:center;">Si el botón no funciona, use este enlace: ${linkEmpresa}</p>
            `
                : ""
            }
            ${
              destinatarioError === "ambos"
                ? `
            <div style=\"background:#fff7e6; border:1px solid #ffe4b5; padding:12px; border-radius:6px; color:#8a6d3b; margin-top:12px;\">
              Nota para la Empresa: por favor espere a que el alumno corrija su sección. Posteriormente recibirá un correo para completar su parte.
            </div>
            `
                : ""
            }
                </div>
                <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                    Universidad del Bío-Bío - Facultad de Ciencias Empresariales
                </div>
            </div>
        `;
  }

  // Enviar el correo usando tu función existente (sendEmail)
  if (destinatarios.length > 0) {
    // Filtramos por si alguno es null o undefined
    const listaDestinatarios = destinatarios.filter((e) => e).join(", ");
    if (listaDestinatarios) {
      await sendEmail(listaDestinatarios, asunto, mensajeHTML);
    }
  }
};

/**
 * CONFIRMACIÓN DE EVALUACIÓN REGISTRADA
 * Se dispara automáticamente cuando la empresa guarda el formulario de evaluación con éxito
 * Informa a ambas partes que el proceso ha subido de nivel
 */
export const enviarConfirmacionEvaluacionEmpresa = async (
  practica,
  tipoEvaluacion
) => {
  try {
    const emailAlumno = practica?.student?.email;
    const emailEmpresa =
      practica?.empresaToken?.empresaCorreo || practica?.empresa?.email;
    const nombreAlumno = practica?.student?.name || "Alumno";
    const nivelTexto =
      tipoEvaluacion === "evaluacion_pr2" ? "Profesional II" : "Profesional I";

    const asunto = `[UBB] Evaluación ${nivelTexto} registrada por la empresa`;
    const mensajeHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0d6efd; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">Evaluación Registrada</h2>
        </div>
        <div style="padding: 20px;">
          <p>Estimado/a,</p>
          <p>La empresa ha registrado la evaluación de la práctica de <strong>${nombreAlumno}</strong> (${nivelTexto}).</p>
          <p>El estado de la práctica ha sido actualizado a <strong>Evaluada</strong>. La coordinación podrá proceder con la revisión final y/o cierre administrativo según corresponda.</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
          Universidad del Bío-Bío - Facultad de Ciencias Empresariales
        </div>
      </div>
    `;

    // Enviar a alumno y empresa (si existen)
    const destinatarios = [emailAlumno, emailEmpresa]
      .filter(Boolean)
      .join(", ");
    if (destinatarios) {
      await sendEmail(destinatarios, asunto, mensajeHTML);
    }
  } catch (error) {
    console.warn(
      "No se pudo enviar correo de confirmación de evaluación:",
      error?.message
    );
  }
};

/**
 * SOLICITUD DE EVALUACIÓN DE PRÁCTICA (Magic Link para evaluar)
 * Se envía a la empresa cuando el alumno finaliza sus horas
 * Contiene el enlace directo para que el supervisor evalúe sin loguearse
 */
export const sendSolicitudEvaluacionEmail = async (
  emailEmpresa,
  nombreSupervisor,
  token,
  nombreAlumno,
  nivelTexto = "Profesional"
) => {
  const linkAcceso = `http://localhost:5173/empresa/acceso/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #6f42c1; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Solicitud de Evaluación de Práctica (${nivelTexto})</h2>
      </div>
      <div style="padding: 20px;">
        <p>Estimado/a <strong>${nombreSupervisor}</strong>,</p>
        <p>El alumno <strong>${nombreAlumno}</strong> ha finalizado su práctica ${nivelTexto}. Se solicita completar la <strong>evaluación final</strong> en el portal de empresas.</p>
        <p>Para realizar la evaluación, por favor ingrese al siguiente enlace y utilice su token de acceso:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkAcceso}" style="background-color: #6f42c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Ingresar para Evaluación
          </a>
        </div>
        <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #6f42c1;">
          <strong>Token de Acceso:</strong><br>
          <span style="font-family: monospace; font-size: 16px;">${token}</span>
        </p>
        <p>Si el botón no funciona, utilice el token en el portal de acceso a empresas.</p>
      </div>
      <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        Universidad del Bío-Bío - Facultad de Ciencias Empresariales
      </div>
    </div>
  `;
  await sendEmail(
    emailEmpresa,
    `Evaluación de Práctica: ${nombreAlumno}`,
    html
  );
};
