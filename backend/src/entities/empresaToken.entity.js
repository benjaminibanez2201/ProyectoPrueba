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
    empresaNombre: { // Mantenemos esto por si el Coordinador lo crea (RF7)
      type: "varchar",
      nullable: true,
    },
    empresaCorreo: { // Mantenemos esto por si el Coordinador lo crea (RF7)
      type: "varchar",
      nullable: true,
    },
    // ¡CAMBIO CLAVE! 'alumnoId' se va.
    expiracion: {
      type: "timestamp",
    },
    creadoEn: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    // ¡NUEVA RELACIÓN!
    // Un token pertenece a UNA Práctica.
    practica: {
      type: "one-to-one",
      target: "Practica",
      joinColumn: { name: "practica_id" }, // Esto crea la columna 'practica_id'
      onDelete: "CASCADE", // Si se borra la práctica, se borra el token
    },
  },
});

