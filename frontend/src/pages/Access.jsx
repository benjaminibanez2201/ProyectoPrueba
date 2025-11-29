import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validarTokenEmpresa, confirmarInicioPractica } from '../services/empresa.service.js';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js'; 
import { CheckCircle, XCircle, Loader2, Building2, User, Briefcase, Clock, LogOut } from 'lucide-react';

const Access = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmado, setConfirmado] = useState(false);
    const [procesando, setProcesando] = useState(false);

    const handleCerrarSesion = () => {
        navigate('/auth');
    };

    useEffect(() => {
        if (!token) {
            setError("Error: Token no proporcionado.");
            setLoading(false);
            return;
        }

        const validarAcceso = async () => {
            try {
                const response = await validarTokenEmpresa(token);

                console.log('Respuesta completa del servidor:', response);
                console.log('Data recibida:', response?.data);

                if (!response?.data) {
                    throw new Error('Respuesta del servidor inválida');
                }

                console.log('Datos de práctica procesados:', response.data);
                console.log('Estado de práctica:', response.data.estado);

                setData(response.data); 

                if (response.data.estado === 'en_curso') {
                    console.log('Práctica ya está en curso');
                    setConfirmado(true);
                } else if (response.data.estado === 'confirmada_por_empresa') {
                    console.log('Práctica confirmada, esperando aprobación del coordinador');
                    setConfirmado(true);
                }
            } catch (err) {
                console.error('Error al validar el token:', err);
                setError(err.message || 'Token inválido o expirado.');
            } finally {
                setLoading(false);
            }
        };

        validarAcceso();
    }, [token]);

    const handleConfirmar = async () => {
        if (!data){
            showErrorAlert('Error', 'No hay datos de práctica disponibles.');
            return;
        }
        
        if (data.estado !== 'pendiente_revision') {
            showErrorAlert('Advertencia', 'La práctica ya ha sido iniciada o finalizada.');
            return;
        }

        if (confirmado) {
            showErrorAlert('Advertencia', 'La práctica ya ha sido confirmada.');
            return;
        }

        try {
            setProcesando(true);

            const response = await confirmarInicioPractica(token, true);

            showSuccessAlert("Éxito", response.message || 'La práctica ha sido confirmada exitosamente.');
            setConfirmado(true);
            setData(prevData => ({
                ...prevData,
                estado: 'en_curso'
            }));

        } catch (err) {
            console.error('Error al confirmar práctica:', err);
            showErrorAlert("Error", err.message || 'Error al confirmar el inicio de la práctica.');
            setError("Fallo al registrar la confirmación."); 
        } finally {
            setProcesando(false);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 text-green-700 animate-spin mx-auto" />
                    <p className="text-gray-700 text-xl font-medium">Validando Token...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-2xl mx-auto pt-20">
                    <div className="bg-white shadow-lg rounded-xl p-8">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="bg-red-100 rounded-full p-4">
                                <XCircle className="w-16 h-16 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Acceso Denegado</h2>
                            <p className="text-gray-600">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-2xl mx-auto pt-20">
                    <div className="bg-white shadow-lg rounded-xl p-8 text-center">
                        <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-700 text-lg font-semibold">No se pudieron cargar los datos.</p>
                    </div>
                </div>
            </div>
        );
    }

    const { alumnoNombre, empresaNombre, estado } = data;
    const estaEnCurso = estado === 'en_curso';
    const estaConfirmada = estado === 'confirmada_por_empresa';
    const yaProcesada = estaEnCurso || estaConfirmada;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            {/* Header igual al panel de alumno */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-700">Portal de Prácticas</h1>
                    <button 
                        onClick={handleCerrarSesion}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </header>

            {/* Contenido principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Título de sección */}
                <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                    <h2 className="text-3xl font-bold text-green-800 mb-2">
                        Portal de Confirmación de Práctica
                    </h2>
                    <p className="text-gray-600">
                        Bienvenido, <span className="font-semibold">{empresaNombre}</span>. Gestiona la confirmación de inicio de práctica aquí.
                    </p>
                </div>

                {/* Estado de la práctica - Banner */}
                {estaEnCurso && (
                    <div className="bg-green-100 border-l-4 border-green-600 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                            <div>
                                <p className="font-semibold text-green-800">La práctica ya está en curso</p>
                                <p className="text-green-700 text-sm">La práctica fue confirmada exitosamente.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid de tarjetas*/}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Tarjeta Estado */}
                    <div className="bg-green-50 rounded-xl shadow-md p-6 border-t-4 border-green-600">
                        <div className="flex items-center mb-4">
                            <div className="bg-green-600 rounded-lg p-2 mr-3">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-green-800">Estado Actual</h3>
                        </div>
                        <p className={`text-xl font-semibold ${estaEnCurso ? 'text-green-700' : 'text-blue-600'}`}>
                            {estaEnCurso ? 'En Curso' : 'Pendiente revisión'}
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                            {estaEnCurso ? 'La práctica está activa.' : 'Requiere tu confirmación.'}
                        </p>
                    </div>

                    {/* Tarjeta Alumno */}
                    <div className="bg-green-50 rounded-xl shadow-md p-6 border-t-4 border-green-600">
                        <div className="flex items-center mb-4">
                            <div className="bg-green-600 rounded-lg p-2 mr-3">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-green-800">Alumno</h3>
                        </div>
                        <p className="text-xl font-semibold text-gray-800">{alumnoNombre}</p>
                        <p className="text-gray-600 text-sm mt-2">Estudiante en práctica</p>
                    </div>
                </div>

                {/* Sección de acción */}
                {!estaEnCurso && (
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar Inicio de Práctica</h3>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <Building2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Al presionar <span className="font-semibold">"Confirmar Inicio"</span>, 
                                        usted acepta formalmente que la práctica del alumno{' '}
                                        <span className="font-semibold">{alumnoNombre}</span> ha comenzado en su institución.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleConfirmar}
                            disabled={procesando}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {procesando ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Confirmando...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Confirmar Inicio de Práctica</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Access;