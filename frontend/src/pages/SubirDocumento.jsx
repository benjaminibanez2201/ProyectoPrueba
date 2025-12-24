import React, { useState, useEffect } from "react";
import { Upload, FileText, ArrowLeft, AlertTriangle } from "lucide-react";
import { uploadDocumento } from "../services/documento.service";
import { showErrorAlert, showSuccessAlert } from "../helpers/sweetAlert";
import { useLocation, useNavigate } from 'react-router-dom'; 
import { getMyPractica } from "../services/practica.service";

const SubirDocumento = () => {
  //estados para manejar el formulario
  const [file, setFile] = useState(null);
  const [tipo, setTipo] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [practica, setPractica] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const initialId = location.state?.practicaId || '';
  const [practicaId, setPracticaId] = useState(initialId);

  // Verificar estado de la práctica al cargar
  useEffect(() => {
    const fetchPractica = async () => {
      try {
        const data = await getMyPractica();
        setPractica(data);
        if (!initialId && data?.id) {
          setPracticaId(data.id);
        }
      } catch (error) {
        console.log("No se pudo cargar la práctica");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPractica();
  }, [initialId]);

  // Verificar si la práctica está cerrada
  const isPracticaCerrada = practica?.estado === 'cerrada';

  //manejo de selccion de archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  //manejo de envio del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar si la práctica está cerrada
    if (isPracticaCerrada) {
      showErrorAlert("Práctica Cerrada", "No puedes subir documentos porque tu práctica ya está cerrada.");
      return;
    }
    
    if (!file) {
      showErrorAlert("Error", "Debes seleccionar un archivo");
      return;
    }
    if (!tipo) {
      showErrorAlert("Error", "Debes seleccionar el tipo de documento");
      return;
    }
    try {
      setIsUploading(true); //indicar que se esta subiendo
      const response = await uploadDocumento(file, tipo, practicaId); //llamar al servicio para subir
      if (response.status === "Success") {
        showSuccessAlert("Éxito", "Documento subido correctamente");
        // Esperamos 2 segundos y volvemos al Dashboard automáticamente
        setTimeout(() => {
          navigate('/panel'); 
        }, 2000);
      } else {
        showErrorAlert(
          "Error",
          response.message || "Error al subir el archivo"
        );
      }
    } catch (error) {
      console.error(error);
      showErrorAlert("Error", "Ocurrió un error inesperado");
    } finally {
      setIsUploading(false); //indicar que ya no se esta subiendo
    }
  };

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex justify-center items-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  // Si la práctica está cerrada, mostrar mensaje de bloqueo
  if (isPracticaCerrada) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex justify-center pt-12 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
            <AlertTriangle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Práctica Cerrada</h2>
          <p className="text-gray-500 text-sm mb-6">
            Tu práctica ya ha sido cerrada. No es posible subir nuevos documentos.
          </p>
          <button 
            onClick={() => navigate('/panel')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Volver al Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100  flex justify-center pt-12 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl border border-gray-100 h-full">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Título e Instrucciones */}
          <div className="md:col-span-1 border-r border-gray-100 pr-4">

            {/*boton de volver*/}
            <div className="mb-4">
               <button 
                 onClick={() => navigate(-1)} // Vuelve atrás
                 className="flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors text-sm font-medium">
                 <ArrowLeft size={20} />
                 <span>Volver</span>
               </button>
            </div>
            
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Upload className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Subir Documento</h2>
            <p className="text-gray-500 text-sm mb-4">
              Sube aquí tus evidencias, informes finales o currículum.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800">
              <strong>Nota:</strong> Asegúrate de que el archivo no pese más de 10MB y esté en formato PDF o Word.
            </div>
          </div>

          {/* Columna Derecha: El Formulario (ocupa 2 espacios) */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* --- SELECCIÓN DE TIPO --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white"
                  required
                >
                  <option value="" disabled>Selecciona una opción...</option>
                  <option value="Informe">Informe Final</option>
                  <option value="Curriculum">Currículum</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* --- INPUT DE ARCHIVO --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Archivo</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition cursor-pointer relative">
                  <div className="space-y-1 text-center">
                    
                    {file ? (
                      <div className="flex flex-col items-center">
                        <FileText className="mx-auto h-12 w-12 text-green-500" />
                        <p className="text-sm text-gray-600 mt-2 font-medium">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <span className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-blue-500 focus-within:outline-none">
                            <span>Sube un archivo</span>
                          </span>
                          <p className="pl-1">o arrástralo aquí</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOCX, ZIP hasta 10MB</p>
                      </>
                    )}

                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.zip"
                    />
                  </div>
                </div>
              </div>

              {/* --- BOTÓN DE SUBIR --- */}
              <div className="flex justify-end"> {/* Alineamos el botón a la derecha */}
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                    ${isUploading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}
                    transition-all duration-300`}
                >
                  {isUploading ? 'Subiendo...' : 'Subir Documento'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SubirDocumento;