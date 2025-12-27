import { EntitySchema } from "typeorm";

export const EmpresaToken = new EntitySchema({
  name: "EmpresaToken",
  tableName: "empresa_tokens",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    token: {
      type: "varchar",
      unique: true,
    },
    empresaNombre: {
      type: "varchar",
      nullable: true,
    },
    empresaCorreo: {
      type: "varchar",
      nullable: true,
    },
    expiracion: {
      type: "timestamp",
    },
    creadoEn: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    practica: {
      type: "one-to-one",
      target: "Practica",
      joinColumn: { name: "practica_id" }, // Esto crea la columna 'practica_id'
      onDelete: "CASCADE", // Si se borra la práctica, se borra el token
    },
  },
});
