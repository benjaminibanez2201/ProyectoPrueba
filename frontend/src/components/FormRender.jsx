import React, { useState, useRef, useEffect } from "react"; // sacamos useState para 
import { showErrorAlert } from "../helpers/sweetAlert.js";

const DocumentHeader = () => {
  // Rutas a las imágenes 
  const logoIzquierdo = "/images/ubb.png"; 
  const logoDerecho = "/images/Imagen5.png"; 

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b-2 border-blue-800 gap-4 px-4">
      {/* 1. Logo Izquierda (UBB) */}
      <div className="w-24 md:w-32 flex justify-center items-center">
        <img 
          src={logoIzquierdo} 
          alt="Logo UBB" 
          className="w-full h-auto object-contain"
          onError={(e) => e.target.style.display = 'none'} 
        />
      </div>

      {/* 2. Texto Central */}
      <div className="text-center flex-1">
        <h2 className="text-sm md:text-base font-extrabold text-gray-900 uppercase tracking-wide leading-snug">
          FACULTAD DE CIENCIAS EMPRESARIALES<br />ESCUELA INGENIERÍA CIVIL INFORMÁTICA
        </h2>
      </div>

      {/* 3. Logo Derecha (Facultad) */}
      <div className="w-26 md:w-36 flex justify-center items-center">
        <img 
          src={logoDerecho} 
          alt="Logo Facultad" 
          className="w-full h-auto object-contain"
          onError={(e) => e.target.style.display = 'none'} 
        />
      </div>
    </div>
  );
};
const ScheduleInput = ({ value = {}, onChange, readOnly }) => {
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const horas = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutos = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  const handleChangeHora = (dia, momento, campo, valor) => {
    const nuevoHorario = { ...value };
    if (!nuevoHorario[dia]) nuevoHorario[dia] = {};
    if (!nuevoHorario[dia][momento]) nuevoHorario[dia][momento] = {};

    // Primero guardamos el valor temporalmente para validar
    nuevoHorario[dia][momento][campo] = valor;

    // ---- VALIDACIÓN ----
    const h = nuevoHorario[dia];

    const toMinutes = (obj) => {
      if (!obj?.horaInicio || !obj?.minInicio || !obj?.horaFin || !obj?.minFin) return null;
      const inicio = Number(obj.horaInicio) * 60 + Number(obj.minInicio);
      const fin = Number(obj.horaFin) * 60 + Number(obj.minFin);
      return { inicio, fin };
    };

    // Validar mañana
    if (h.manana) {
      const m = toMinutes(h.manana);
      if (m && m.inicio >= m.fin) {
        showErrorAlert(
          'Horario inválido',
          `En ${dia}: la hora de inicio debe ser menor que la de fin.`
        );
        return;
      }
    }

    // Validar tarde
    if (h.tarde) {
      const t = toMinutes(h.tarde);
      if (t && t.inicio >= t.fin) {
        showErrorAlert(
          'Horario inválido',
          `En ${dia}: la hora de inicio de la tarde debe ser menor que la de fin.`
        );
        return;
      }
    }

    // Si pasó la validación, se guarda
    onChange(nuevoHorario);
  };

  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th className="px-4 py-3">Día</th>
            <th className="px-4 py-3">Mañana</th>
            <th className="px-4 py-3">Tarde</th>
          </tr>
        </thead>
        <tbody>
          {dias.map((dia) => (
            <tr key={dia} className="bg-white border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-medium">{dia}</td>

              {/* MAÑANA */}
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <select
                    disabled={readOnly}
                    value={value[dia]?.manana?.horaInicio || ""}
                    onChange={(e) => handleChangeHora(dia, "manana", "horaInicio", e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">HH</option>
                    {horas.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <select
                    disabled={readOnly}
                    value={value[dia]?.manana?.minInicio || ""}
                    onChange={(e) => handleChangeHora(dia, "manana", "minInicio", e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">MM</option>
                    {minutos.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <span>-</span>

                  <select
                    disabled={readOnly}
                    value={value[dia]?.manana?.horaFin || ""}
                    onChange={(e) => handleChangeHora(dia, "manana", "horaFin", e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">HH</option>
                    {horas.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <select
                    disabled={readOnly}
                    value={value[dia]?.manana?.minFin || ""}
                    onChange={(e) => handleChangeHora(dia, "manana", "minFin", e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">MM</option>
                    {minutos.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </td>


              {/* TARDE */}
              <td className="px-4 py-2 flex gap-2">
                <select
                  disabled={readOnly}
                  value={value[dia]?.tarde?.horaInicio || ""}
                  onChange={(e) => handleChangeHora(dia, "tarde", "horaInicio", e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">HH</option>
                  {horas.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>

                <select
                  disabled={readOnly}
                  value={value[dia]?.tarde?.minInicio || ""}
                  onChange={(e) => handleChangeHora(dia, "tarde", "minInicio", e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">MM</option>
                  {minutos.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <span>-</span>

                <select
                  disabled={readOnly}
                  value={value[dia]?.tarde?.horaFin || ""}
                  onChange={(e) => handleChangeHora(dia, "tarde", "horaFin", e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">HH</option>
                  {horas.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>

                <select
                  disabled={readOnly}
                  value={value[dia]?.tarde?.minFin || ""}
                  onChange={(e) => handleChangeHora(dia, "tarde", "minFin", e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">MM</option>
                  {minutos.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Componente que recibe un esquema JSON y renderiza el formulario dinámicamente.
const FormRender = ({ esquema, valores = {}, onSubmit, readOnly = false, userType = "alumno", titulo }) => {
  const [respuestas, setRespuestas] = useState(valores); // Guardar las respuestas del usuario
  const canvasRefs = useRef({});// Referencias para los canvas de firma (HTML5 canvas nativo) - guardaremos algo como firmaAlumno: HTMLCanvasElement
  const [isDrawing, setIsDrawing] = useState(false); // false: no esta dibujando - cambia a true si se esta tocando el canvas

  
  // Actualizar el estado cuando el usuario escribe
  const handleChange = (id, value) => {
    setRespuestas((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Para dibujar en el canvas (Firma manual)
  const startDrawing = (e, id) => {
    if (readOnly) return;
    const canvas = canvasRefs.current[id];
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    // Tomamos la posicion del mouse
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);// Activamos el isDrawing quedando en true
  };

  const draw = (e, id) => {
    if (!isDrawing || readOnly) return; // si no esta dibujando o en modo lectura no hace nada
    const canvas = canvasRefs.current[id];
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    //Dibuja la linea desde su ultima posicion
    ctx.lineTo(x, y);
    // la pinta 
    ctx.stroke();
  };

  const stopDrawing = (id) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRefs.current[id];
    if (canvas) {
      // Guardamos la firma como base64 temporalmente para validación
      handleChange(id, "firmado_pendiente_procesar");
    }
  };

  const clearCanvas = (id) => {
    const canvas = canvasRefs.current[id];
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      handleChange(id, ""); // Limpiar valor
    }
  }

  // Función para manejar el envío
  const handleSubmit = (e) => {
    e.preventDefault();

    // Antes de enviar, guardamos las firmas reales desde los canvas
    const firmas = {};
    Object.keys(canvasRefs.current).forEach((key) => {
      const canvas = canvasRefs.current[key];
      if (canvas) {
        firmas[key] = canvas.toDataURL("image/png");
      }
    });

    const datosFinales = { ...respuestas, ...firmas };
    onSubmit(datosFinales); // mandamos los datos al backend
  };

  // --- RENDERIZADORES POR TIPO ---

const renderField = (campo) => {
    const {
      id, label, tipo, required, options, placeholder,
      min, max, readOnly: fieldReadOnly, step, fillBy
    } = campo;

    // Permisos
    
    let isReadOnly = readOnly || fieldReadOnly;

    // CASO 1: Soy Alumno mirando campo de Empresa
    // Antes ocultábamos (return null), ahora solo bloqueamos.
    if (userType === "alumno" && fillBy === "empresa") {
      isReadOnly = true;
    }

    // CASO 2: Soy Empresa mirando campo de Alumno
    // La empresa ve lo que llenó el alumno, pero no lo puede editar.
    if (userType === "empresa" && (fillBy === "alumno" || !fillBy)) {
      isReadOnly = true;
    }

    let displayPlaceholder = placeholder;
    if (isReadOnly && !respuestas[id]) {
        displayPlaceholder = "(Campo reservado o de solo lectura)";
    }

    // 1. HEADER (Separadores)
    if (tipo === "header") {
      return (
        <div key={id} className="mt-8 mb-4 border-b-2 border-blue-200 pb-2">
          <h3 className="text-xl font-bold text-blue-800">{label}</h3>
        </div>
      );
    }

    // 2. TEXT / EMAIL / DATE / NUMBER
    if (["text", "email", "date", "number"].includes(tipo)) {
      return (
        <div key={id} className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={tipo}
            value={respuestas[id] || ""}
            onChange={(e) => handleChange(id, e.target.value)}
            disabled={isReadOnly}
            required={required}
            placeholder={placeholder}
            min={min}
            max={max}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
      );
    }

    // 3. TEXTAREA
    if (tipo === "textarea") {
      return (
        <div key={id} className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={respuestas[id] || ""}
            onChange={(e) => handleChange(id, e.target.value)}
            disabled={isReadOnly}
            required={required}
            placeholder={placeholder}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
      );
    }

    // 4. SELECT
    if (tipo === "select") {
      return (
        <div key={id} className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={respuestas[id] || ""}
            onChange={(e) => handleChange(id, e.target.value)}
            disabled={isReadOnly}
            required={required}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 bg-white"
          >
            <option value="">Seleccione una opción...</option>
            {options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // 5. SCHEDULE (Horario)
    if (tipo === "schedule") {
      return (
        <div key={id} className="mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>

          <ScheduleInput
            value={respuestas[id] || {}}    // <- importante para evitar undefined
            onChange={(newVal) => handleChange(id, newVal)}
            readOnly={isReadOnly}
          />
        </div>
      );
    }

    // 6. SIGNATURE (Firma - Implementación Nativa)
    if (tipo === "signature") {
      return (
        <div key={id} className="mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>

          {isReadOnly ? (
            respuestas[id] ? (
              <div className="border rounded p-2 bg-gray-50 inline-block">
                <img src={respuestas[id]} alt="Firma" className="h-24" />
              </div>
            ) : (
              <p className="text-gray-400 italic">Sin firma</p>
            )
          ) : (
            <div className="border-2 border-gray-300 border-dashed rounded bg-white w-full max-w-md touch-none">
              <canvas
                ref={(el) => (canvasRefs.current[id] = el)}
                width={500}
                height={200}
                className="w-full h-48 cursor-crosshair"
                onMouseDown={(e) => startDrawing(e, id)}
                onMouseMove={(e) => draw(e, id)}
                onMouseUp={() => stopDrawing(id)}
                onMouseLeave={() => stopDrawing(id)}
                onTouchStart={(e) => startDrawing(e, id)}
                onTouchMove={(e) => draw(e, id)}
                onTouchEnd={() => stopDrawing(id)}
              />
              <div className="bg-gray-100 p-2 text-right text-xs border-t">
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800 underline font-medium"
                  onClick={() => clearCanvas(id)}
                >
                  Borrar Firma
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white p-4 md:p-10 rounded-lg shadow-lg border border-gray-200 max-w-5xl mx-auto">
      
      {/* 1. CABECERA CON LOGOS */}
      <DocumentHeader />

      {/* 2. TÍTULO DEL DOCUMENTO (Aquí es donde lo querías) */}
      {titulo && (
        <div className="mb-8 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 uppercase underline decoration-2 underline-offset-4">
            {titulo}
          </h1>
        </div>
      )}

      {/* 3. FORMULARIO DINÁMICO */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {esquema && esquema.map((campo) => renderField(campo))}
        
        {!readOnly && (
          <div className="mt-12 pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded transition-all shadow-md hover:shadow-lg w-full md:w-auto flex items-center justify-center gap-2"
            >
              <span>Guardar Documento</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FormRender;