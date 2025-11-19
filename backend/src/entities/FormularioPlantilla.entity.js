import { EntitySchema } from "typeorm";

export const FormularioPlantilla = new EntitySchema({
  name: "FormularioPlantilla",
  tableName: "formulario_plantillas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    titulo: {
      type: "varchar",
      length: 200,
      comment: "Ej: Evaluación de Empresa, Bitácora Semanal",
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    tipo: {
      type: "enum",
      // Agregamos los tipos específicos
      enum: ["postulacion", "bitacora", "evaluacion_pr1", "evaluacion_pr2"],
      unique: true, 
    },
    // ¡EL CORAZÓN DEL SISTEMA!
    // Aquí guardamos las preguntas, tipos de input, opciones, etc.
    esquema: {
      type: "json", 
      nullable: false,
    },
    creadoEn: {
      type: "timestamp",
      createDate: true,
    },
    actualizadoEn: {
      type: "timestamp",
      updateDate: true,
    },
  },
});