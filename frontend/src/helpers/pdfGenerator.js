import html2pdf from 'html2pdf.js';

/**
 * Genera un PDF a partir de un elemento HTML
 * @param {HTMLElement} element - El elemento DOM a convertir en PDF
 * @param {string} filename - Nombre del archivo PDF (sin extensión)
 * @param {Object} options - Opciones adicionales para html2pdf
 */
export const generatePDF = async (element, filename = 'documento', options = {}) => {
  const defaultOptions = {
    margin: [10, 10, 10, 10],
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      letterRendering: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    await html2pdf().set(finalOptions).from(element).save();
    return true;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw error;
  }
};

/**
 * Genera un PDF del formulario actual en pantalla
 * @param {string} containerId - ID del contenedor del formulario
 * @param {string} titulo - Título para el nombre del archivo
 */
export const downloadFormularioPDF = async (containerId, titulo = 'formulario') => {
  const element = document.getElementById(containerId);
  
  if (!element) {
    throw new Error('No se encontró el elemento del formulario');
  }

  // Limpiar el nombre del archivo
  const cleanFilename = titulo
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  await generatePDF(element, cleanFilename);
};

/**
 * Genera PDF de una vista previa del formulario (para coordinador/alumno)
 * Crea un contenedor temporal con estilos optimizados para PDF
 */
export const generateFormPreviewPDF = async (formElement, titulo = 'formulario') => {
  // Crear un clon del elemento para no afectar el DOM original
  const clone = formElement.cloneNode(true);
  
  // Aplicar estilos específicos para impresión
  clone.style.padding = '20px';
  clone.style.backgroundColor = 'white';
  
  // Ocultar botones y elementos no necesarios en el PDF
  const buttonsToHide = clone.querySelectorAll('button[type="submit"], .no-print');
  buttonsToHide.forEach(btn => btn.style.display = 'none');

  // Crear contenedor temporal
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.appendChild(clone);
  document.body.appendChild(tempContainer);

  try {
    const cleanFilename = titulo
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_áéíóúñ]/gi, '');

    await generatePDF(clone, cleanFilename || 'formulario');
  } finally {
    // Limpiar el contenedor temporal
    document.body.removeChild(tempContainer);
  }
};
