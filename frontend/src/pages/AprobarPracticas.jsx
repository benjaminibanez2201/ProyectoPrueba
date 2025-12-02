import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Building2, User, Calendar } from 'lucide-react';
import { showErrorAlert, showSuccessAlert } from '../helpers/sweetAlert';

const AprobarPracticas = () => {
    const [practicas, setPracticas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(null);

    useEffect(() => {
        cargarPracticasPendientes();
    }, []);

    const cargarPracticasPendientes = async () => {
        try {
            const response = await fetch('/api/users/practicas/confirmadas-por-empresa', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json(); 
                console.error('Error del Servidor:', response.status, errorData); 
                throw new Error(errorData.message || `Error ${response.status} al cargar prácticas`);
            }
            
            const data = await response.json();
            setPracticas(
                data.data || 
                data.practicas || 
                data || 
                []
            );

        } catch (error) {
            console.error('Error:', error);
            showErrorAlert('Error', 'No se pudieron cargar las prácticas pendientes');
        } finally {
            setLoading(false);
        }
    }

    

    const aprobarPractica = async (practicaId) => {
        try {
            setProcesando(practicaId);

            const response = await fetch(`/api/users/practicas/${practicaId}/aprobar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al aprobar práctica');

            const data = await response.json();
            
            showSuccessAlert('Aprobada', 'La práctica ha sido aprobada y ahora está en curso.');
            
            setPracticas(prev => prev.filter(p => p.id !== practicaId));
        } catch (error) {
            console.error('Error:', error);
            showErrorAlert('Error', 'No se pudo aprobar la práctica');
        } finally {
            setProcesando(null);
        }
    }

    const rechazarPractica = async (practicaId) => {
        try {
            setProcesando(practicaId);

            const response = await fetch(`/api/users/practicas/${practicaId}/rechazar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json(); 
                throw new Error(errorData.message || 'Error al rechazar práctica');
            }

            await response.json();

            showSuccessAlert('Rechazada', 'La práctica ha sido devuelta a estado pendiente.');
            
            setPracticas(prev => prev.filter(p => p.id !== practicaId));
        } catch (error) {
            console.error('Error:', error);
            showErrorAlert('Error', error.message || 'No se pudo rechazar la práctica');
        } finally {
            setProcesando(null);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <p className="text-gray-700 text-xl">Cargando prácticas pendientes...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-blue-700">Portal de Prácticas - Coordinador</h1>
                </div>
            </header>

            {/* Contenido */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                    <h2 className="text-3xl font-bold text-green-800 mb-2">
                        Gestionar Inicio de Prácticas
                    </h2>
                    <p className="text-gray-600">
                        Revisa y gestiona las confirmaciones de inicio enviadas por las empresas.
                    </p>
                </div>

                {/* Lista de prácticas pendientes */}
                {practicas.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No hay prácticas pendientes de aprobación
                        </h3>
                        <p className="text-gray-500">
                            Todas las confirmaciones han sido procesadas.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {practicas.map((practica) => (
                            <div 
                                key={practica.id} 
                                className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500"
                            >
                                {/* Banner de estado */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center">
                                        <Clock className="w-6 h-6 text-yellow-600 mr-3" />
                                        <div>
                                            <p className="font-semibold text-yellow-800">
                                                Confirmación Recibida de la Empresa
                                            </p>
                                            <p className="text-yellow-700 text-sm">
                                                Fecha: {new Date(practica.fechaInicio).toLocaleDateString('es-CL')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Información de la práctica */}
                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <User className="w-5 h-5 text-blue-600 mr-2" />
                                            <h4 className="font-semibold text-gray-700">Alumno</h4>
                                        </div>
                                        <p className="text-lg font-bold text-gray-800">{practica.alumnoNombre}</p>
                                        <p className="text-sm text-gray-600">{practica.alumnoEmail}</p>
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <Building2 className="w-5 h-5 text-green-600 mr-2" />
                                            <h4 className="font-semibold text-gray-700">Empresa</h4>
                                        </div>
                                        <p className="text-lg font-bold text-gray-800">{practica.empresaNombre}</p>
                                        <p className="text-sm text-gray-600">{practica.empresaCorreo}</p>
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                                            <h4 className="font-semibold text-gray-700">Detalles</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">ID Práctica: {practica.id}</p>
                                        <p className="text-sm text-gray-600">Tipo: {practica.tipoPractica}</p>
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => aprobarPractica(practica.id)}
                                        disabled={procesando === practica.id}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        <span>
                                            {procesando === practica.id ? 'Aprobando...' : 'Aprobar e Iniciar Práctica'}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => rechazarPractica(practica.id)}
                                        disabled={procesando === practica.id}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        <span>
                                            {procesando === practica.id ? 'Procesando...' : 'Rechazar Confirmación'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AprobarPracticas;