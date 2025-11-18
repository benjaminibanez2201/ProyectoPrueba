import { EntitySchema } from "typeorm";

export const DocumentosPractica = new EntitySchema({
    name: "DocumentoPractica", 
    tableName: "documentos_practicas", 
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        tipo: { // 'Informe', 'Bitácora', 'Evaluación', 'Formulario', etc.
            type: "varchar",
            length: 50,
            nullable: false,
        },
        estado: { // 'pendiente', 'enviado', 'aprobado'
            type: "varchar",
            length: 50,
            default: "pendiente",
        },
        ruta_archivo: { // para Bitácoras o Informes (archivos subidos)
            type: "varchar",
            nullable: true, 
        },
        datos_json: { // para Evaluaciones o Formularios (datos rellenados)
            type: "jsonb",
            nullable: true,
        },
        fecha_creacion: {
            type: "timestamp",
            createDate: true,
        },
    },
    relations: {
        practica: { 
            target: "Practica",
            type: "many-to-one",
            joinColumn: { name: "practicaId" }, 
            inverseSide: "documentos", 
            nullable: false,
        },
    }
});
