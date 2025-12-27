import { EntitySchema } from "typeorm";
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
    // Aqui guardamos las respuestas del usuario
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
      nullable: true, 
    },
  },
  relations: {
    // Relacion que indica que el formulario se respondió
    plantilla: {
      type: "many-to-one",
      target: "FormularioPlantilla",
      joinColumn: { name: "plantilla_id" },
      nullable: false,
      eager: true,
    },
    // Relación que indica a que alumno pertenece la respuesta
    practica: {
      type: "many-to-one",
      target: "Practica",
      joinColumn: { name: "practica_id" },
      nullable: false,
      onDelete: "CASCADE",
    },
  },
});