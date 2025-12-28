import { EntitySchema } from "typeorm";

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
      enum: [
        "pendiente",
        "enviada_a_empresa",
        "pendiente_validacion",
        "rechazada",
        "en_curso",
        "finalizada",
        "evaluada",
        "cerrada",
      ],

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
    correccion_destinatario: {
      type: "enum",
      enum: ["alumno", "empresa", "ambos"],
      nullable: true,
      comment: "A quién se solicitó corrección tras rechazo",
    },
    correccion_alumno_hecha: {
      type: "boolean",
      default: false,
      nullable: false,
    },
    correccion_empresa_hecha: {
      type: "boolean",
      default: false,
      nullable: false,
    },
    // Flujo de evaluación final
    evaluacion_pendiente: {
      type: "boolean",
      default: false,
      nullable: false,
    },
    evaluacion_completada: {
      type: "boolean",
      default: false,
      nullable: false,
    },
    nivel: {
      type: "enum",
      enum: ["pr1", "pr2"],
      nullable: true,
      comment: "Nivel de práctica profesional (PR1 o PR2)",
    },
    nota_final: {
      type: "float",
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
    empresaToken: {
      type: "one-to-one",
      target: "EmpresaToken",
      inverseSide: "practica",
      nullable: true,
      eager: true,
    },
    documentos: {
      type: "one-to-many",
      target: "DocumentoPractica",
      inverseSide: "practica",
    },
    formularioRespuestas: {
      type: "one-to-many",
      target: "FormularioRespuesta",
      inverseSide: "practica", // Debe coincidir con la entidad respuesta
      eager: true,
    },
  },
});
