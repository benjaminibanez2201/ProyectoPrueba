// mensaje.entity.js
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
        // 👇 NUEVO: Guardamos el nombre del remitente/destinatario
        remitente_nombre: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        remitente_email: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        destinatario_nombre: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        destinatario_email: {
            type: "varchar",
            length: 255,
            nullable: false
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
        // 👇 Solo guardamos referencia al coordinador (User)
        coordinador: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "coordinadorId" },
            nullable: true, // Puede ser null si el remitente es empresa
        }
    },
});