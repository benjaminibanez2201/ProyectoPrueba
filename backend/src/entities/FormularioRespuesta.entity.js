import { EntitySchema } from "typeorm";
// Importamos las entidades con las que se relaciona
import { Practica } from "./practica.entity.js";
import { FormularioPlantilla } from "./FormularioPlantilla.entity.js";

export const FormularioRespuesta = new EntitySchema({
  name: "FormularioRespuesta",
  tableName: "formulario_respuestas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    // Aquí se guardan las respuestas del usuario
    // Ej: { "p1": "Juan Perez", "p2": 7.0 }
    datos: {
      type: "json",
      nullable: false,
    },
    estado: {
      type: "enum",
      enum: ["borrador", "enviado", "aprobado", "rechazado"],
      default: "enviado",
    },
    fecha_envio: {
      type: "timestamp",
      createDate: true,
    },
    comentario_coordinador: {
      type: "text",
      nullable: true, // Por si el coordinador quiere dar feedback
    },
  },
  relations: {
    // Relación con la Plantilla (¿Qué formulario respondió?)
    plantilla: {
      type: "many-to-one",
      target: "FormularioPlantilla",
      joinColumn: { name: "plantilla_id" },
      nullable: false,
    },
    // Relación con la Práctica (¿De qué alumno es esto?)
    practica: {
      type: "many-to-one",
      target: "Practica",
      joinColumn: { name: "practica_id" },
      nullable: false,
      onDelete: "CASCADE",
    },
  },
});