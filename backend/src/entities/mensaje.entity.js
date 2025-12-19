import { EntitySchema } from "typeorm";

export const Mensaje = new EntitySchema({
    name: "Mensaje",
    tableName: "mensajes",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        contenido: {
            type: "text",
            nullable: false,
        },
        remitente: {
            type: "varchar",
            length: 50, // 'coordinador' o 'empresa'
            nullable: false,
        },
        fecha_envio: {
            type: "timestamp",
            createDate: true,
        }
    },
    relations: {
        practica: {
            target: "Practica",
            type: "many-to-one",
            joinColumn: { name: "practicaId" },
            nullable: false,
            onDelete: "CASCADE",
        },
    },
});