import React from 'react';

export default function Header({ selectedDate, setSelectedDate, user, onLogout }) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateObj = new Date(selectedDate + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('es-ES', options);

  return (
    <header className="app-header">
      <div className="header-top">
        <h2>Sistema de Registro de Aseo</h2>

        <div className="header-user-menu">
          <span className="header-user-name">{user?.nombre || 'Usuario'}</span>
          <button type="button" className="header-logout-btn" onClick={onLogout}>
            Salir
          </button>
        </div>
      </div>

      <div className="header-date-section">
        <h3 style={{ textTransform: 'capitalize' }}>{formattedDate}</h3>
        <div className="calendar-wrapper">
          <label htmlFor="global-calendar">Fecha</label>
          <input
            type="date"
            id="global-calendar"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="header-date-input"
            disabled
          />
        </div>
      </div>
    </header>
  );
}
