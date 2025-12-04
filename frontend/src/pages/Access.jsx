import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validarTokenEmpresa, confirmarInicioPractica } from '../services/empresa.service.js';
import { getPlantilla } from '../services/formulario.service.js'; // 1. Traer la plantilla
import FormRender from '../components/FormRender'; // 2. Traer tu componente estrella
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js'; 
<<<<<<< HEAD
import { CheckCircle, XCircle, Loader2, Building2, User, Briefcase, Clock, LogOut } from 'lucide-react';
=======
import { CheckCircle, XCircle, Loader2, Building2, User, LogOut, FileText, ClipboardList, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
>>>>>>> origin/dev3

const Access = () => {
    const { token } = useParams();
    const navigate = useNavigate();

<<<<<<< HEAD
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmado, setConfirmado] = useState(false);
    const [procesando, setProcesando] = useState(false);

    const handleCerrarSesion = () => {
        navigate('/auth');
    };

=======
    // Estados de Datos
    const [data, setData] = useState(null);
    const [plantilla, setPlantilla] = useState(null); // Para guardar las preguntas
    
    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [procesando, setProcesando] = useState(false);

    // Lógica de Carga Inicial
>>>>>>> origin/dev3
    useEffect(() => {
        if (!token) {
            setError("Error: Token no proporcionado.");
            setLoading(false);
            return;
        }

        const cargarTodo = async () => {
            try {
<<<<<<< HEAD
=======
                // A. Validar Token y traer datos de la práctica
>>>>>>> origin/dev3
                const response = await validarTokenEmpresa(token);
                if (!response?.data) throw new Error('Datos inválidos del servidor');
                setData(response.data);

<<<<<<< HEAD
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
=======
                // B. Cargar la Plantilla del Formulario (Ej: "postulacion")
                // Asumimos que la empresa debe llenar la parte de "postulacion"
                // OJO: Podrías necesitar un endpoint que te diga QUÉ plantilla cargar.
                // Por ahora usamos 'postulacion' por defecto.
                const plantillaData = await getPlantilla('postulacion');
                setPlantilla(plantillaData);

            } catch (err) {
                console.error('Error de carga:', err);
>>>>>>> origin/dev3
                setError(err.message || 'Token inválido o expirado.');
            } finally {
                setLoading(false);
            }
        };

        cargarTodo();
    }, [token]);

<<<<<<< HEAD
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
=======
    // 👇 1. AGREGAMOS ESTA FUNCIÓN AUXILIAR
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

        // 👇 LA CORRECCIÓN MÁGICA
        // Si los datos están escondidos dentro de "datosFormulario", los sacamos hacia afuera.
        if (misDatos && misDatos.datosFormulario) {
            return { ...misDatos, ...misDatos.datosFormulario };
        }

        return misDatos || {};
    };

    // Lógica para enviar el formulario completado
const handleFormSubmit = async (respuestas) => {
        try {
            setProcesando(true);

            // 1. Enviamos al backend (Tu servicio ya funciona, confirmado por el log)
            await confirmarInicioPractica(token, true, respuestas);

            // 2. ÉXITO: Mostramos alerta y ACTUALIZAMOS ESTADO LOCAL
            // No navegamos, no recargamos. Solo cambiamos la variable 'estado'.
            await Swal.fire({
                title: '¡Enviado!',
                text: 'Los datos han sido enviados al Coordinador para su validación.',
                icon: 'success',
                confirmButtonText: 'Entendido'
            });
            
            // 3. Esto hace que React renderice la tarjeta amarilla automáticamente
            setData(prev => ({ 
                ...prev, 
                estado: 'pendiente_validacion' // Forzamos el cambio visual
            }));

            // Opcional: Scrollear arriba para que vean el mensaje
            window.scrollTo(0, 0);

        } catch (err) {
            console.error(err);
            Swal.fire("Error", err.message || 'Error al guardar los datos.', "error");
>>>>>>> origin/dev3
        } finally {
            setProcesando(false);
        }
    };

<<<<<<< HEAD
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
=======
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
    const esModoEdicion = estado === 'enviada_a_empresa' || estado === 'rechazada';
    const esPendienteValidacion = estado === 'pendiente_validacion';
    const esEnCurso = estado === 'en_curso';

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
                    <button onClick={handleCerrarSesion} className="text-gray-500 hover:text-red-600 flex items-center gap-2 text-sm font-medium transition-colors">
                        <LogOut size={16} /> Salir
                    </button>
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
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">
                            Realizar Evaluación de Desempeño
                        </button>
                    </div>
                )}

>>>>>>> origin/dev3
            </main>
        </div>
    );
};

export default Access;