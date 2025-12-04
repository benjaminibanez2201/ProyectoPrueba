import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { CheckCircle, XCircle, Clock, Building2, User, Calendar } from 'lucide-react';
import { showErrorAlert, showSuccessAlert } from '../helpers/sweetAlert';
=======
import { CheckCircle, XCircle, Clock, Building2, User, Calendar, Eye, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import instance from '../services/root.service'; // Usamos tu instancia configurada
import FormRender from '../components/FormRender'; // El visor del formulario
>>>>>>> origin/dev3

const AprobarPracticas = () => {
    const [practicas, setPracticas] = useState([]);
    const [loading, setLoading] = useState(true);
<<<<<<< HEAD
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
=======
    
    // Estados para el Modal de Revisión
    const [modalOpen, setModalOpen] = useState(false);
    const [seleccionada, setSeleccionada] = useState(null);
    const [plantilla, setPlantilla] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            // 1. Cargamos la plantilla para el FormRender
            // Ajusta la ruta si es necesario, pero debería ser esta
            const resPlantilla = await instance.get('/formularios/plantilla/postulacion');
            setPlantilla(resPlantilla.data.data);

            // 2. Cargamos las prácticas pendientes usando NUESTRO controlador
            const resPracticas = await instance.get('/coordinador/pendientes');
            setPracticas(resPracticas.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DEL FORMULARIO ---
const getRespuestasDePractica = (practica) => {
        if (!practica || !practica.formularioRespuestas) return {};
        
        const respuesta = practica.formularioRespuestas.find(r => r.plantilla?.tipo === 'postulacion') || practica.formularioRespuestas[0];
        
        if (!respuesta || !respuesta.datos) return {};
        
        // --- LA MAGIA DE APLANAR ---
        // Sacamos 'datosFormulario' aparte, y dejamos el resto (datos empresa) en 'restoDatos'
        const { datosFormulario, ...restoDatos } = respuesta.datos;
        
        // Mezclamos todo en un solo nivel
        const datosUnificados = { 
            ...(datosFormulario || {}), // Datos del Alumno sacados de la caja
            ...restoDatos               // Datos de la Empresa
        };

        console.log("✅ Datos Unificados para FormRender:", datosUnificados);
        return datosUnificados;
    };

    const handleRevisar = (practica) => {
        setSeleccionada(practica);
        setModalOpen(true);
    };

    // --- LÓGICA DE APROBACIÓN/RECHAZO ---
const handleDecision = async (decision) => {
        const esAprobar = decision === 'aprobar';
        let observaciones = '';
        let destinatario = null; // Variable nueva para guardar a quién culpar

        if (!esAprobar) {
            // 👇 CAMBIO 1: SweetAlert con HTML personalizado (Radios + Textarea)
            const { value: formValues } = await Swal.fire({
                title: 'Rechazar Solicitud',
                html: `
                    <p style="margin-bottom:10px; text-align:left; font-size: 0.9em; color:#555;">Indique el motivo y quién debe corregir:</p>
                    
                    <textarea id="swal-input1" class="swal2-textarea" placeholder="Escriba aquí las observaciones..." style="margin: 0 0 15px 0; width: 100%;"></textarea>
                    
                    <div style="text-align: left; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <label style="display:block; margin-bottom:8px; font-weight:bold; font-size:0.9em; color:#374151;">¿A quién notificar el error?</label>
                        
                        <label style="display:flex; align-items:center; margin-bottom:6px; cursor:pointer;">
                            <input type="radio" name="destinatario" value="alumno" checked style="margin-right:8px;"> 
                            <span style="font-size:0.9em;">Alumno (Datos personales, documentos)</span>
                        </label>
                        
                        <label style="display:flex; align-items:center; margin-bottom:6px; cursor:pointer;">
                            <input type="radio" name="destinatario" value="empresa" style="margin-right:8px;"> 
                            <span style="font-size:0.9em;">Empresa (Datos supervisor, funciones)</span>
                        </label>
                        
                        <label style="display:flex; align-items:center; cursor:pointer;">
                            <input type="radio" name="destinatario" value="ambos" style="margin-right:8px;"> 
                            <span style="font-size:0.9em;">Ambos (Error general)</span>
                        </label>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Rechazar',
                preConfirm: () => {
                    // Recuperamos los valores del HTML inyectado
                    const motivo = document.getElementById('swal-input1').value;
                    const radio = document.querySelector('input[name="destinatario"]:checked');
                    
                    if (!motivo) {
                        Swal.showValidationMessage('¡Debes escribir una observación!');
                        return false;
                    }
                    return { motivo: motivo, destinatario: radio.value };
                }
            });

            if (!formValues) return; // Si cancela, no hacemos nada
            observaciones = formValues.motivo;
            destinatario = formValues.destinatario;

        } else {
            // Aprobación Normal
            const result = await Swal.fire({
                title: '¿Aprobar Práctica?',
                text: "El alumno pasará a estado 'En Curso'. Se enviará correo de notificación.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, Aprobar',
                confirmButtonColor: '#3085d6'
            });
            if (!result.isConfirmed) return;
        }

        // Llamada al Backend (Controller Coordinador)
        try {
            await instance.put(`/coordinador/evaluar/${seleccionada.id}`, { 
                decision, 
                observaciones,
                destinatario // 👇 CAMBIO 2: Enviamos el destinatario al backend
            });
            
            Swal.fire('¡Listo!', `Solicitud ${esAprobar ? 'aprobada' : 'rechazada'} exitosamente.`, 'success');
            setModalOpen(false);
            cargarDatos(); // Recargar lista
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo procesar la solicitud.', 'error');
        }
    };
>>>>>>> origin/dev3

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
<<<<<<< HEAD
                <p className="text-gray-700 text-xl">Cargando prácticas pendientes...</p>
=======
                <p className="text-gray-700 text-xl animate-pulse">Cargando solicitudes...</p>
>>>>>>> origin/dev3
            </div>
        );
    }

    return (
<<<<<<< HEAD
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-blue-700">Portal de Prácticas - Coordinador</h1>
                </div>
            </header>

            {/* Contenido */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
=======
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 pb-12">
            {/* Header */}
            <header className="bg-white shadow-sm mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                        <FileText /> Portal de Prácticas - Coordinador
                    </h1>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
>>>>>>> origin/dev3
                <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                    <h2 className="text-3xl font-bold text-green-800 mb-2">
                        Gestionar Inicio de Prácticas
                    </h2>
                    <p className="text-gray-600">
<<<<<<< HEAD
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
=======
                        Revisa los formularios firmados por Alumno y Empresa antes de dar el inicio oficial.
                    </p>
                </div>

                {/* Lista de prácticas */}
                {practicas.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay prácticas pendientes</h3>
                        <p className="text-gray-500">Todas las confirmaciones han sido procesadas.</p>
>>>>>>> origin/dev3
                    </div>
                ) : (
                    <div className="space-y-6">
                        {practicas.map((practica) => (
<<<<<<< HEAD
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
=======
                            <div key={practica.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition">
                                
                                {/* Banner Amarillo */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Clock className="w-6 h-6 text-yellow-600 mr-3" />
                                        <div>
                                            <p className="font-semibold text-yellow-800">Confirmación Recibida</p>
                                            <p className="text-yellow-700 text-sm">
                                                Fecha: {new Date(practica.fecha_actualizacion).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">ID: {practica.id}</span>
                                </div>

                                {/* Grilla de Datos */}
>>>>>>> origin/dev3
                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <User className="w-5 h-5 text-blue-600 mr-2" />
                                            <h4 className="font-semibold text-gray-700">Alumno</h4>
                                        </div>
<<<<<<< HEAD
                                        <p className="text-lg font-bold text-gray-800">{practica.alumnoNombre}</p>
                                        <p className="text-sm text-gray-600">{practica.alumnoEmail}</p>
=======
                                        <p className="text-lg font-bold text-gray-800">{practica.student?.name}</p>
                                        <p className="text-sm text-gray-600">{practica.student?.email}</p>
>>>>>>> origin/dev3
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <Building2 className="w-5 h-5 text-green-600 mr-2" />
                                            <h4 className="font-semibold text-gray-700">Empresa</h4>
                                        </div>
<<<<<<< HEAD
                                        <p className="text-lg font-bold text-gray-800">{practica.empresaNombre}</p>
                                        <p className="text-sm text-gray-600">{practica.empresaCorreo}</p>
=======
                                        <p className="text-lg font-bold text-gray-800">{practica.empresaToken?.empresaNombre}</p>
                                        <p className="text-sm text-gray-600">{practica.empresaToken?.empresaCorreo}</p>
>>>>>>> origin/dev3
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
<<<<<<< HEAD
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
=======
                                            <h4 className="font-semibold text-gray-700">Estado</h4>
                                        </div>
                                        <p className="text-lg font-bold text-gray-800 capitalize">{practica.estado.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                {/* Botón Único: Revisar */}
                                <button 
                                    onClick={() => handleRevisar(practica)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-md"
                                >
                                    <Eye size={20} /> Revisar Formulario y Evaluar
                                </button>
>>>>>>> origin/dev3
                            </div>
                        ))}
                    </div>
                )}
            </main>
<<<<<<< HEAD
=======

            {/* --- MODAL DE REVISIÓN Y APROBACIÓN --- */}
            {modalOpen && seleccionada && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Evaluación de Solicitud</h3>
                                <p className="text-sm text-gray-500">Revisa los datos antes de aprobar.</p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition">✕</button>
                        </div>

                        {/* Modal Content (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                            {plantilla ? (
                                <FormRender 
                                    esquema={plantilla.esquema}
                                    respuestasIniciales={getRespuestasDePractica(seleccionada)}
                                    readOnly={true} // Bloqueado para edición
                                    userType="coordinador"
                                />
                            ) : (
                                <div className="text-center py-10">Cargando formulario...</div>
                            )}
                        </div>

                        {/* Modal Footer (Actions) */}
                        <div className="p-4 border-t bg-white flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                            <button 
                                onClick={() => handleDecision('rechazar')}
                                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-bold transition"
                            >
                                <XCircle size={20} /> Rechazar con Observaciones
                            </button>
                            <button 
                                onClick={() => handleDecision('aprobar')}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md hover:shadow-lg transition"
                            >
                                <CheckCircle size={20} /> Aprobar Práctica
                            </button>
                        </div>
                    </div>
                </div>
            )}
>>>>>>> origin/dev3
        </div>
    );
};

export default AprobarPracticas;