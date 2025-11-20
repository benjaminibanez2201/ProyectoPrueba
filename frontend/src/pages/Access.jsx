import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// CORRECCIÓN: Rutas ajustadas para coincidir con la estructura estándar src/pages/ -> src/services/
import { validarTokenEmpresa, confirmarInicioPractica } from '../services/empresa.service.js';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js'; 
import { CheckCircle, XCircle } from 'lucide-react';

const Access = () => {
    // Obtener el token de los parámetros de la URL
    const { token } = useParams();

    const [data, setData] = useState(null); // Almacenar los detalles de la práctica
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmado, setConfirmado] = useState(false);
    const [estadoPractica, setEstadoPractica] = useState('');

    // Validar el token al cargar el componente
    useEffect(() => {
        if (!token) {
            setError("Error: Token no proporcionado.");
            setLoading(false);
            return;
        }

        const validarAcceso = async () => {
            try {
                // Llama al servicio (GET)
                const response = await validarTokenEmpresa(token);

                // El backend usa handleSuccess, por lo que la data está en response.data
                setData(response.data.data); 

                setEstadoPractica(response.data.data.estadoPractica || 'pendiente');
            } catch (err) {
                // Captura el error del backend (ej. Token inválido/expirado)
                setError(err.message || 'Token inválido o expirado.'); 
            } finally {
                setLoading(false);
            }
        };

        validarAcceso();
    }, [token]);

    // Función para confirmar el inicio de la práctica
    const handleConfirmar = async () => {
        // Validación de estado: solo se confirma si está pendiente
        if (estadoPractica !== 'pendiente') {
            showErrorAlert('Advertencia', 'La práctica ya ha sido iniciada o finalizada.');
            return;
        }

        try {
            setLoading(true);

            // Llama al servicio de confirmación (POST)
            const response = await confirmarInicioPractica(token, true);

            showSuccessAlert("Éxito", response.message);
            setConfirmado(true);
            setEstadoPractica('en_curso');

        } catch (err) {
            showErrorAlert("Error", err.message || 'Error al confirmar el inicio de la práctica.');
            // Usar setError para renderizar el mensaje de error en la pantalla
            setError("Fallo al registrar la confirmación."); 
        } finally {
            setLoading(false);
        }
    };

    // Helper para la consistencia de datos de la UI
    const alumnoNombre = data?.alumnoNombre || "Cargando...";
    const empresaNombre = data?.empresaNombre || "Cargando...";
    const tipoPractica = data?.tipoPractica || "Cargando...";


    // --- Componentes de la UI ---
    
    // Componente de Mensaje
    const StatusMessage = ({ type, message }) => (
        <div className={`p-4 rounded-lg text-white font-semibold flex items-center ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <XCircle size={20} className="mr-2" />}
            {message}
        </div>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <p className="text-gray-700 text-xl animate-pulse">Validando Token y Cargando datos de la Práctica...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <StatusMessage type="error" message={error} />
        </div>
    );

    // Vista principal de confirmación
    return (
        <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
            <div className="bg-white shadow-2xl rounded-xl p-8 max-w-lg w-full space-y-6">
                <h1 className="text-3xl font-bold text-center text-blue-700">
                    Portal de Confirmación de Práctica
                </h1>
                
                {estadoPractica === 'en_curso' || confirmado ? (
                    <StatusMessage type="success" message={`La práctica de ${alumnoNombre} ya está OFICIALMENTE EN CURSO.`} />
                ) : (
                    <>
                        <div className="border border-gray-200 p-4 rounded-lg space-y-2">
                            <p className="text-gray-700"><span className="font-semibold">Empresa:</span> {empresaNombre}</p>
                            <p className="text-gray-700"><span className="font-semibold">Alumno:</span> {alumnoNombre}</p>
                            <p className="text-gray-700"><span className="font-semibold">Tipo de Práctica:</span> {tipoPractica}</p>
                            <p className="text-gray-700"><span className="font-semibold">Estado Actual:</span> Pendiente de su confirmación.</p>
                        </div>

                        <p className="text-gray-600 text-sm">
                            Al presionar "Confirmar Inicio", usted acepta formalmente que la práctica del alumno {alumnoNombre} ha comenzado en su institución y que su estado será cambiado a **"en_curso"** en el sistema.
                        </p>
                        
                        <button 
                            onClick={handleConfirmar}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Confirmando...' : 'Confirmar Inicio de Práctica'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Access;