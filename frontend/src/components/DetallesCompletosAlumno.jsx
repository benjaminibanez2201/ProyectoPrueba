import React, { useState, useEffect } from 'react';
import { X, Eye, CheckCircle, Clock, XCircle, Folder, Download, FileText } from 'lucide-react';
import { getDocsAlumno } from '../services/documento.service.js';
import { getRespuesta } from '../services/formulario.service.js';
import FormRender from './FormRender';
import axios from '../services/root.service.js';
import html2pdf from 'html2pdf.js';

const HOST_URL = 'http://localhost:3000';

//SOLO PDF ES PREVISUALIZABLE EN EL NAVEGADOR
const PREVIEW_EXTENSIONS = ['.pdf'];

// Componente para mostrar el estado del documento
const EstadoDocumento = ({ estado }) => {
    let style = 'bg-gray-100 text-gray-700';
    let Icon = Clock;

    if (estado?.includes('Aprobado')) { // Usa includes para mayor flexibilidad
        style = 'bg-green-100 text-green-700';
        Icon = CheckCircle;
    } else if (estado?.includes('Pendiente')) {
        style = 'bg-yellow-100 text-yellow-700';
        Icon = Clock;
    } else if (estado?.includes('Rechazado')) {
        style = 'bg-red-100 text-red-700';
        Icon = XCircle;
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${style}`}> 
            <Icon size={14} className="mr-1" /> {estado}
        </span>
    );
};

const DetallesCompletosAlumno = ({ alumnoId, onClose }) => {
    const [expediente, setExpediente] = useState(null); // Estado para almacenar los datos del expediente
    const [isLoading, setIsLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error
    const [docToProcess, setDocToProcess] = useState(null); // Documento a procesar (descargar)
    const [formularioVisualizando, setFormularioVisualizando] = useState(null); // Formulario en modal

        //FUNCIÓN DE EJECUCIÓN (Vista Previa o Descarga)
    const executeFileAction = async (doc, actionType) => {
        try {
            const { urlRevision, extension, tipo } = doc; // Desestructuramos para mayor claridad
            const urlCompleta = `${HOST_URL}${urlRevision}`; // Construimos la URL completa

            // Realizamos la solicitud para obtener el archivo
            const response = await axios.get(urlCompleta, {
                responseType: 'blob',
            });

            // Creamos un Blob a partir de la respuesta
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const fileURL = URL.createObjectURL(blob);

            // Ejecutar la acción
            if (actionType === 'preview') {
                window.open(fileURL, '_blank');
            } else if (actionType === 'download') {
                const link = document.createElement('a');
                link.href = fileURL;
                link.download = `${doc.tipo}_${doc.documentoId}${extension}`; 
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(fileURL);
            }

            setDocToProcess(null);  // Cerramos el modal después de la acción

        } catch (error) {
            console.error("Error al procesar el documento:", error);
            alert(`Error al procesar el documento ${doc.tipo}.`);
            setDocToProcess(null);
        }
    };


    useEffect(() => {
        const loadDocs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getDocsAlumno(alumnoId);
                setExpediente(data.payload);
            } catch (error) {
                setError(error.message);
                setExpediente(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (alumnoId) loadDocs();
    }, [alumnoId]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg">
                    <p className="text-lg">Cargando documentos...</p>
                </div>
            </div>
        );
    }

    if (error || !expediente) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg max-w-lg">
                    <p className="text-red-500 font-bold mb-4">
                        {error || 'No se pudieron cargar los documentos completos.'}
                    </p>
                    <button 
                        onClick={onClose} 
                        className="mt-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    const { alumno, practica, documentos, formularios } = expediente;

    // Función para obtener el nombre legible del tipo de formulario
    const getNombreFormulario = (tipo) => {
        const nombres = {
            'postulacion': 'Formulario de Postulación',
            'evaluacion_pr1': 'Evaluación Profesional I',
            'evaluacion_pr2': 'Evaluación Profesional II'
        };
        return nombres[tipo] || tipo;
    };

    // Función para ver formulario en modal
    const handleVerFormulario = async (formularioId) => {
        try {
            const respuesta = await getRespuesta(formularioId);
            setFormularioVisualizando(respuesta);
        } catch (err) {
            console.error('Error al cargar formulario:', err);
            alert('No se pudo cargar el formulario.');
        }
    };

    // Función para descargar PDF del formulario
    const handleDescargarPDF = async () => {
        const element = document.getElementById('formulario-coordinador-content');
        if (!element) return;

        const opt = {
            margin: [10, 10, 10, 10],
            filename: `${getNombreFormulario(formularioVisualizando?.plantilla?.tipo)}_${alumno?.name?.replace(/\s+/g, '_') || 'Alumno'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                allowTaint: true, 
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const sections = clonedDoc.querySelectorAll('.mb-4, .mb-6, table, h2');
                    sections.forEach(el => {
                        el.style.pageBreakInside = 'avoid';
                    });
                }
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        await html2pdf().set(opt).from(element).save();
    };

    if (docToProcess) {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
                <h3 className="text-xl font-bold mb-3 text-gray-800 flex items-center">
                    <Download className="mr-2 text-indigo-600" size={24} /> 
                    Descargar Archivo {docToProcess.extension?.toUpperCase() || 'N/A'}
                </h3>
                <p className="text-gray-600 mb-4">
                    El archivo {docToProcess.tipo} ({docToProcess.extension}) no tiene una vista previa disponible en el navegador. ¿Desea continuar con la descarga?
                </p>
                <div className="flex justify-end space-x-3">
                    
                    <button
                        onClick={() => setDocToProcess(null)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Cancelar
                    </button>

                    <button
                        // Llama a la función central con la acción 'download'
                        onClick={() => executeFileAction(docToProcess, 'download')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold"
                    >
                        Descargar
                    </button>
                </div>
            </div>
        </div>
    );
}

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-4 py-8">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">

                {/* ENCABEZADO */}
                <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Expediente de Alumno
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* CONTENIDO CON SCROLL */}
                <div className="flex-1 overflow-y-auto">
                    {/* INFORMACIÓN GENERAL */}
                    <div className="p-6 bg-indigo-50">
                        <p className="text-sm text-indigo-900"><strong>Nombre:</strong> {alumno?.name}</p>
                        <p className="text-sm text-indigo-900"><strong>Correo Institucional:</strong> {alumno?.email}</p>
                        <p className="text-sm text-indigo-900"><strong>Tipo de Práctica:</strong> {alumno?.tipo_practica}</p>

                        <div className="mt-4">
                            <p className="text-sm text-indigo-900"><strong>Empresa:</strong> {practica?.empresa?.nombre || 'N/A'}</p>
                            <p className="text-sm text-indigo-900"><strong>Correo Empresa:</strong> {practica?.empresa?.email || 'N/A'}</p>
                        </div>
                    </div>

                    {/* DOCUMENTOS */}
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                            <Folder className="mr-2 text-indigo-600" /> Documentación
                        </h3>

                        {documentos?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Documento</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Fecha</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {documentos.map((doc, index) => (
                                            <tr key={doc.id || doc.index || index}>
                                                <td className="px-4 py-2 text-sm">{doc.tipo}</td>
                                            <td className="px-4 py-2 text-sm">{doc.fechaEnvio|| 'N/A'}</td>
                                            <td className="px-4 py-2">
                                                <EstadoDocumento estado={doc.estado} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No hay documentos aún.</p>
                    )}
                </div>

                {/* FORMULARIOS (Postulación y Evaluación) */}
                <div className="p-6 border-t">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <FileText className="mr-2 text-green-600" /> Formularios
                    </h3>

                    {formularios?.length > 0 ? (
                        <div className="grid gap-3">
                            {formularios.map((form) => (
                                <div 
                                    key={form.id} 
                                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${
                                            form.tipo === 'postulacion' 
                                                ? 'bg-blue-100 text-blue-600' 
                                                : 'bg-green-100 text-green-600'
                                        }`}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {getNombreFormulario(form.tipo)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Enviado: {form.fechaEnvio || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleVerFormulario(form.id)}
                                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                                            title="Ver y descargar PDF"
                                        >
                                            <Eye size={16} />
                                            Ver / PDF
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-4">
                            No hay formularios de postulación o evaluación registrados.
                        </p>
                    )}
                </div>
                </div> {/* Cierre del contenedor con scroll */}

                {/* PIE */}
                <div className="p-4 border-t flex justify-end flex-shrink-0">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Cerrar Expediente
                    </button>
                </div>
            </div>
            </div>

            {/* MODAL PARA VISUALIZAR Y DESCARGAR FORMULARIO */}
            {formularioVisualizando && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Header del Modal */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    {formularioVisualizando.plantilla?.titulo || getNombreFormulario(formularioVisualizando.plantilla?.tipo)}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Alumno: {alumno?.name}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDescargarPDF}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                                >
                                    <Download size={18} />
                                    Descargar PDF
                                </button>
                                <button
                                    onClick={() => setFormularioVisualizando(null)}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Contenido del Formulario */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                            <div id="formulario-coordinador-content" className="bg-white rounded-lg p-6 shadow">
                                {formularioVisualizando.plantilla ? (
                                    <FormRender 
                                        esquema={formularioVisualizando.plantilla.esquema}
                                        valores={formularioVisualizando.datos} 
                                        respuestasIniciales={formularioVisualizando.datos}
                                        readOnly={true}
                                        buttonText=""
                                        onSubmit={() => {}} 
                                    />
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        No se pudo cargar el formulario.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetallesCompletosAlumno;