import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    name: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 255,
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    role: {
      type: "varchar",
      length: 50,
      default: "alumno", // 'alumno', 'empresa', 'coordinador'
    },
    tipo_practica: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    practicasComoAlumno: { //Estas relaciones son para que tengamos mas flexibilidad a la hora de hacer consultas en la BDD
      type: "one-to-many",
      target: "Practica",
      inverseSide: "student",
    },
    practicasComoEmpresa: {
      type: "one-to-many",
      target: "Practica",
      inverseSide: "empresa",
    },
  },
});