import { AppDataSource } from "../config/configDb.js";
import { FormularioPlantilla } from "../entities/FormularioPlantilla.entity.js";

async function seedFormularios() {
  try {
    console.log("Iniciando Seeder de Formularios...");
    
    // Inicializamos la conexion si esq no esta iniciada 
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    // (llave) Repositorio (la herramienta) para manipular la entidad FormularioPlantilla.
    const plantillaRepository = AppDataSource.getRepository(FormularioPlantilla);

    // Aqui definimos las plantillas por defecto
    
    const plantillasPorDefecto = [
      // Formulario
      {
        titulo: "FORMULARIO POSTULACIÓN PRÁCTICA PROFESIONAL",
        descripcion: "Documento inicial para inscribir la práctica profesional.",
        tipo: "postulacion",
        esquema: [
          // Datos alumno
          {
            id: "sep_alumno",
            label: "Antecedentes del Estudiante",
            tipo: "header",
          },
          {
            id: "tipo_practica",
            label: "Tipo de Practica",
            tipo: "select",
            options: ["Profesional 1", "Profesional 2"],
            fillBy: "alumno",
            required: true
          },
          {
            id: "fecha_recepcion",
            label: "Fecha Recepción",
            tipo: "date",
            required: true
          },
          {
            id: "nombre_alumno",
            label: "Nombre Completo",
            tipo: "text",
            fillBy: "alumno",
            required: true
          },
          {
            id: "rut",
            label: "RUT",
            tipo: "text",
            fillBy: "alumno",
            required: true
          },
          {
            id: "correo_alumno",
            label: "Correo Electrónico",
            tipo: "email",
            fillBy: "alumno",
            required: true
          },
          {
            id: "direccion",
            label: "Dirección en la Ciudad",
            tipo: "text",
            fillBy: "alumno",
            required: true
          },
          {
            id: "fono_estudiante",
            label: "Fono",
            tipo: "text",
            fillBy: "alumno",
            required: true
          },
          //Disponibilidad
          {
            id: "sep_disponibilidad",
            label: "Disponibilidad y Periodo",
            tipo: "header",
          },
          { 
            id: "periodo_realizacion", 
            label: "Periodo de Realización", 
            tipo: "select", 
            options: ["Temporada de Verano (Enero-Marzo)", "Semestre Académico (Marzo-Diciembre)"],
            fillBy: "alumno",
            required: true 
          },
          { 
            id: "horario_clases", 
            label: "Horario de Clases (Mañana y Tarde)", 
            tipo: "schedule", // El frontend dibujará la tabla
            fillBy: "alumno",
            required: false 
          },
          // Datos Empresa
          {
            id: "sep_empresa",
            label: "Antecedentes de la Empresa",
            tipo: "header",
          },
          {
            id: "nombre_empresa",
            label: "Nombre Empresa",
            tipo: "text",
            required: true
          },
          {
            id: "pagina_web",
            label: "Página Web",
            tipo: "text",
            fillBy: "empresa",
            required: false
          },
          {
            id: "rubro",
            label: "Rubro (Giro)",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          {
            id: "fono_empresa",
            label: "Fono Empresa",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          {
            id: "direccion",
            label: "Dirección",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          {
            id: "ciudad",
            label: "Ciudad",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          //Datos supervisor practica
          {
            id: "sep_supervisor",
            label: "Antecedentes del Supervisor",
            tipo: "header",
          },
          {
            id: "nombre_supervisor",
            label: "Nombre Completo",
            tipo: "text",
            required: true
          },
          {
            id: "profesion",
            label: "Profesión",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          {
            id: "cargo",
            label: "Cargo",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          {
            id: "fono_supervisor",
            label: "Fono Supervisor",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          {
            id: "correo_supervisor",
            label: "Correo Electrónico",
            tipo: "email",
            required: true
          },
          // Area de desarrollo de la practica
          {
            id: "sep_detalles",
            label: "Detalles de la Práctica",
            tipo: "header",
          },
          {
            id: "area_practica",
            label: "Area de Desarrollo de la Práctica",
            tipo: "textarea",
            fillBy: "empresa",
            required: true
          },
          //Objetivos de la pracrica
          {
            id: "obj_practica",
            label: "Objetivos de la Práctica",
            tipo: "textarea",
            fillBy: "empresa",
            required: true
          },
          //Actividades a desarrollar
          {
            id: "act_desarrollar",
            label: "Actividades a Desarrollar",
            tipo: "textarea",
            fillBy: "empresa",
            required: true
          },
          { 
            id: "fecha_inicio", 
            label: "Fecha Inicio", 
            tipo: "date", 
            required: true 
          },
          { 
            id: "fecha_termino", 
            label: "Fecha Término", 
            tipo: "date", 
            required: true 
          },
          // Horario de práctica
          {
            id: "sep_horaio_pracica",
            label: "Horario de la Práctica",
            tipo: "header",
          },
          { 
            id: "horario_practica", 
            label: "Horario de Práctica (Mañana y Tarde)", 
            tipo: "schedule", // El frontend dibujará la tabla
            required: true 
          },
          // Validacion
          {
            id: "sep_validacion",
            label: "Validacion",
            tipo: "header",
          },
          { 
            id: "firma_alumno", 
            label: "Firma del Alumno", 
            tipo: "signature",
            fillBy: "alumno",
            required: true 
          },
          { 
            id: "firma_empresa", 
            label: "Firma y Timbre de la Empresa", 
            tipo: "signature", // El frontend dibujará el canvas
            fillBy: "empresa",
            required: true 
            
          }
        ]
      },
      //Bitacora
      {
        titulo: "BITÁCORA PRÁCTICA PROFESIONAL",
        descripcion: "Registro de lo realizado durante la semana o por actividad.",
        tipo: "bitacora",
        esquema: [
          {
            id: "nombre_alumno",
            label: "Nombre Completo",
            tipo: "text",
            required: true
          },
          {
            id: "rut",
            label: "RUT",
            tipo: "text",
            required: true
          },
          {
            id: "correo_alumno",
            label: "Correo Electrónico",
            tipo: "email",
            required: true
          },
          {
            id: "nombre_empresa",
            label: "Centro de Practica",
            tipo: "text",
            required: true
          },
          {
            id: "fono_empresa",
            label: "Fono Empresa",
            tipo: "text",
            required: true
          },
          {
            id: "nombre_supervisor",
            label: "Supervisor Empresa",
            tipo: "text",
            required: true
          },
          {
            id: "fono_supervisor",
            label: "Fono Supervisor",
            tipo: "text",
            required: true
          },
          {
            id: "fecha",
            label: "Fecha",
            tipo: "date",
            required: true
          },
          {
            id: "duracion_actividad",
            label: "Duración Actividad",
            tipo: "text",
            required: true
          },
          {
            id: "descripcion",
            label: "Descripción",
            tipo: "textarea",
            placeholder: "Considerar en el relato (Tareas específicas, áreas involucradas de la empresa, herramientas y plataformas usadas, resultados obtenidos)",
            required: true
          },
          {
            id: "compania",
            label: "La Actividad Asignada se Realizó en Compañía de ",
            tipo: "select",
            options: ["Jefatura", "Otro(s) Practicante(s)", "Apoyo Profesional", "En Forma Invividual", "Otra compañía"],
            required: true
          },
          {
            id: "tipo",
            label: "Tipo de Actividad Realizada Corresponde a ",
            tipo: "select",
            options: ["Reunión", "Busqueda Información", "Estudio Software", "Estudio Hardware", "Trabajo Terreno", "Exposición", "Lectura de Manuales", "Estudios de Framework", "Instalación Software", "Instalación Hardware", "Otra Actividad"],
            required: true
          }
        ]
      },
      //Evaluacion 1
      {
        titulo: "EVALUACIÓN PRÁCTICA PROFESIONAL I",
        descripcion: "Evaluación del alumno",
        tipo: "evaluacion_pr1",
        esquema: [
          // Datos alumno
          {
            id: "sep_alumno",
            label: "Antecedentes del Estudiante",
            tipo: "header",
          },
          {
            id: "nombre_alumno",
            label: "Nombre Completo",
            tipo: "text",
            required: true
          },
          {
            id: "rut",
            label: "RUT",
            tipo: "text",
            required: true
          },
          {
            id: "correo_alumno",
            label: "Correo Electrónico",
            tipo: "email",
            required: true
          },
          {
            id: "direccion",
            label: "Dirección en la Ciudad",
            tipo: "text",
            required: true
          },
          {
            id: "fono_estudiante",
            label: "Fono",
            tipo: "text",
            required: true
          },
           // Datos Empresa
          {
            id: "sep_empresa",
            label: "Antecedentes de la Empresa",
            tipo: "header",
          },
          {
            id: "nombre_empresa",
            label: "Nombre Empresa",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          {
            id: "rubro",
            label: "Rubro (Giro)",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          {
            id: "direccion",
            label: "Dirección",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          {
            id: "ciudad",
            label: "Ciudad",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          {
            id: "nombre_supervisor",
            label: "Nombre Completo",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          {
            id: "fono_supervisor",
            label: "Fono del Supervisor",
            tipo: "text",
            fillBy: "empresa",
            required: true
          },
          //Periodo
          {
            id: "sep_periodo",
            label: "Periodo de Desarrollo de Práctica Profesional I",
            tipo: "header",
          },
          {
            id: "fecha_inicio",
            label: "Fecha Inicio",
            tipo: "date",
            fillBy: "empresa",
            required: true
          },
          {
            id: "fecha_fin",
            label: "Fecha Término",
            tipo: "date",
            fillBy: "empresa",
            required: true
          },
          {
            id: "horas_crono",
            label: "Total Horas Cronológicas",
            tipo: "number",
            fillBy: "empresa",
            required: true
          },
          {
            id: "sep_act",
            label: "Actividades",
            tipo: "header",
          },
          {
            id: "act_desarrolladas",
            label: "Actividades Desarrolladas (Breve Descripción)",
            tipo: "textarea",
            fillBy: "empresa",
            required: true
          },
          //Evaluación
          { 
            id: "titulo_iv", 
            label: "IV.- ASPECTOS A EVALUAR (Competencias)", 
            tipo: "header" 
          },
          { 
            id: "instrucciones_escala", 
            label: "Instrucciones: Marque la letra que corresponda a lo observado. Escala: A (Sobresaliente) - B (Bueno) - C (Moderado) - D (Suficiente) - E (Insuficiente) - F (No aplica)", 
            // Usamos 'paragraph' para texto largo informativo (tendrás que soportarlo en el front)
            // Si no quieres crear un componente nuevo, usa 'header' temporalmente.
            tipo: "paragraph" 
          },

          // ============================================================
          // COMPETENCIA CG1
          // ============================================================
          { 
            id: "header_cg1", 
            label: "CG1: Manifiesta una actitud permanente de búsqueda y actualización de sus aprendizajes, incorporando los cambios sociales, científicos y tecnológicos en el ejercicio y desarrollo de su profesión. ", 
            tipo: "header" 
          },
          { 
            id: "cg1_autonomia", 
            label: "Es capaz de buscar información de manera autónoma.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "cg1_tendencias", 
            label: "Incorpora tendencias sociales, tecnológicas, científicas en su trabajo.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          // ============================================================
          // COMPETENCIA CG2
          // ============================================================
          { 
            id: "header_cg2", 
            label: "CG2: Asume un rol activo como ciudadano y profesional, comprometiéndose de manera responsable con su medio social, natural y cultural.", 
            tipo: "header" 
          },
          { 
            id: "cg2_horario", 
            label: "Llega en el horario indicado a los compromisos adquiridos.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "cg2_efectividad", 
            label: "Realiza efectivamente las actividades o tareas que le son encomendadas.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "cg2_instrucciones", 
            label: "Acepta o asume en forma positiva las diversas instrucciones, hechos y órdenes impartidas por su supervisor.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          // ============================================================
          // COMPETENCIA CG3
          // ============================================================
          { 
            id: "header_cg3", 
            label: "CG3: Establece relaciones dialogantes para el intercambio de aportes constructivos con otras disciplinas y actúa éticamente en su profesión, trabajando de manera asociativa en la consecución de objetivos.", 
            tipo: "header" 
          },
          { 
            id: "cg3_relacion", 
            label: "Se relaciona adecuadamente con el personal del Centro de Práctica.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "cg3_colaborativo", 
            label: "Trabaja colaborativamente en equipos multidisciplinarios.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "cg3_comportamiento", 
            label: "Durante el trabajo con los demás mantiene un comportamiento ético.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          // ============================================================
          // COMPETENCIA CG4
          // ============================================================
          { 
            id: "header_cg4", 
            label: "CG4: Comunica ideas y sentimientos en forma oral y escrita para interactuar efectivamente en el entorno social y profesional en su lengua materna y en un nivel inicial en un segundo idioma.", 
            tipo: "header" 
          },
          { 
            id: "cg4_lm", 
            label: "Comunica ideas y sentimientos en forma oral y escrita en su lengua materna.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"],
            fillBy: "empresa", 
            required: true 
          },
          { 
            id: "cg4_si", 
            label: "Comunica ideas y sentimientos en forma oral y escrita en un segundo idioma.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          // ============================================================
          // COMPETENCIA CE1
          // ============================================================
          { 
            id: "header_ce1", 
            label: "CE1: Gestiona sistemas computacionales para responder de forma óptima a los requerimientos de los usuarios evaluando su desempeño en base a los recursos disponibles.", 
            tipo: "header" 
          },
          { 
            id: "ce1_soporte", 
            label: "Realiza soporte de servidores y/o herramientas de software avanzado.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce1_instala", 
            label: "Instala y/o configurar software para servidores.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce1_redes", 
            label: "Colabora en el diseño e implementación de redes de computadores.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce1_evaluacion", 
            label: "Realiza evaluación de hardware y/o software.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce1_funcionamiento", 
            label: "Colabora en la evaluación del funcionamiento de redes de computadores.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          // ============================================================
          // COMPETENCIA CE2
          // ============================================================
          { 
            id: "header_ce2", 
            label: "CE2: Desarrolla software efectivo y eficiente, para diversos dominios, siguiendo un enfoque de ingeniería.", 
            tipo: "header" 
          },
          { 
            id: "ce2_levantamiento", 
            label: "Realiza levantamiento de requisitos para un proyecto Informático.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce2_documentacion", 
            label: "Diseña procesos de documentación: software, procesos de la información, procesos de negocios tanto a nivel de usuario como de desarrollador.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce2_metodos", 
            label: "Propone y/o aplica métodos de detección y documentación de errores ocurridos durante el desarrollo, puesta en marcha o uso de aplicaciones.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce2_modulos", 
            label: "Diseña y/o implementa módulos de software acotados que utilicen tecnologías avanzadas.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce2_diseno", 
            label: "Colabora en el diseño de procesos de negocios.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          // ============================================================
          // COMPETENCIA CE3
          // ============================================================
          { 
            id: "header_ce3", 
            label: "CE3: Construye bases de datos que permitan satisfacer las necesidades de información de las organizaciones o individuos, mediante el uso de diversas técnicas de modelado.", 
            tipo: "header" 
          },
          { 
            id: "ce3_diseno", 
            label: "Participa del diseño y del levantamiento de requisitos para implementar bases de datos.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce3_conocimientos", 
            label: "Demuestra conocimientos técnicos de algún sistema administrador de bases de datos.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce3_tecnicas", 
            label: "Domina técnicas que aportan en el modelado de datos y procesos de negocios.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          // ============================================================
          // COMPETENCIA CE4
          // ============================================================
          { 
            id: "header_ce4", 
            label: "CE4: Gestiona los recursos informáticos, de manera de apoyar y dar soporte a los procesos y estrategias de negocio de las organizaciones que permitan el mejoramiento continuo de las mismas.", 
            tipo: "header" 
          },
          { 
            id: "ce4_conocimientos", 
            label: "Demuestra conocimientos técnicos de algún sistema administrador de bases de datos.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce4_tecnicas", 
            label: "Domina técnicas que aportan en el modelado de datos y procesos de negocios.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce4_negocios", 
            label: "Colabora en el diseño de procesos de negocios.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce4_plan", 
            label: "Colabora en el diseño de un plan informático.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce4_auditoria", 
            label: "Colabora en el diseño e implementación de procesos de auditoría informática.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          // ============================================================
          // COMPETENCIA CE5
          // ============================================================
          { 
            id: "header_ce5", 
            label: "CE5: Aplica conocimientos de las ciencias básicas y de la ingeniería para resolver problemas usando pensamiento lógico racional y capacidades analíticas y de abstracción.", 
            tipo: "header" 
          },
          { 
            id: "ce5_autogestion", 
            label: "Demuestra capacidad de autogestión para Investigar tecnologías emergentes.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce5_conocimientos", 
            label: "Aplica sus conocimientos teóricos para resolver problemas complejos en ámbitos del Ingeniero Civil Informático.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          { 
            id: "ce5_capacidad", 
            label: "Demuestra capacidad analítica y de abstracción al enfrentar problemas.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: true 
          },
          // ============================================================
          // OTRAS COMPETENCIAS 
          // ============================================================
          { 
            id: "header_otras_competencias", 
            label: "OTRAS COMPETENCIAS: Describa competencias observadas que no han sido mencionadas", 
            tipo: "header" 
          },

          // --- ACTIVIDAD EXTRA 1 ---
          { 
            id: "otra_competencia_1_desc", 
            label: "1. Descripción de la Actividad / Competencia", 
            tipo: "textarea", 
            placeholder: "Describa la actividad realizada...",
            fillBy: "empresa",
            required: false // Opcional, por si no hay nada extra que agregar
          },
          { 
            id: "otra_competencia_1_eval", 
            label: "Evaluación (1)", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"],
            fillBy: "empresa", 
            required: false 
          },

          // --- ACTIVIDAD EXTRA 2 ---
          { 
            id: "otra_competencia_2_desc", 
            label: "2. Descripción de la Actividad / Competencia", 
            tipo: "textarea", 
            placeholder: "Describa la actividad realizada...",
            fillBy: "empresa",
            required: false 
          },
          { 
            id: "otra_competencia_2_eval", 
            label: "Evaluación (2)", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: false 
          },

          // --- ACTIVIDAD EXTRA 3 ---
          { 
            id: "otra_competencia_3_desc", 
            label: "3. Descripción de la Actividad / Competencia", 
            tipo: "textarea", 
            placeholder: "Describa la actividad realizada...",
            fillBy: "empresa",
            required: false 
          },
          { 
            id: "otra_competencia_3_eval", 
            label: "Evaluación (3)", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            fillBy: "empresa",
            required: false 
          },
          { 
            id: "sep_observaciones", 
            label: "Observaciones", 
            tipo: "header" 
          },
          {
            id: "fortalezas",
            label: "Fortalezas del Estudiante",
            tipo: "textarea",
            fillBy: "empresa",
            required: true
          },
          {
            id: "debilidades",
            label: "Debilidades del Estudiante",
            tipo: "textarea",
            fillBy: "empresa",
            required: true
          },
          {
            id: "observaciones_generales",
            label: "Observaciones Generales",
            tipo: "textarea",
            fillBy: "empresa",
            required: true
          },
          { 
            id: "firma_empresa", 
            label: "Firma y Timbre de la Empresa", 
            tipo: "signature", // El frontend dibujará el canvas
            fillBy: "empresa",
            required: true 
          }
        ]
      },
      // Evaluacion 2
      {
        titulo: "EVALUACIÓN PRÁCTICA PROFESIONAL II",
        descripcion: "Evaluación del alumno",
        tipo: "evaluacion_pr2",
        esquema: [
          // Datos alumno
          {
            id: "sep_alumno",
            label: "Antecedentes del Estudiante",
            tipo: "header",
          },
          {
            id: "nombre_alumno",
            label: "Nombre Completo",
            tipo: "text",
            required: true
          },
          {
            id: "rut",
            label: "RUT",
            tipo: "text",
            required: true
          },
          {
            id: "correo_alumno",
            label: "Correo Electrónico",
            tipo: "email",
            required: true
          },
          {
            id: "direccion",
            label: "Dirección en la Ciudad",
            tipo: "text",
            required: true
          },
          {
            id: "fono_estudiante",
            label: "Fono",
            tipo: "text",
            required: true
          },
           // Datos Empresa
          {
            id: "sep_empresa",
            label: "Antecedentes de la Empresa",
            tipo: "header",
          },
          {
            id: "nombre_empresa",
            label: "Nombre Empresa",
            tipo: "text",
            required: true
          },
          {
            id: "rubro",
            label: "Rubro (Giro)",
            tipo: "text",
            required: true
          },
          {
            id: "direccion",
            label: "Dirección",
            tipo: "text",
            required: true
          },
          {
            id: "ciudad",
            label: "Ciudad",
            tipo: "text",
            required: true
          },
          {
            id: "nombre_supervisor",
            label: "Nombre Completo",
            tipo: "text",
            required: true
          },
          {
            id: "fono_supervisor",
            label: "Fono del Supervisor",
            tipo: "text",
            required: true
          },
          //Periodo
          {
            id: "sep_periodo",
            label: "Periodo de Desarrollo de Práctica Profesional I",
            tipo: "header",
          },
          {
            id: "fecha_inicio",
            label: "Fecha Inicio",
            tipo: "date",
            required: true
          },
          {
            id: "fecha_fin",
            label: "Fecha Término",
            tipo: "date",
            required: true
          },
          //
          {
            id: "horas_crono",
            label: "Total Horas Cronológicas",
            tipo: "number",
            required: true
          },
          {
            id: "sep_act",
            label: "Actividades",
            tipo: "header",
          },
          {
            id: "act_desarrolladas",
            label: "Actividades Desarrolladas (Breve Descripción)",
            tipo: "textarea",
            required: true
          },
          //Evaluación
          { 
            id: "titulo_iv", 
            label: "IV.- ASPECTOS A EVALUAR (Competencias)", 
            tipo: "header" 
          },
          { 
            id: "instrucciones_escala", 
            label: "Instrucciones: Marque la letra que corresponda a lo observado. Escala: A (Sobresaliente) - B (Bueno) - C (Moderado) - D (Suficiente) - E (Insuficiente) - F (No aplica)", 
            // Usamos 'paragraph' para texto largo informativo (tendrás que soportarlo en el front)
            // Si no quieres crear un componente nuevo, usa 'header' temporalmente.
            tipo: "paragraph" 
          },

          // ============================================================
          // COMPETENCIA CG1
          // ============================================================
          { 
            id: "header_cg1", 
            label: "CG1: Manifiesta una actitud permanente de búsqueda y actualización de sus aprendizajes, incorporando los cambios sociales, científicos y tecnológicos en el ejercicio y desarrollo de su profesión. ", 
            tipo: "header" 
          },
          { 
            id: "cg1_autonomia", 
            label: "Es capaz de buscar información de manera autónoma.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "cg1_tendencias", 
            label: "Incorpora tendencias sociales, tecnológicas, científicas en su trabajo.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          // ============================================================
          // COMPETENCIA CG2
          // ============================================================
          { 
            id: "header_cg2", 
            label: "CG2: Asume un rol activo como ciudadano y profesional, comprometiéndose de manera responsable con su medio social, natural y cultural.", 
            tipo: "header" 
          },
          { 
            id: "cg2_horario", 
            label: "Llega en el horario indicado a los compromisos adquiridos.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "cg2_efectividad", 
            label: "Realiza efectivamente las actividades o tareas que le son encomendadas.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "cg2_instrucciones", 
            label: "Acepta o asume en forma positiva las diversas instrucciones, hechos y órdenes impartidas por su supervisor.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          // ============================================================
          // COMPETENCIA CG3
          // ============================================================
          { 
            id: "header_cg3", 
            label: "CG3: Establece relaciones dialogantes para el intercambio de aportes constructivos con otras disciplinas y actúa éticamente en su profesión, trabajando de manera asociativa en la consecución de objetivos.", 
            tipo: "header" 
          },
          { 
            id: "cg3_relacion", 
            label: "Se relaciona adecuadamente con el personal del Centro de Práctica.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "cg3_colaborativo", 
            label: "Trabaja colaborativamente en equipos multidisciplinarios.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "cg3_comportamiento", 
            label: "Durante el trabajo con los demás mantiene un comportamiento ético.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          // ============================================================
          // COMPETENCIA CG4
          // ============================================================
          { 
            id: "header_cg4", 
            label: "CG4: Comunica ideas y sentimientos en forma oral y escrita para interactuar efectivamente en el entorno social y profesional en su lengua materna y en un nivel inicial en un segundo idioma.", 
            tipo: "header" 
          },
          { 
            id: "cg4_lm", 
            label: "Comunica ideas y sentimientos en forma oral y escrita en su lengua materna.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "cg4_si", 
            label: "Comunica ideas y sentimientos en forma oral y escrita en un segundo idioma.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          // ============================================================
          // COMPETENCIA CE1
          // ============================================================
          { 
            id: "header_ce1", 
            label: "CE1: Gestiona sistemas computacionales para responder de forma óptima a los requerimientos de los usuarios evaluando su desempeño en base a los recursos disponibles.", 
            tipo: "header" 
          },
          { 
            id: "ce1_soporte", 
            label: "Realiza soporte de servidores y/o herramientas de software avanzado.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce1_instala", 
            label: "Instala y/o configurar software para servidores.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce1_redes", 
            label: "Colabora en el diseño e implementación de redes de computadores.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce1_evaluacion", 
            label: "Realiza evaluación de hardware y/o software.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce1_funcionamiento", 
            label: "Colabora en la evaluación del funcionamiento de redes de computadores.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          // ============================================================
          // COMPETENCIA CE2
          // ============================================================
          { 
            id: "header_ce2", 
            label: "CE2: Desarrolla software efectivo y eficiente, para diversos dominios, siguiendo un enfoque de ingeniería.", 
            tipo: "header" 
          },
          { 
            id: "ce2_levantamiento", 
            label: "Realiza levantamiento de requisitos para un proyecto Informático.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce2_documentacion", 
            label: "Diseña procesos de documentación: software, procesos de la información, procesos de negocios tanto a nivel de usuario como de desarrollador.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce2_metodos", 
            label: "Propone y/o aplica métodos de detección y documentación de errores ocurridos durante el desarrollo, puesta en marcha o uso de aplicaciones.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce2_modulos", 
            label: "Diseña y/o implementa módulos de software acotados que utilicen tecnologías avanzadas.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce2_diseno", 
            label: "Colabora en el diseño de procesos de negocios.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          // ============================================================
          // COMPETENCIA CE3
          // ============================================================
          { 
            id: "header_ce3", 
            label: "CE3: Construye bases de datos que permitan satisfacer las necesidades de información de las organizaciones o individuos, mediante el uso de diversas técnicas de modelado.", 
            tipo: "header" 
          },
          { 
            id: "ce3_diseno", 
            label: "Participa del diseño y del levantamiento de requisitos para implementar bases de datos.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce3_conocimientos", 
            label: "Demuestra conocimientos técnicos de algún sistema administrador de bases de datos.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce3_tecnicas", 
            label: "Domina técnicas que aportan en el modelado de datos y procesos de negocios.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          // ============================================================
          // COMPETENCIA CE4
          // ============================================================
          { 
            id: "header_ce4", 
            label: "CE4: Gestiona los recursos informáticos, de manera de apoyar y dar soporte a los procesos y estrategias de negocio de las organizaciones que permitan el mejoramiento continuo de las mismas.", 
            tipo: "header" 
          },
          { 
            id: "ce4_conocimientos", 
            label: "Demuestra conocimientos técnicos de algún sistema administrador de bases de datos.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce4_tecnicas", 
            label: "Domina técnicas que aportan en el modelado de datos y procesos de negocios.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce4_negocios", 
            label: "Colabora en el diseño de procesos de negocios.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce4_plan", 
            label: "Colabora en el diseño de un plan informático.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce4_auditoria", 
            label: "Colabora en el diseño e implementación de procesos de auditoría informática.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          // ============================================================
          // COMPETENCIA CE5
          // ============================================================
          { 
            id: "header_ce5", 
            label: "CE5: Aplica conocimientos de las ciencias básicas y de la ingeniería para resolver problemas usando pensamiento lógico racional y capacidades analíticas y de abstracción.", 
            tipo: "header" 
          },
          { 
            id: "ce5_autogestion", 
            label: "Demuestra capacidad de autogestión para Investigar tecnologías emergentes.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce5_conocimientos", 
            label: "Aplica sus conocimientos teóricos para resolver problemas complejos en ámbitos del Ingeniero Civil Informático.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          { 
            id: "ce5_capacidad", 
            label: "Demuestra capacidad analítica y de abstracción al enfrentar problemas.", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: true 
          },
          // ============================================================
          // OTRAS COMPETENCIAS 
          // ============================================================
          { 
            id: "header_otras_competencias", 
            label: "OTRAS COMPETENCIAS: Describa competencias observadas que no han sido mencionadas", 
            tipo: "header" 
          },

          // --- ACTIVIDAD EXTRA 1 ---
          { 
            id: "otra_competencia_1_desc", 
            label: "1. Descripción de la Actividad / Competencia", 
            tipo: "textarea", 
            placeholder: "Describa la actividad realizada...",
            required: false // Opcional, por si no hay nada extra que agregar
          },
          { 
            id: "otra_competencia_1_eval", 
            label: "Evaluación (1)", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: false 
          },

          // --- ACTIVIDAD EXTRA 2 ---
          { 
            id: "otra_competencia_2_desc", 
            label: "2. Descripción de la Actividad / Competencia", 
            tipo: "textarea", 
            placeholder: "Describa la actividad realizada...",
            required: false 
          },
          { 
            id: "otra_competencia_2_eval", 
            label: "Evaluación (2)", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: false 
          },

          // --- ACTIVIDAD EXTRA 3 ---
          { 
            id: "otra_competencia_3_desc", 
            label: "3. Descripción de la Actividad / Competencia", 
            tipo: "textarea", 
            placeholder: "Describa la actividad realizada...",
            required: false 
          },
          { 
            id: "otra_competencia_3_eval", 
            label: "Evaluación (3)", 
            tipo: "select", 
            options: ["A", "B", "C", "D", "E", "F"], 
            required: false 
          },
          { 
            id: "sep_observaciones", 
            label: "Observaciones", 
            tipo: "header" 
          },
          {
            id: "fortalezas",
            label: "Fortalezas del Estudiante",
            tipo: "textarea",
            required: true
          },
          {
            id: "debilidades",
            label: "Debilidades del Estudiante",
            tipo: "textarea",
            required: true
          },
          {
            id: "observaciones_generales",
            label: "Observaciones Generales",
            tipo: "textarea",
            required: true
          },
          { 
            id: "firma_empresa", 
            label: "Firma y Timbre de la Empresa", 
            tipo: "signature", // El frontend dibujará el canvas
            required: true 
          }
        ]
      },
    ];

    // Insertamos
    for (const plantilla of plantillasPorDefecto) {
      // Buscamos si existe por el tipo
      const existe = await plantillaRepository.findOne({ 
        where: { tipo: plantilla.tipo } 
      });

      if (!existe) {
        // Si no existe, la creamos
        const nuevaPlantilla = plantillaRepository.create(plantilla);
        await plantillaRepository.save(nuevaPlantilla);
        console.log(`Plantilla creada: ${plantilla.titulo}`);
      } else {
        // Si ya existe, la actualizamos, esto forzará a que la base de datos tome tus cambios en el json
        await plantillaRepository.update(existe.id, { esquema: plantilla.esquema });
        console.log(`Plantilla actualizada: ${plantilla.titulo}`);
      }
    }

    console.log("Seeder finalizado correctamente.");
    process.exit(0); // Salir con éxito

  } catch (error) {
    console.error("Error en el Seeder:", error);
    process.exit(1); // Salir con error
  }
}

// Ejecutar la función
seedFormularios();