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
        asunto: {
            type: "varchar",
            length: 200,
            nullable: false,
        },
        contenido: {
            type: "text",
            nullable: false,
        },
        remitente_tipo: {
            type: "varchar",
            length: 20,
            nullable: false,
            comment: "coordinador o empresa"
        },
        destinatario_tipo: {
            type: "varchar",
            length: 20,
            nullable: false,
            comment: "coordinador o empresa"
        },
        leido: {
            type: "boolean",
            default: false,
        },
        fecha_envio: {
            type: "timestamp",
            createDate: true,
        },
        fecha_lectura: {
            type: "timestamp",
            nullable: true,
        },
        createdAt: {
            type: "timestamp",
            createDate: true,
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true,
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
        remitente: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "remitenteId" },
            nullable: false,
        },
        destinatario: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "destinatarioId" },
            nullable: false,
        },
    },
});