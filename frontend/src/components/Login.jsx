import React, { useState } from 'react';
import logo from '../assets/logo.jpg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('ESTUDIANTE');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [listNumber, setListNumber] = useState('');
  const [group, setGroup] = useState('');
  const [rfc, setRfc] = useState('');
  const [claveEscolar, setClaveEscolar] = useState('');
  const [grupoAsignado, setGrupoAsignado] = useState('');
  const [error, setError] = useState('');

  const isTeacher = role === 'PROFESOR';
  const isRegister = mode === 'register';

  const resetForm = () => {
    setIdentifier('');
    setPassword('');
    setName('');
    setPhone('');
    setListNumber('');
    setGroup('');
    setRfc('');
    setClaveEscolar('');
    setGrupoAsignado('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!name.trim() || !password.trim() || !role) {
        setError('Completa todos los campos obligatorios para registrarte.');
        return;
      }

      if (isTeacher) {
        if (!rfc.trim() || !claveEscolar.trim() || !grupoAsignado.trim()) {
          setError('Completa todos los datos del profesor.');
          return;
        }
      } else {
        if (!identifier.trim() || !phone.trim() || !listNumber.trim() || !group.trim()) {
          setError('Completa todos los datos del alumno.');
          return;
        }
      }

      try {
        const payload = {
          nombre: name.trim(),
          password,
          role,
          ...(isTeacher
            ? {
                rfc: rfc.trim(),
                claveEscolar: claveEscolar.trim(),
                grupoAsignado: grupoAsignado.trim(),
              }
            : {
                correo: identifier.trim(),
                numeroTelefono: phone.trim(),
                numeroLista: Number(listNumber),
                grupo: group.trim(),
              }),
        };

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          const validationError = data.errors?.[0]?.msg;
          setError(data.msg || validationError || 'Error al registrarte. Revisa los datos.');
          return;
        }

        setMode('login');
        setPassword('');
        setError('Registro exitoso. Ahora inicia sesión.');
        if (!isTeacher) {
          setIdentifier(identifier.trim());
        } else {
          setIdentifier(rfc.trim());
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo conectar con el servidor. Intenta nuevamente.');
      }

      return;
    }

    if (!identifier.trim() || !password.trim()) {
      setError('Completa todos los campos para continuar.');
      return;
    }

    try {
      const payload = {
        role,
        password,
        ...(isTeacher ? { rfc: identifier.trim() } : { correo: identifier.trim() }),
      };

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const validationError = data.errors?.[0]?.msg;
        setError(data.msg || validationError || 'Error al iniciar sesión. Revisa tus credenciales.');
        return;
      }

      onLogin({
        token: data.token,
        user: data.user,
      });
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor. Intenta nuevamente.');
    }
  };

  const handleDemoLogin = () => {
    onLogin({
      token: 'demo-local',
      user: {
        id: 'demo',
        nombre: isTeacher ? 'Profesor Demo' : 'Alumno Demo',
        role,
      },
    });
  };

  const toggleMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setError('');
  };

  return (
    <div className="login-screen">
      <section className="login-panel">
        <div className="login-brand">
          <img src={logo} alt="Logo escolar" />
          <div>
            <h1>Registro de Aseo</h1>
            <p>{isRegister ? 'Crea tu cuenta' : 'Inicio de sesión'}</p>
          </div>
        </div>

        <div className="role-switch" aria-label="Tipo de usuario">
          <button
            type="button"
            className={role === 'ESTUDIANTE' ? 'active' : ''}
            onClick={() => {
              setRole('ESTUDIANTE');
              setError('');
            }}
          >
            Alumno
          </button>
          <button
            type="button"
            className={role === 'PROFESOR' ? 'active' : ''}
            onClick={() => {
              setRole('PROFESOR');
              setError('');
            }}
          >
            Profesor
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label htmlFor="register-name">Nombre</label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
                autoComplete="name"
              />
            </>
          )}

          {!isRegister && (
            <>
              <label htmlFor="login-identifier">{isTeacher ? 'RFC' : 'Correo'}</label>
              <input
                id="login-identifier"
                type={isTeacher ? 'text' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isTeacher ? 'RFC del profesor' : 'correo@escuela.edu'}
                autoComplete={isTeacher ? 'username' : 'email'}
              />
            </>
          )}

          {isRegister && !isTeacher && (
            <>
              <label htmlFor="register-email">Correo</label>
              <input
                id="register-email"
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="correo@escuela.edu"
                autoComplete="email"
              />

              <label htmlFor="register-phone">Teléfono</label>
              <input
                id="register-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 dígitos"
                autoComplete="tel"
              />

              <label htmlFor="register-list">Número de lista</label>
              <input
                id="register-list"
                type="number"
                value={listNumber}
                onChange={(e) => setListNumber(e.target.value)}
                placeholder="Ej: 12"
                min="1"
              />

              <label htmlFor="register-group">Grupo</label>
              <input
                id="register-group"
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="Ej: 3B"
              />
            </>
          )}

          {isRegister && isTeacher && (
            <>
              <label htmlFor="register-rfc">RFC</label>
              <input
                id="register-rfc"
                type="text"
                value={rfc}
                onChange={(e) => setRfc(e.target.value)}
                placeholder="RFC del profesor"
                autoComplete="username"
              />

              <label htmlFor="register-clave">Clave escolar</label>
              <input
                id="register-clave"
                type="text"
                value={claveEscolar}
                onChange={(e) => setClaveEscolar(e.target.value)}
                placeholder="Clave escolar secreta"
              />

              <label htmlFor="register-grupo-asignado">Grupo asignado</label>
              <input
                id="register-grupo-asignado"
                type="text"
                value={grupoAsignado}
                onChange={(e) => setGrupoAsignado(e.target.value)}
                placeholder="Ej: 4A"
              />
            </>
          )}

          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contrasena"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit">
            {isRegister ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <button
          type="button"
          className="demo-login-btn"
          onClick={() => {
            toggleMode();
            resetForm();
          }}
          style={{ marginTop: '8px' }}
        >
          {isRegister ? 'Volver al inicio de sesión' : 'Crear nueva cuenta'}
        </button>
      </section>
    </div>
  );
}
