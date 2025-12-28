import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import FormRender from "../components/FormRender";
import { getPlantilla } from "../services/formulario.service";
import { ArrowLeft, Download, Loader } from "lucide-react";
import { generatePDF } from "../helpers/pdfGenerator";
import { showSuccessAlert, showErrorAlert } from "../helpers/sweetAlert";

const VistaPrevia = () => {
  const { tipo } = useParams(); // Leemos el tipo desde la URL
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plantilla, setPlantilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const formContainerRef = useRef(null);

  // Función para descargar PDF
  const handleDownloadPDF = async () => {
    if (!formContainerRef.current || !plantilla) return;
    
    setDownloading(true);
    try {
      const cleanFilename = plantilla.titulo
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_áéíóúñ]/gi, '') || 'formulario';

      await generatePDF(formContainerRef.current, cleanFilename);
      
      showSuccessAlert('PDF Generado', `El archivo "${cleanFilename}.pdf" se ha descargado correctamente.`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      showErrorAlert('Error', 'No se pudo generar el PDF. Intenta nuevamente.');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        // Pedimos la plantilla específica (postulacion, bitacora, etc.)
        const data = await getPlantilla(tipo);
        setPlantilla(data);
      } catch (error) {
        console.error("Error cargando vista previa", error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [tipo]);

  // Auto-descarga si viene el parámetro download=true
  useEffect(() => {
    const shouldDownload = searchParams.get("download") === "true";
    if (shouldDownload && plantilla && !loading && formContainerRef.current) {
      // Pequeño delay para asegurar que el DOM esté completamente renderizado
      const timer = setTimeout(() => {
        handleDownloadPDF();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [plantilla, loading, searchParams]);

  if (loading)
    return <div className="p-10 text-center">Cargando vista previa...</div>;
  if (!plantilla)
    return (
      <div className="p-10 text-center text-red-500">
        Formulario no encontrado
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Barra superior con botones */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a Gestión
          </button>

          {/* Botón Descargar PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
          >
            {downloading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download size={18} />
                Descargar PDF
              </>
            )}
          </button>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded shadow-sm">
          <p className="text-yellow-800 font-medium">
            Modo Vista Previa: Así es como verán el formulario los usuarios.
          </p>
        </div>

        {/* Renderizamos el formulario en modo Solo Lectura */}
        <div ref={formContainerRef}>
          <FormRender
            esquema={plantilla.esquema}
            titulo={plantilla.titulo}
            readOnly={true}
            onSubmit={() => {}}
            userType="coordinador"
          />
        </div>
      </div>
    </div>
  );
};

export default VistaPrevia;
