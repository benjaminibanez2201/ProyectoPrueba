import React, { useState, useRef, useEffect } from "react";
import { showErrorAlert } from "../helpers/sweetAlert.js";
import { validarRut, validarEmail, validarTelefono, validarNombre, validarTexto } from "../helpers/formValidators";

// --- 1. HEADER (INTACTO) ---
const DocumentHeader = () => {
  const logoIzquierdo = "/images/ubb.png";
  const logoDerecho = "/images/Imagen5.png";

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b-2 border-blue-800 gap-4 px-4">
      <div className="w-24 md:w-32 flex justify-center items-center">
        <img
          src={logoIzquierdo}
          alt="Logo UBB"
          className="w-full h-auto object-contain"
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      <div className="text-center flex-1">
        <h2 className="text-sm md:text-base font-extrabold text-gray-900 uppercase tracking-wide leading-snug">
          FACULTAD DE CIENCIAS EMPRESARIALES<br />ESCUELA INGENIERÍA CIVIL INFORMÁTICA
        </h2>
      </div>

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

// --- 2. SCHEDULE INPUT (INTACTO) ---
const ScheduleInput = ({ value = {}, onChange, readOnly }) => {
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const horas = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutos = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  const handleChangeHora = (dia, momento, campo, valor) => {
    const nuevoHorario = { ...value };
    if (!nuevoHorario[dia]) nuevoHorario[dia] = {};
    if (!nuevoHorario[dia][momento]) nuevoHorario[dia][momento] = {};

    nuevoHorario[dia][momento][campo] = valor;

    const h = nuevoHorario[dia];
    const toMinutes = (obj) => {
      if (!obj?.horaInicio || !obj?.minInicio || !obj?.horaFin || !obj?.minFin) return null;
      const inicio = Number(obj.horaInicio) * 60 + Number(obj.minInicio);
      const fin = Number(obj.horaFin) * 60 + Number(obj.minFin);
      return { inicio, fin };
    };

    if (h.manana) {
      const m = toMinutes(h.manana);
      if (m && m.inicio >= m.fin) {
        showErrorAlert('Horario inválido', `En ${dia}: la hora de inicio debe ser menor que la de fin.`);
        return;
      }
    }

    if (h.tarde) {
      const t = toMinutes(h.tarde);
      if (t && t.inicio >= t.fin) {
        showErrorAlert('Horario inválido', `En ${dia}: la hora de inicio de la tarde debe ser menor que la de fin.`);
        return;
      }
    }
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
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <select disabled={readOnly} value={value[dia]?.manana?.horaInicio || ""} onChange={(e) => handleChangeHora(dia, "manana", "horaInicio", e.target.value)} className="border rounded px-2 py-1"><option value="">HH</option>{horas.map(h => <option key={h} value={h}>{h}</option>)}</select>
                  <select disabled={readOnly} value={value[dia]?.manana?.minInicio || ""} onChange={(e) => handleChangeHora(dia, "manana", "minInicio", e.target.value)} className="border rounded px-2 py-1"><option value="">MM</option>{minutos.map(m => <option key={m} value={m}>{m}</option>)}</select>
                  <span>-</span>
                  <select disabled={readOnly} value={value[dia]?.manana?.horaFin || ""} onChange={(e) => handleChangeHora(dia, "manana", "horaFin", e.target.value)} className="border rounded px-2 py-1"><option value="">HH</option>{horas.map(h => <option key={h} value={h}>{h}</option>)}</select>
                  <select disabled={readOnly} value={value[dia]?.manana?.minFin || ""} onChange={(e) => handleChangeHora(dia, "manana", "minFin", e.target.value)} className="border rounded px-2 py-1"><option value="">MM</option>{minutos.map(m => <option key={m} value={m}>{m}</option>)}</select>
                </div>
              </td>
              <td className="px-4 py-2 flex gap-2">
                <select disabled={readOnly} value={value[dia]?.tarde?.horaInicio || ""} onChange={(e) => handleChangeHora(dia, "tarde", "horaInicio", e.target.value)} className="border rounded px-2 py-1"><option value="">HH</option>{horas.map(h => <option key={h} value={h}>{h}</option>)}</select>
                <select disabled={readOnly} value={value[dia]?.tarde?.minInicio || ""} onChange={(e) => handleChangeHora(dia, "tarde", "minInicio", e.target.value)} className="border rounded px-2 py-1"><option value="">MM</option>{minutos.map(m => <option key={m} value={m}>{m}</option>)}</select>
                <span>-</span>
                <select disabled={readOnly} value={value[dia]?.tarde?.horaFin || ""} onChange={(e) => handleChangeHora(dia, "tarde", "horaFin", e.target.value)} className="border rounded px-2 py-1"><option value="">HH</option>{horas.map(h => <option key={h} value={h}>{h}</option>)}</select>
                <select disabled={readOnly} value={value[dia]?.tarde?.minFin || ""} onChange={(e) => handleChangeHora(dia, "tarde", "minFin", e.target.value)} className="border rounded px-2 py-1"><option value="">MM</option>{minutos.map(m => <option key={m} value={m}>{m}</option>)}</select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- 3. FORM RENDER PRINCIPAL (CON LA LÓGICA NUEVA AGREGADA) ---
// Ahora aceptamos 'respuestasIniciales' (o 'valores') y 'userType'
const FormRender = ({ esquema, valores = {}, respuestasIniciales = {}, onSubmit, readOnly = false, userType = "alumno", titulo, buttonText }) => {
  // Fusionamos valores y respuestasIniciales por compatibilidad
  const datosEntrada = { ...valores, ...respuestasIniciales };
  const [respuestas, setRespuestas] = useState(datosEntrada);

  const canvasRefs = useRef({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (valores || respuestasIniciales) {
      setRespuestas(prev => {
        const nuevosDatos = { ...prev, ...valores, ...respuestasIniciales };

        if (JSON.stringify(prev) === JSON.stringify(nuevosDatos)) {
          return prev;
        }

        //  Validamos todos los campos que tengan 'validation'
        esquema.forEach(campo => {
          if (campo.validation) {
            validateField(campo.id, nuevosDatos[campo.id], campo.validation);
          }
        });

        return nuevosDatos;
      });
    }
  }, [JSON.stringify(valores), JSON.stringify(respuestasIniciales)]);


  // ----------------------------------------
  // ----------------------------------------------------

  const handleChange = (id, value, validationType) => { // 1. Agrega validationType aquí

    // Guardamos el valor
    setRespuestas((prev) => ({
      ...prev,
      [id]: value,
    }));

    // 2. Ejecutamos la validación si existe
    // (Esto es lo que te faltaba, por eso se pasaba la validación por las weas)
    if (validationType && !readOnly) {
      validateField(id, value, validationType);
    }

  };

  // --- LÓGICA DE CANVAS (INTACTA) ---
  const startDrawing = (e, id) => {
    if (readOnly) return;
    const canvas = canvasRefs.current[id];
    if (!canvas) return;
    // prevenir scroll en touch
    if (e.type === "touchstart") e.preventDefault();

    const ctx = canvas.getContext("2d");
    // mejor configuración de trazo
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";

    const rect = canvas.getBoundingClientRect();
    const clientX = (e.clientX != null) ? e.clientX : e.touches[0].clientX;
    const clientY = (e.clientY != null) ? e.clientY : e.touches[0].clientY;

    // escala entre coordenadas de CSS y coordenadas internas del canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e, id) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRefs.current[id];
    if (!canvas) return;

    // prevenir scroll en touch
    if (e.type === "touchmove") e.preventDefault();

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const clientX = (e.clientX != null) ? e.clientX : e.touches[0].clientX;
    const clientY = (e.clientY != null) ? e.clientY : e.touches[0].clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (id) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRefs.current[id];
    if (canvas) {
      // opcional: cerrar path y asegurar un trazo final
      const ctx = canvas.getContext("2d");
      ctx.closePath();
      handleChange(id, "firmado_pendiente_procesar");
    }
  };

  const clearCanvas = (id) => {
    const canvas = canvasRefs.current[id];
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      handleChange(id, "");
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // === Validación cruzada de fechas ===
    const fechaInicio = new Date(respuestas["fecha_inicio"]);
    const fechaTermino = new Date(respuestas["fecha_termino"]);

    if (respuestas["fecha_inicio"] && respuestas["fecha_termino"]) {
      if (fechaInicio > fechaTermino) {
        showErrorAlert(
          'Fechas inválidas',
          'La fecha de inicio debe ser menor que la fecha de término.'
        );
        return; // Detiene el envío
      }
    }

    const firmas = {};
    Object.keys(canvasRefs.current).forEach((key) => {
      const canvas = canvasRefs.current[key];
      if (canvas) firmas[key] = canvas.toDataURL("image/png");
    });
    const datosFinales = { ...respuestas, ...firmas };
    onSubmit(datosFinales);
  };

  // Coloca esto fuera (arriba) del renderField, junto a tus otras funciones/helpers:
  const colClasses = {
    12: "md:col-span-12",
    6: "md:col-span-6",
    4: "md:col-span-4",
    3: "md:col-span-3",
    2: "md:col-span-2"
  };

  const validateField = (name, value, validationType) => {
    let errorMsg = "";

    if (validationType === "rut" && value) {
      if (!validarRut(value)) errorMsg = "RUT inválido (Ej: 12345678-9)";
    }
    if (validationType === "email" && value) {
      if (!validarEmail(value)) errorMsg = "Email inválido";
    }
    if (validationType === "fono" && value) {
      if (!validarTelefono(value)) errorMsg = "Solo números y '+'";
    }
    if (validationType === "nombre" && value) {
      if (!validarNombre(value)) errorMsg = "Nombre inválido. Solo letras y espacios.";
    }
    if (validationType === "text" && value) {
      if (!validarTexto(value)) errorMsg = "Solo letras y espacios.";
    }
    // Actualizamos el objeto de errores
    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));
  };

  // Reemplaza TU renderField por esta versión (no define componentes inline)
  const renderField = (campo) => {
    const {
      id, label, tipo, required, options, placeholder,
      min, max, readOnly: fieldReadOnly, fillBy,
      cols = 12, validation // por defecto
    } = campo;

    let isReadOnly = readOnly || fieldReadOnly;
    if (userType === "alumno" && fillBy === "empresa") isReadOnly = true;
    if (userType === "empresa" && (fillBy === "alumno" || !fillBy)) isReadOnly = true;

    let displayPlaceholder = placeholder;
    if (isReadOnly && !respuestas[id]) displayPlaceholder = "";

    const spanClass = colClasses[cols] || colClasses[12];

    // Header especial (retornamos DIV normal con key fijo)
    if (campo.tipo === "header") {
      return (
        <div key={campo.id} className={`col-span-12 mt-8 mb-4 border-b-2 border-blue-200 pb-2`}>
          <h2 className="text-xl font-bold text-blue-800">{campo.label}</h2>
        </div>
      );
    }

    // Base wrapper para cada campo (NO es un componente, es un div)
    const fieldContent = (() => {
      if (["text", "email", "date", "number"].includes(tipo)) {
        return (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {label} {required && !isReadOnly && <span className="text-red-500">*</span>}
            </label>
            <input
              type={tipo}
              value={respuestas[id] || ""}
              onChange={(e) => handleChange(id, e.target.value, validation)}
              disabled={isReadOnly}
              required={required && !isReadOnly}
              placeholder={displayPlaceholder}
              min={min} max={max}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 font-medium"
            />
            {/* Mostramos el error si existe */}
            {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
          </div>
        );
      }

      if (tipo === "textarea") {
        return (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {label} {required && !isReadOnly && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={respuestas[id] || ""}
              onChange={(e) => handleChange(id, e.target.value, validation)}
              disabled={isReadOnly}
              required={required && !isReadOnly}
              placeholder={displayPlaceholder}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
            />
            {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
          </div>
        );
      }

      if (tipo === "select") {
        return (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {label} {required && !isReadOnly && <span className="text-red-500">*</span>}
            </label>
            <select
              value={respuestas[id] || ""}
              onChange={(e) => handleChange(id, e.target.value, validation)}
              disabled={isReadOnly}
              required={required && !isReadOnly}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 bg-white"
            >
              <option value="">Seleccione una opción...</option>
              {options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
          </div>
        );
      }

      if (tipo === "schedule") {
        return (
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              {label} {required && !isReadOnly && <span className="text-red-500">*</span>}
            </label>
            <ScheduleInput
              value={respuestas[id] || {}}
              onChange={(newVal) => handleChange(id, newVal, validation)}
              readOnly={isReadOnly}
            />
          </div>
        );
      }

      if (tipo === "signature") {
        return (
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              {label} {required && !isReadOnly && <span className="text-red-500">*</span>}
            </label>

            {isReadOnly ? (
              respuestas[id] && !respuestas[id].includes("pendiente") ? (
                <div className="border rounded p-2 bg-gray-50 inline-block">
                  <img src={respuestas[id]} alt="Firma" className="h-24" />
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm border p-2 rounded bg-gray-50">Sin firma registrada</p>
              )
            ) : (
              <div className="border-2 border-gray-300 border-dashed rounded bg-white w-full max-w-md touch-none">
                <canvas
                  ref={(el) => (canvasRefs.current[id] = el)}
                  width={500}
                  height={200}
                  style={{ touchAction: "none" }}
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
                  <button type="button" className="text-red-600 hover:text-red-800 underline font-medium" onClick={() => clearCanvas(id)}>Borrar Firma</button>
                </div>
              </div>
            )}
          </div>
        );
      }

      return null;
    })();

    // Finalmente devolvemos el wrapper DIV (con key si renderField se usa fuera del map)
    return (
      <div key={id} className={`col-span-12 ${spanClass}`}>
        {fieldContent}
      </div>
    );
  };


  return (
    <div className="bg-white p-4 md:p-10 rounded-lg shadow-lg border border-gray-200 max-w-5xl mx-auto">
      <DocumentHeader />
      {titulo && (
        <div className="mb-8 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 uppercase underline decoration-2 underline-offset-4">
            {titulo}
          </h1>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-12 gap-6"
      >
        {esquema && esquema.map((campo) => (
          <React.Fragment key={campo.id || campo.nombre}>
            {renderField(campo)}
          </React.Fragment>
        ))}
        {!readOnly && (
          <div className="col-span-12 mt-12 pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={Object.values(errors).some(msg => msg !== "")}
              className="bg-blue-800 hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"            >
              {buttonText || "Guardar Documento"}
            </button>
          </div>

        )}

      </form>
    </div>
  );
};

export default FormRender;