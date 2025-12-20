import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Loader2, Mail, Clock, CheckCheck } from 'lucide-react';
import { getConversacionPractica, getConversacionPracticaConToken, enviarMensaje, marcarComoLeido } from '../services/mensaje.service.js'; // ← Importar ambas funciones
import { showErrorAlert, showSuccessAlert } from '../helpers/sweetAlert.js';

const ChatMensajeria = ({ practicaId, token, destinatarioId, usuarioActual, onClose }) => {
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [nuevoMensaje, setNuevoMensaje] = useState({ asunto: '', contenido: '' });
    
    const mensajesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        cargarConversacion();
    }, [practicaId]);

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    const scrollToBottom = () => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const cargarConversacion = async () => {
        try {
            setLoading(true);
            console.log('🔍 Cargando conversación...', { practicaId, tieneToken: !!token });
            
            let response;
            
            if (token) {
                // Empresa con token
                console.log('👔 Cargando como empresa con token');
                response = await getConversacionPracticaConToken(practicaId, token);
            } else {
                // Coordinador autenticado
                console.log('👨‍💼 Cargando como coordinador');
                response = await getConversacionPractica(practicaId);
            }
            
            console.log('✅ Conversación cargada:', response);
            
            const mensajesData = response.data || [];
            setMensajes(mensajesData);

            // Marcar como leídos los mensajes recibidos
            for (const msg of mensajesData) {
                if (msg.destinatario?.id === usuarioActual.id && !msg.leido) {
                    try {
                        await marcarComoLeido(msg.id);
                    } catch (error) {
                        console.error('Error al marcar como leído:', error);
                    }
                }
            }

        } catch (error) {
            console.error('❌ Error al cargar conversación:', error);
            console.error('❌ Detalles:', error.response?.data);
            showErrorAlert('Error', error.message || 'No se pudo cargar la conversación');
        } finally {
            setLoading(false);
        }
    };

    const handleEnviar = async (e) => {
        e.preventDefault();

        if (!nuevoMensaje.asunto.trim() || !nuevoMensaje.contenido.trim()) {
            showErrorAlert('Error', 'Por favor complete asunto y mensaje');
            return;
        }

        try {
            setEnviando(true);
            console.log('📤 Enviando mensaje...', { practicaId, destinatarioId, tieneToken: !!token });

            const data = {
                asunto: nuevoMensaje.asunto,
                contenido: nuevoMensaje.contenido,
                practicaId,
                destinatarioId
            };

            // Si es empresa, incluir el token
            if (token) {
                data.token = token;
            }

            const response = await enviarMensaje(data);
            console.log('✅ Mensaje enviado:', response);
            
            // Agregar el nuevo mensaje a la lista
            setMensajes(prev => [...prev, response.data]);
            
            // Limpiar formulario
            setNuevoMensaje({ asunto: '', contenido: '' });
            
            showSuccessAlert('¡Enviado!', 'Mensaje enviado correctamente');

        } catch (error) {
            console.error('❌ Error al enviar:', error);
            console.error('❌ Detalles:', error.response?.data);
            showErrorAlert('Error', error.message);
        } finally {
            setEnviando(false);
        }
    };

    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);

        if (date.toDateString() === hoy.toDateString()) {
            return `Hoy ${date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === ayer.toDateString()) {
            return `Ayer ${date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('es-CL', { 
                day: '2-digit', 
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-2xl flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-full">
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Mensajería</h3>
                            <p className="text-xs text-blue-100">Comunicación sobre la práctica</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Área de Mensajes */}
                <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                >
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : mensajes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Mail size={64} className="mb-4 opacity-30" />
                            <p className="text-lg font-medium">No hay mensajes aún</p>
                            <p className="text-sm">Inicia la conversación enviando un mensaje</p>
                        </div>
                    ) : (
                        mensajes.map((msg) => {
                            const esMio = msg.remitente?.id === usuarioActual.id;
                            
                            return (
                                <div 
                                    key={msg.id} 
                                    className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] ${esMio ? 'order-2' : 'order-1'}`}>
                                        <p className={`text-xs font-semibold mb-1 ${esMio ? 'text-right text-blue-600' : 'text-gray-600'}`}>
                                            {esMio ? 'Tú' : msg.remitente?.name || 'Desconocido'}
                                        </p>
                                        
                                        <div 
                                            className={`rounded-2xl p-4 shadow-sm ${
                                                esMio 
                                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                            }`}
                                        >
                                            <p className={`font-semibold text-sm mb-2 ${esMio ? 'text-blue-100' : 'text-gray-700'}`}>
                                                {msg.asunto}
                                            </p>
                                            <p className="text-sm whitespace-pre-wrap">
                                                {msg.contenido}
                                            </p>
                                            
                                            <div className={`flex items-center gap-2 mt-2 text-xs ${esMio ? 'text-blue-100' : 'text-gray-500'}`}>
                                                <Clock size={12} />
                                                <span>{formatearFecha(msg.fecha_envio)}</span>
                                                {esMio && msg.leido && (
                                                    <CheckCheck size={14} className="text-blue-200" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={mensajesEndRef} />
                </div>

                {/* Formulario de Envío */}
                <form onSubmit={handleEnviar} className="p-4 bg-white border-t border-gray-200">
                    <div className="mb-3">
                        <input
                            type="text"
                            placeholder="Asunto del mensaje"
                            value={nuevoMensaje.asunto}
                            onChange={(e) => setNuevoMensaje(prev => ({ ...prev, asunto: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            disabled={enviando}
                            maxLength={200}
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <textarea
                            placeholder="Escribe tu mensaje aquí..."
                            value={nuevoMensaje.contenido}
                            onChange={(e) => setNuevoMensaje(prev => ({ ...prev, contenido: e.target.value }))}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                            rows="3"
                            disabled={enviando}
                            maxLength={2000}
                        />
                        
                        <button
                            type="submit"
                            disabled={enviando || !nuevoMensaje.asunto.trim() || !nuevoMensaje.contenido.trim()}
                            className="self-end bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium shadow-lg shadow-blue-200"
                        >
                            {enviando ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Enviar
                                </>
                            )}
                        </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                        {nuevoMensaje.contenido.length}/2000 caracteres
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ChatMensajeria;