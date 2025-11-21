import { EntitySchema } from "typeorm";

export const FormularioPlantilla = new EntitySchema({
  name: "FormularioPlantilla",
  tableName: "formulario_plantillas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",// para que vaya incrementando 
    },
    titulo: {
      type: "varchar",
      length: 200,
      comment: "Evaluacion, Bitacora, Postulacion",
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    tipo: {
      type: "enum",
      // Tipos de platilla
      enum: ["postulacion", "bitacora", "evaluacion_pr1", "evaluacion_pr2"],
      unique: true, 
    },
    // Aqui se guardan las preguntas, tipos de input, opciones, etc.
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