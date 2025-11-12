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
    alumnoId: {
      type: "int",
    },
    expiracion: {
      type: "timestamp",
    },
    creadoEn: {
      type: "timestamp",
      createDate: true,
    },
  },
});