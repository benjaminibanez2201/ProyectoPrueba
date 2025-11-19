import { AppDataSource } from "../config/configDb.js";
import { FormularioPlantilla } from "../entities/FormularioPlantilla.entity.js";

async function seedFormularios() {
  try {
    console.log("🌱 Iniciando Seeder de Formularios...");
    
    // 1. Inicializamos la conexión (si no está iniciada)
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const plantillaRepository = AppDataSource.getRepository(FormularioPlantilla);

    // --- DEFINICIÓN DE PLANTILLAS POR DEFECTO ---
    
    const plantillasPorDefecto = [
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
            required: true 
          },
          { 
            id: "horario_clases", 
            label: "Horario de Clases (Mañana y Tarde)", 
            tipo: "schedule", // El frontend dibujará la tabla
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
            required: true
          },
          {
            id: "rubro",
            label: "Rubro (Giro)",
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
          //Datos supervisor practica
          {
            id: "sep_supervisor",
            label: "Antecedentes del Estudiante",
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
            required: true
          },
          {
            id: "cargo",
            label: "Cargo",
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
            required: true
          },
          //Objetivos de la pracrica
          {
            id: "obj_practica",
            label: "Objetivos de la Práctica",
            tipo: "textarea",
            required: true
          },
          //Actividades a desarrollar
          {
            id: "act_desarrollar",
            label: "Actividades a Desarrollar",
            tipo: "textarea",
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
            tipo: "signature", // El frontend dibujará el canvas
            required: true 
          },
          { 
            id: "firma_empresa", 
            label: "Firma de la Empresa", 
            tipo: "signature", // El frontend dibujará el canvas
            required: true 
          }
        ]
      },
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
      {
        titulo: "EVALUACIÓN PRÁCTICA PROFESIONAL",
        descripcion: "Formulario para que el supervisor evalúe al alumno al finalizar la práctica.",
        tipo: "evaluacion",
        esquema: [
          {
            id: "nombre_supervisor",
            label: "Nombre del Supervisor",
            tipo: "text",
            placeholder: "Ingrese su nombre completo",
            required: true
          },
          {
            id: "cargo_supervisor",
            label: "Cargo del Supervisor",
            tipo: "text",
            required: true
          },
          {
            id: "eval_tecnica",
            label: "Competencias Técnicas (1-7)",
            tipo: "select",
            options: ["1", "2", "3", "4", "5", "6", "7"],
            required: true
          },
          {
            id: "eval_blanda",
            label: "Habilidades Blandas y Trabajo en Equipo (1-7)",
            tipo: "select",
            options: ["1", "2", "3", "4", "5", "6", "7"],
            required: true
          },
          {
            id: "nota_final",
            label: "Nota Final Propuesta",
            tipo: "number",
            min: 1,
            max: 7,
            required: true
          },
          {
            id: "comentarios",
            label: "Comentarios y Observaciones",
            tipo: "textarea",
            required: false
          }
        ]
      },
    ];

    // --- INSERCIÓN DE DATOS ---

    for (const plantilla of plantillasPorDefecto) {
      // 1. Buscamos si existe por TIPO
      const existe = await plantillaRepository.findOne({ 
        where: { tipo: plantilla.tipo } 
      });

      if (!existe) {
        // 2. Si no existe, la CREAMOS
        const nuevaPlantilla = plantillaRepository.create(plantilla);
        await plantillaRepository.save(nuevaPlantilla);
        console.log(`✅ Plantilla creada: ${plantilla.titulo}`);
      } else {
        // 3. Si ya existe, la ACTUALIZAMOS (¡Esta es la parte nueva!)
        // Esto forzará a que la base de datos tome tus cambios en el JSON
        await plantillaRepository.update(existe.id, { esquema: plantilla.esquema });
        console.log(`🔄 Plantilla actualizada: ${plantilla.titulo}`);
      }
    }

    console.log("✨ Seeder finalizado correctamente.");
    process.exit(0); // Salir con éxito

  } catch (error) {
    console.error("❌ Error en el Seeder:", error);
    process.exit(1); // Salir con error
  }
}

// Ejecutar la función
seedFormularios();