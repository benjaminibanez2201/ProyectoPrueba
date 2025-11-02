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
      type: "varchar",
      length: 50,
      default: "Pendiente",
    },
    fecha_inicio: {
      type: "date",
      nullable: true,
    },
    fecha_fin: {
      type: "date",
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
    },
  },
});
