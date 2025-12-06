import React, { useState, useEffect } from 'react';
import { X, Download, Eye, CheckCircle, Clock } from 'lucide-react';
import { getDocsAlumno } from '../services/documento.service.js';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'; 

// componente para mostrar el estado del documento con estilos e íconos
const EstadoDocumento = ({ estado }) => {
    let style = 'bg-gray-100 text-gray-800';
    let Icon = Clock;

    if (estado && estado.includes('Aprobado')) {
        style = 'bg-green-100 text-green-700';
        Icon = CheckCircle;
    } else if (estado && estado.includes('Pendiente')) {
        style = 'bg-yellow-100 text-yellow-700';
        Icon = Clock;
    } else if (estado && estado.includes('Rechazado')) {
        style = 'bg-red-100 text-red-700';
        Icon = X;
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${style}`}>
            <Icon size={14} className="mr-1" /> {estado}
        </span>
    );
};

// componente principal para mostrar los detalles completos del alumno en un modal
const DetallesCompletosAlumno = ({ alumnoId, onClose }) => {
    const [expediente, setExpediente] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDocs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getDocsAlumno(alumnoId); 
                console.log('Datos recibidos:', data); // Para debug
                setExpediente(data.payload);
            } catch (error) {
                console.error("Error al cargar documentos:", error);
                setError(error.message);
                setExpediente(null); 
            } finally {
                setIsLoading(false);
            }
        };

        if (alumnoId) {
            loadDocs();
        }
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
                        {error || 'No se pudieron cargar los documentos completos o el alumno no tiene práctica activa.'}
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
    
    const { alumno, practica, documentos } = expediente;

    // Validar que existan los datos necesarios
    if (!alumno) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg">
                    <p className="text-red-500">No se encontró información del alumno</p>
                    <button onClick={onClose} className="mt-4 bg-gray-300 px-4 py-2 rounded">Cerrar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
                
                {/* Encabezado del Modal */}
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Expediente de Alumno: {alumno.nombre || 'Sin nombre'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Sección de Datos Generales (Práctica) */}
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-indigo-50 rounded-lg">
                        <p className="text-sm font-medium text-indigo-700">
                            <strong>Email:</strong> {alumno.email || 'N/A'}
                        </p>
                        {practica && (
                            <>
                                <p className="text-sm font-medium text-indigo-700">
                                    <strong>Estado Práctica:</strong> {practica.estado || 'N/A'}
                                </p>
                                <p className="text-sm font-medium text-indigo-700">
                                    <strong>Fecha Inicio:</strong> {practica.fechaInicio || 'N/A'}
                                </p>
                                <p className="text-sm font-medium text-indigo-700">
                                    <strong>ID Práctica:</strong> {practica.id || 'N/A'}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Sección de Documentación y Trazabilidad */}
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                        Documentación y Trazabilidad
                    </h3>
                    
                    {documentos && documentos.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Documento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha Envío
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {documentos.map((doc, index) => (
                                        <tr key={doc.id || index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {doc.tipo || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {doc.fechaEnvio || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <EstadoDocumento estado={doc.estado} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                {doc.urlRevision ? (
                                                    <div className="flex justify-center space-x-3">
                                                        {/* Botón de Revisar (Ojo) */}
                                                        <a 
                                                            href={`${VITE_API_URL}${doc.urlRevision}`}
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            title="Ver/Revisar" 
                                                            className="text-blue-600 hover:text-blue-800 transition"
                                                        >
                                                            <Eye size={18} /> 
                                                        </a>
                                                        {/* Botón de Descargar */}
                                                        <a 
                                                            href={`${VITE_API_URL}${doc.urlRevision}`}
                                                            download 
                                                            title="Descargar" 
                                                            className="text-green-600 hover:text-green-800 transition"
                                                        >
                                                            <Download size={18} />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            No hay documentos disponibles para esta práctica.
                        </p>
                    )}
                </div>

                {/* Pie de página del Modal */}
                <div className="p-4 border-t flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        Cerrar Expediente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetallesCompletosAlumno;