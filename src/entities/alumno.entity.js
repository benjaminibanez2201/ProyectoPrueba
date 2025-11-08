import { EntitySchema } from "typeorm";

export const Alumno = new EntitySchema({
name: "Alumno",
tableName: "alumnos",
columns: {
    alumnoId: {
    primary: true,
    type: "int",
    generated: true,
    },
    alumnoRut:{
    type: "varchar",
    unique: true,
    length: 12,
    nullable: false
    },
    alumnoNombre: {
    type: "varchar",
    nullable: true,
    },
    alumnoCorreo: {
    type: "varchar",
    nullable: true,
    },
    alumnoTelefono: {
    type: "varchar",
    nullable: true
    }
    },
});
