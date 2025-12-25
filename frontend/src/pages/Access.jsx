import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validarTokenEmpresa, confirmarInicioPractica, enviarEvaluacionEmpresa, getFormularioEmpresa } from '../services/empresa.service.js';
import { getPlantilla } from '../services/formulario.service.js'; // 1. Traer la plantilla
import FormRender from '../components/FormRender'; // 2. Traer tu componente estrella
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js'; 
import { CheckCircle, XCircle, Loader2, Building2, User, LogOut, FileText, ClipboardList, Clock, MessageCircle, Download, Eye } from 'lucide-react';
import ChatMensajeria from '../components/ChatMensajeria';
import html2pdf from 'html2pdf.js';

const Access = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    // Estados de Datos
    const [data, setData] = useState(null);
    const [plantilla, setPlantilla] = useState(null); // Para guardar las preguntas
    const [modoEvaluacion, setModoEvaluacion] = useState(false);
    const [formulariosDisponibles, setFormulariosDisponibles] = useState([]); // Formularios para descargar
    const [formularioVisualizando, setFormularioVisualizando] = useState(null); // Formulario actual en vista
    
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

                // Cargar formularios disponibles para descarga (postulación y evaluación)
                try {
                    const formulariosRes = await getFormularioEmpresa(token);
                    if (formulariosRes?.data?.formularios) {
                        setFormulariosDisponibles(formulariosRes.data.formularios);
                    }
                } catch (e) {
                    console.warn('No se pudieron cargar formularios:', e);
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

    //  1. AGREGAMOS ESTA FUNCIÓN AUXILIAR
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

        //  LA CORRECCIÓN MÁGICA
        // Si los datos están escondidos dentro de "datosFormulario", los sacamos hacia afuera.
        if (misDatos && misDatos.datosFormulario) {
            return { ...misDatos, ...misDatos.datosFormulario };
        }

        return misDatos || {};
    };

    // Prefill evaluación con datos de postulación
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

    // Función para recargar los formularios disponibles
    const recargarFormularios = async () => {
        try {
            const formulariosRes = await getFormularioEmpresa(token);
            if (formulariosRes?.data?.formularios) {
                setFormulariosDisponibles(formulariosRes.data.formularios);
            }
        } catch (e) {
            console.warn('No se pudieron recargar formularios:', e);
        }
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
            // Recargar los formularios para que aparezca la evaluación recién enviada
            await recargarFormularios();
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

    // Función para ver formulario completo
    const handleVerFormulario = async (tipo) => {
        try {
            const response = await getFormularioEmpresa(token, tipo);
            if (response?.data) {
                setFormularioVisualizando({
                    ...response.data,
                    tipo
                });
            }
        } catch (err) {
            showErrorAlert('Error', 'No se pudo cargar el formulario.');
        }
    };

    // Función para descargar PDF del formulario
    const handleDescargarPDF = async () => {
        const element = document.getElementById('formulario-preview-content');
        if (!element) return;

        const nombreTipo = {
            'postulacion': 'Formulario_Postulacion',
            'evaluacion_pr1': 'Evaluacion_Profesional_I',
            'evaluacion_pr2': 'Evaluacion_Profesional_II'
        };

        const opt = {
            margin: [10, 10, 10, 10],
            filename: `${nombreTipo[formularioVisualizando?.tipo] || 'Formulario'}_${data?.alumnoNombre || 'Alumno'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                allowTaint: true, 
                logging: false,
                backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        await html2pdf().set(opt).from(element).save();
    };

    // Nombre legible de formulario
    const getNombreFormulario = (tipo) => {
        const nombres = {
            'postulacion': 'Formulario de Postulación',
            'evaluacion_pr1': 'Evaluación Profesional I',
            'evaluacion_pr2': 'Evaluación Profesional II'
        };
        return nombres[tipo] || tipo;
    };

    const handleCerrarSesion = () => navigate('/auth');

    // --- RENDERIZADO ---

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
    const esEvaluada = estado === 'evaluada' || estado === 'cerrada';

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

                {/* CASO E: EVALUADA / CERRADA (Mostrar resumen) */}
                {esEvaluada && !modoEvaluacion && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-8 text-center mb-6">
                        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-purple-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-purple-800 mb-2">
                            {estado === 'cerrada' ? 'Práctica Cerrada' : 'Evaluación Completada'}
                        </h3>
                        <p className="text-purple-700 max-w-md mx-auto">
                            {estado === 'cerrada' 
                                ? 'Esta práctica ha sido cerrada oficialmente. Gracias por su participación.'
                                : 'La evaluación ha sido enviada correctamente. El coordinador procesará el cierre de la práctica.'
                            }
                        </p>
                    </div>
                )}

                {/* SECCIÓN DE FORMULARIOS PARA DESCARGAR */}
                {formulariosDisponibles.length > 0 && !modoEvaluacion && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6">
                        <div className="bg-indigo-600 p-4 text-white">
                            <h3 className="font-bold flex items-center gap-2">
                                <FileText size={20} /> Documentos de la Práctica
                            </h3>
                            <p className="text-indigo-100 text-sm mt-1">
                                Puede visualizar y descargar los formularios completados.
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-3">
                                {formulariosDisponibles.map((form) => (
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
                                                    Enviado: {form.fechaEnvio ? new Date(form.fechaEnvio).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleVerFormulario(form.tipo)}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition"
                                        >
                                            <Eye size={16} />
                                            Ver / Descargar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL PARA VISUALIZAR Y DESCARGAR FORMULARIO */}
                {formularioVisualizando && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                            {/* Header del Modal */}
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {getNombreFormulario(formularioVisualizando.tipo)}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Alumno: {data?.alumnoNombre}
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
                                        <XCircle size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Contenido del Formulario */}
                            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                                <div id="formulario-preview-content" className="bg-white rounded-lg p-6 shadow">
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

                    {/* ← NUEVO: Modal de Chat */}
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