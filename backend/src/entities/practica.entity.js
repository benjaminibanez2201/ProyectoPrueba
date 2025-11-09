import { EntitySchema } from "typeorm";
import { User } from "./user.entity.js";

export const Practica = new EntitySchema({
  name: "Practica",
  tableName: "practicas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    estado: {
      type: "enum",
      enum: ["pendiente", "en_curso", "finalizada", "evaluada"],
      default: "pendiente",
    },
    fecha_inicio: {
      type: "date",
      nullable: true,
    },
    fecha_fin: {
      type: "date",
      nullable: true,
    },
    fecha_creacion: {
      type: "timestamp",
      createDate: true,
    },
    fecha_actualizacion: {
      type: "timestamp",
      updateDate: true,
    },
    fecha_cierre: {
      type: "timestamp",
      nullable: true,
    },
    cerrado_por: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
  },
  relations: {
    student: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "student_id" },
      eager: true,
    },
    empresa: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "empresa_id" },
      eager: true,
      nullable: true,
    },
  },
});
