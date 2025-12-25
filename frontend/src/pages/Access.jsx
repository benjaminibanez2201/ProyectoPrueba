import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validarTokenEmpresa, confirmarInicioPractica, enviarEvaluacionEmpresa } from '../services/empresa.service.js';
import { getPlantilla } from '../services/formulario.service.js'; // 1. Traer la plantilla
import FormRender from '../components/FormRender'; // 2. Traer tu componente estrella
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js'; 
import { CheckCircle, XCircle, Loader2, Building2, User, LogOut, FileText, ClipboardList, Clock, MessageCircle } from 'lucide-react';
import ChatMensajeria from '../components/ChatMensajeria';

const Access = () => {
    const { token } = useParams(); // Token de acceso en la URL
    const navigate = useNavigate(); // Para redirecciones

    // Estados de Datos
    const [data, setData] = useState(null);
    const [plantilla, setPlantilla] = useState(null); // Para guardar las preguntas
    const [modoEvaluacion, setModoEvaluacion] = useState(false); // Modo evaluación o postulación
    
    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [chatAbierto, setChatAbierto] = useState(false);

    // Lógica de Carga Inicial
    useEffect(() => {
        if (!token) {
            setError("Error: Token no proporcionado.");
            setLoading(false);
            return;
        }

        const cargarTodo = async () => {
            try {
                // A. Validar Token y traer datos de la práctica
                const response = await validarTokenEmpresa(token);
                if (!response?.data) throw new Error('Datos inválidos del servidor');
                setData(response.data);

                // Decidir si es evaluación o postulación
                const { evaluacionPendiente, nivel, estado } = response.data;
                const esEvaluacion = evaluacionPendiente || estado === 'finalizada';
                setModoEvaluacion(esEvaluacion);

                if (esEvaluacion) {
                    const tipo = (nivel === 'pr2') ? 'evaluacion_pr2' : 'evaluacion_pr1';
                    const plantillaData = await getPlantilla(tipo);
                    setPlantilla(plantillaData);
                } else {
                    const plantillaData = await getPlantilla('postulacion');
                    setPlantilla(plantillaData);
                }

            } catch (err) {
                console.error('Error de carga:', err);
                setError(err.message || 'Token inválido o expirado.');
            } finally {
                setLoading(false);
            }
        };

        cargarTodo();
    }, [token]);

    // Esta función busca entre todas las respuestas de la práctica (postulación, evaluación, etc.)
    // y extrae solo la que corresponde a la 'postulacion' para mostrarla en el formulario.
    const getRespuestasAlumno = () => {
        // 1. Validamos que exista el array
        if (!data || !data.formularioRespuestas) return {};
        
        // 2. Buscamos la respuesta de postulación
        const respuestaEncontrada = data.formularioRespuestas.find(
            r => r.plantilla?.tipo === 'postulacion'
        );
        
        if (!respuestaEncontrada) return {};

        const misDatos = respuestaEncontrada.datos;

        // Si los datos están escondidos dentro de "datosFormulario", los sacamos
        if (misDatos && misDatos.datosFormulario) {
            return { ...misDatos, ...misDatos.datosFormulario };
        }

        return misDatos || {};
    };

    // Prefil evaluación con datos de postulación
    const getEvaluacionInicial = () => {
        const base = getRespuestasAlumno();
        if (!plantilla?.esquema) return {};
        const permitido = new Set(plantilla.esquema.map(c => c.id).filter(Boolean));
        const merged = { ...base };
        // Si postulación guardó en datosFormulario, ya está mezclado en getRespuestasAlumno
        const out = {};
        for (const [k, v] of Object.entries(merged)) {
            if (permitido.has(k)) out[k] = v;
        }
        return out;
    };

    // Lógica para enviar el formulario completado
    const handleFormSubmit = async (respuestas) => {
        try {
            setProcesando(true);

            if (modoEvaluacion) {
                await enviarEvaluacionEmpresa(token, respuestas);
                await showSuccessAlert(
                    '¡Evaluación enviada!',
                    'Gracias. El coordinador revisará la evaluación y cerrará la práctica.'
                );
                // Actualizar estado local y salir del modo evaluación
                setData(prev => ({ ...prev, estado: 'evaluada' }));
                setModoEvaluacion(false);
                // Redirigir al portal de empresa (mismo acceso con token)
                navigate(`/empresa/acceso/${token}`);
            } else {
                await confirmarInicioPractica(token, true, respuestas);
                await showSuccessAlert(
                    '¡Enviado!',
                    'Los datos han sido enviados al Coordinador para su validación.'
                );
                setData(prev => ({
                    ...prev,
                    estado: 'pendiente_validacion'
                }));
            }

            window.scrollTo(0, 0);

        } catch (err) {
            console.error(err);

            showErrorAlert(
                'Error',
                err.message || 'Error al guardar los datos.'
            );

        } finally {
            setProcesando(false);
        }
    };

    // para cerrar sesión y volver a la página de login
    const handleCerrarSesion = () => navigate('/auth');

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-16 h-16 text-blue-700 animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        </div>
    );

    // Determinamos qué mostrar según el estado
    const { alumnoNombre, empresaNombre, estado } = data;
    
    // Estados Clave
    const esModoEdicion = (estado === 'enviada_a_empresa' || estado === 'rechazada') && !modoEvaluacion;
    const esPendienteValidacion = estado === 'pendiente_validacion';
    const esEnCurso = estado === 'en_curso';
    const esFinalizada = estado === 'finalizada' || modoEvaluacion;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Building2 className="text-blue-600" size={28} />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Portal Empresa</h1>
                            <p className="text-xs text-gray-500">{empresaNombre}</p>
                        </div>
                    </div>
                    
                    {/* Botones de acción en el header */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setChatAbierto(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow"
                        >
                            <MessageCircle size={18} />
                            <span>Mensajes</span>
                        </button>
                        
                        <button 
                            onClick={handleCerrarSesion} 
                            className="text-gray-500 hover:text-red-600 flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <LogOut size={16} /> Salir
                        </button>
                    </div>
                </div>
            </header>          

            <main className="max-w-4xl mx-auto px-4 mt-8">
                
                {/* 1. FICHA DEL ALUMNO (Siempre visible) */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <User className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Solicitud de: {alumnoNombre}</h2>
                        <p className="text-gray-500 text-sm">
                            Estado actual: <span className="font-semibold text-blue-600 uppercase">{estado.replace(/_/g, ' ')}</span>
                        </p>
                    </div>
                </div>

                {/* 2. AREA DE ACCIÓN (Cambia según estado) */}

                {/* CASO A: MODO EDICIÓN (Llenar Formulario) */}
                {esModoEdicion && (
                    <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                        <div className="bg-blue-600 p-4 text-white">
                            <h3 className="font-bold flex items-center gap-2">
                                <FileText size={20} /> Completar Datos de Práctica
                            </h3>
                            <p className="text-blue-100 text-sm mt-1">Por favor complete los datos requeridos para formalizar la solicitud.</p>
                        </div>
                        
                        <div className="p-6">
                            {plantilla ? (
                                <FormRender 
                                    esquema={plantilla.esquema} 
                                    
                                    //  2. AQUÍ USAMOS LA NUEVA FUNCIÓN
                                    // Antes decíamos: respuestasIniciales={data.datos || {}}
                                    respuestasIniciales={getRespuestasAlumno()} 
                                    
                                    onSubmit={handleFormSubmit}
                                    buttonText={procesando ? "Enviando..." : "Enviar a Validación"}
                                    userType="empresa" 
                                />
                            ) : (
                                <p className="text-center py-8 text-gray-500">Cargando formulario...</p>
                            )}
                        </div>
                    </div>
                )}

                {/* CASO B: ESPERANDO VALIDACIÓN (Bloqueado) */}
                {esPendienteValidacion && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                        <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-yellow-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-yellow-800 mb-2">Solicitud Enviada</h3>
                        <p className="text-yellow-700 max-w-md mx-auto">
                            Hemos recibido sus datos. La solicitud está siendo revisada por el Coordinador de Prácticas de la universidad.
                        </p>
                        <p className="text-sm text-yellow-600 mt-4 font-medium">Le notificaremos cuando sea aprobada.</p>
                    </div>
                )}

                {/* CASO C: APROBADA / EN CURSO (Panel de Evaluación) */}
                {esEnCurso && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ClipboardList className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-green-800 mb-2">Práctica En Curso</h3>
                        <p className="text-green-700 mb-6">
                            El alumno está activo. Al finalizar el periodo, podrá realizar su evaluación aquí.
                        </p>
                        <button 
                        onClick={() => setModoEvaluacion(true)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">
                            Realizar Evaluación de Desempeño
                        </button>
                    </div>
                )}

                {/* CASO D: EVALUACIÓN (Formulario) */}
                {(esFinalizada && plantilla && modoEvaluacion) && (
                    <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden mt-6">
                        <div className="bg-green-600 p-4 text-white">
                            <h3 className="font-bold flex items-center gap-2">
                                <ClipboardList size={20} /> Evaluación de Desempeño
                            </h3>
                            <p className="text-green-100 text-sm mt-1">Complete la evaluación del alumno.</p>
                        </div>
                        <div className="p-6">
                            <FormRender 
                            esquema={plantilla.esquema}
                            respuestasIniciales={getEvaluacionInicial()}
                            onSubmit={handleFormSubmit}
                            buttonText={procesando ? "Enviando..." : "Enviar Evaluación"}
                            userType="empresa"
                            />
                        </div>
                    </div>
                )}
                    {/* Modal de Chat */}
                {chatAbierto && data && (
                    <ChatMensajeria
                        practicaId={data.practicaId}
                        token={token}
                        destinatarioId={data.coordinadorId}
                        usuarioActual={{ 
                            id: data.empresaId || 'empresa', 
                            name: empresaNombre,
                            email: data.empresaCorreo
                        }}
                        onClose={() => setChatAbierto(false)}
                    />
                )}
            </main>
        </div>
    );
};

export default Access;