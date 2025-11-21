import React, { useState, useRef, useEffect } from "react"; // sacamos useState para 
import { showErrorAlert } from "../helpers/sweetAlert.js";
//Para el horario de alumno
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
const FormRender = ({ esquema, valores = {}, onSubmit, readOnly = false, userType = "alumno" }) => {
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
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      {esquema.map((campo) => renderField(campo))}

      {!readOnly && (
        <div className="mt-8 pt-6 border-t">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all w-full md:w-auto shadow-md hover:shadow-lg"
          >
            Guardar Formulario
          </button>
        </div>
      )}
    </form>
  );
};

export default FormRender;