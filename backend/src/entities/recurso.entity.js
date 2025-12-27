import { EntitySchema } from "typeorm";

export const Recurso = new EntitySchema({
  name: "Recurso",
  tableName: "recursos", // Nombre de la tabla en la base de datos
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    tipo: {
      type: "varchar",
      length: 50, // Ej: "pdf", "docx"
      nullable: true,
    },
    url: {
      type: "varchar", // La ruta relativa: "/uploads/pauta2025.pdf"
      length: 500,
      nullable: false,
    },
    fecha_subida: {
      type: "timestamp",
      createDate: true, // Se llena solo automáticamente al crear
    },
  },
});
