import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { getProgramacionesPorFichaYCoordinacion } from '../api/api';

function Calendariomain() {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [fichaError, setFichaError] = useState('');
  const [coordinacionError, setCoordinacionError] = useState('');

  const generateDaysArray = (year, month, events) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const event = events.find(e => e.fecha === dateStr);
      daysArray.push({
        day: i,
        dateStr: dateStr,
        hasEvent: !!event,
      });
    }

    return daysArray;
  };

  const handleDayClick = (dateStr) => {
    const dailyEvents = events.filter(e => e.fecha === dateStr);
    if (dailyEvents.length > 0) {
      const eventDetails = dailyEvents.map(e => 
        `<div style="text-align: left;">
          <strong>Taller:</strong> ${e.nombre_Taller}<br>
          <strong>Capacitador:</strong> ${e.nombre_Capacitador}<br>
          <strong>Descripción:</strong> ${e.descripcion_procaptall}<br>
          <strong>Sede:</strong> ${e.sede_procaptall}<br>
          <strong>Ambiente:</strong> ${e.ambiente_procaptall}<br>
          <strong>Fecha:</strong> ${e.fecha}<br>
          <strong>Hora Inicio:</strong> ${e.horaInicio_procaptall}<br>
          <strong>Hora Fin:</strong> ${e.horaFin_procaptall}
        </div>`).join('<hr/>');

      Swal.fire({
        title: `Programación para ${dateStr}`,
        html: eventDetails,
        confirmButtonText: 'Cerrar',
      });
    } else {
      Swal.fire({
        title: 'Sin Programación',
        text: 'No hay eventos programados para este día.',
        icon: 'info',
        confirmButtonText: 'Cerrar',
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const ficha = event.target.ficha.value;
    const coordinacion = event.target.coordinacion.value;
    setFichaError('');
    setCoordinacionError('');

    // Validación de ficha
    if (!/^\d+$/.test(ficha)) {
      setFichaError('La ficha debe contener solo números.');
      return;
    }

    if (ficha.length > 7) {
      setFichaError('La ficha debe contener un máximo de 7 dígitos.');
      return;
    }

    // Validación de coordinacion
    if (!/^[a-zA-Z\s]+$/.test(coordinacion)) {
      setCoordinacionError('La coordinación solo puede contener letras.');
      return;
    }

    try {
      const response = await getProgramacionesPorFichaYCoordinacion(ficha, coordinacion);
      console.log("Response de API:", response);

      const uniqueEvents = [];
      const seen = new Set();

      response.forEach(item => {
        Object.values(item).forEach(event => {
          const key = `${event.fecha_procaptall}-${event.nombre_Taller}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueEvents.push({
              sede_procaptall: event.sede_procaptall,
              descripcion_procaptall: event.descripcion_procaptall,
              ambiente_procaptall: event.ambiente_procaptall,
              fecha: event.fecha_procaptall.split('T')[0],
              horaInicio_procaptall: event.horaInicio_procaptall,
              horaFin_procaptall: event.horaFin_procaptall,
              numero_FichaFK: event.numero_FichaFK,
              nombre_Taller: event.nombre_Taller,
              nombre_Capacitador: event.nombre_Capacitador,
            });
          }
        });
      });

      console.log("Eventos únicos mapeados:", uniqueEvents);
      setEvents(uniqueEvents);

      const daysArray = generateDaysArray(currentYear, currentMonth, uniqueEvents);
      setDaysInMonth(daysArray);
      setCalendarVisible(true);
    } catch (error) {
      console.error("Error al obtener programaciones:", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo obtener la programación.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
    }
  };

  return (
    <main>
      <div className="form-container-calendariousua">
        <h2 className="Titulo-calendariousua">Seleccione Ficha y Coordinación</h2>
        <form id="selection-form" onSubmit={handleSubmit}>
          <label className="label-ficha-calendariousua" htmlFor="ficha">Ficha:</label>
          <input className="input-calendariousua" type="text" id="ficha" name="ficha" required />
          {fichaError && <p className="error-message">{fichaError}</p>}
          <label className="label-ficha-calendariousua" htmlFor="coordinacion">Coordinación:</label>
          <input className="input-calendariousua" type="text" id="coordinacion" name="coordinacion" required />
          {coordinacionError && <p className="error-message">{coordinacionError}</p>}
          <button className="boton-calendarioUsuario" type="submit">Mostrar Calendario</button>
        </form>
      </div>
      {calendarVisible && (
        <div className="calendar-container">
          <div className="calendar-grid">
            {daysInMonth.map(day => (
              <div
                key={day.dateStr}
                className={`calendar-day ${day.hasEvent ? 'event' : ''}`}
                onClick={() => handleDayClick(day.dateStr)}
              >
                {day.day}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default Calendariomain;
