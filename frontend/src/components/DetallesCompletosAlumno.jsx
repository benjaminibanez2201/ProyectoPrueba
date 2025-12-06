import React, { useState, useEffect } from 'react';
import { X, Eye, CheckCircle, Clock, XCircle, Folder } from 'lucide-react';
import { getDocsAlumno } from '../services/documento.service.js';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

// Componente para mostrar el estado del documento
const EstadoDocumento = ({ estado }) => {
    let style = 'bg-gray-100 text-gray-700';
    let Icon = Clock;

    if (estado?.includes('Aprobado')) {
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
    const [expediente, setExpediente] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const { alumno, practica, documentos } = expediente;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">

                {/* ENCABEZADO */}
                <div className="p-6 border-b flex justify-between items-center">
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

                {/* INFORMACIÓN GENERAL */}
                <div className="p-6 bg-indigo-50 rounded-t-lg">
                    <p className="text-sm text-indigo-900"><strong>Nombre:</strong> {alumno?.nombre}</p>
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
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {documentos.map((doc) => (
                                        <tr key={doc.id}>
                                            <td className="px-4 py-2 text-sm">{doc.tipo}</td>
                                            <td className="px-4 py-2 text-sm">{doc.fechaEnvio || 'N/A'}</td>
                                            <td className="px-4 py-2">
                                                <EstadoDocumento estado={doc.estado} />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {doc.urlRevision ? (
                                                    <a
                                                        href={`${VITE_BASE_URL}${doc.urlRevision}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 flex justify-center"
                                                    >
                                                        <Eye size={18} />
                                                    </a>
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
                        <p className="text-center text-gray-500">No hay documentos aún.</p>
                    )}
                </div>

                {/* PIE */}
                <div className="p-4 border-t flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Cerrar Expediente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetallesCompletosAlumno;