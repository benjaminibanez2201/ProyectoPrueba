import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRespuesta } from '../services/formulario.service';
import FormRender from '../components/FormRender';
import { Loader2, ArrowLeft, FileText, Download } from 'lucide-react';
import { showErrorAlert } from '../helpers/sweetAlert';
import html2pdf from 'html2pdf.js';

const VistaPreviaAlumno = () => {
    const { id } = useParams(); // Obtenemos el ID de la URL
    const navigate = useNavigate();

    const [respuesta, setRespuesta] = useState(null);
    const [loading, setLoading] = useState(true);

    const contentRef = useRef();// Referencia al contenido para PDF

    useEffect(() => {
        const cargarRespuesta = async () => {
            try {
                // Llamamos al servicio que creamos antes
                const data = await getRespuesta(id);
                setRespuesta(data);
            } catch (error) {
                console.error(error);
                showErrorAlert("Error", "No se pudo cargar el formulario.");
                navigate('/panel');
            } finally {
                setLoading(false);
            }
        };
        cargarRespuesta();
    }, [id, navigate]);

    const handleDescargarPDF = () => {
        const element = contentRef.current; // Seleccionamos el div del formulario
        const opt = {
            margin:       10, // Márgenes en mm
            filename:     `Documento_${respuesta.plantilla?.tipo || 'formulario'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true}, // Mejor calidad (evita que se vea borroso)
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Ejecutar la conversión
        html2pdf().set(opt).from(element).save();
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
    );

    if (!respuesta) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header simple */}
            <div className="bg-white shadow-sm py-4 px-6 mb-8 flex items-center relative">
                <button 
                    onClick={() => navigate(-1)} // Volver atrás
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition z-10"
                >
                    <ArrowLeft size={20} /> Volver
                </button>
                <h1 className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xl font-bold text-gray-800">
                    <FileText className="text-blue-600" /> 
                    Revisión de {respuesta.plantilla?.titulo || "Formulario"}
                </h1>
                <button 
                    onClick={handleDescargarPDF}
                    className="absolute right-6 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm z-10 text-sm font-medium"
                >
                    <Download size={18} /> Descargar PDF
                </button>
            </div>

            <main className="max-w-4xl mx-auto px-4">

                <div  ref={contentRef}> 
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 pointer-events-none opacity-100">
                        <FormRender 
                            esquema={respuesta.plantilla.esquema}
                            valores={respuesta.datos} 
                            respuestasIniciales={respuesta.datos}
                            buttonText="" // Ocultamos el botón de guardar para el PDF
                            onSubmit={() => {}} 
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VistaPreviaAlumno;