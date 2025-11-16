import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const areas = [
  'Seguridad Industrial',
  'Salud Laboral',
  'Proteccion Civil',
  'Medio Ambiente',
  'Sistemas de Gestión',
];

export default function Profile() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    curp: '',
  });
  const [preferences, setPreferences] = useState<string[]>([]);

  // 1. fetchPreferences envuelta en useCallback para estabilidad
  const fetchPreferences = useCallback(async () => {
    // La función depende de 'user', por lo que debe ir en el array de useCallback.
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('area')
        .eq('user_id', user.id);

      if (data) {
        setPreferences(data.map((p) => p.area));
      }
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
    }
  }, [user]); // <--- Dependencia del useCallback

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (profile) {
      setFormData({
        username: profile.username || '',
        nombre: profile.nombre || '',
        apellido_paterno: profile.apellido_paterno || '',
        apellido_materno: profile.apellido_materno || '',
        fecha_nacimiento: profile.fecha_nacimiento || '',
        curp: profile.curp || '',
      });
    }

    // 2. Llamada a la función estable
    fetchPreferences();
    
  // 3. Incluimos la función estable 'fetchPreferences' en el array de dependencias
  // También incluimos 'profile', 'user' y 'navigate' ya que se usan dentro del useEffect
  }, [profile, user, navigate, fetchPreferences]); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePreferenceToggle = (area: string) => {
    setPreferences((prev) =>
      prev.includes(area) ? prev.filter((p) => p !== area) : [...prev, area]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(formData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Las operaciones de eliminación e inserción deben hacerse de forma transaccional o secuencial
      // Primero eliminar
      await supabase.from('user_preferences').delete().eq('user_id', user.id);

      // Luego insertar las nuevas preferencias
      if (preferences.length > 0) {
        const preferencesData = preferences.map((area) => ({
          user_id: user.id,
          area,
        }));

        const { error: prefError } = await supabase
          .from('user_preferences')
          .insert(preferencesData);

        if (prefError) throw prefError;
      }

      setMessage('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      // Usamos el error para asegurar que se muestre en el mensaje
      setMessage(`Error al actualizar el perfil: ${(error as Error).message || 'Desconocido'}`); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Mi Perfil</h1>

        <form onSubmit={handleSubmit} className="profile-form">
          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <section className="form-section">
            <h2>Datos de la Cuenta</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Correo</label>
                <input type="email" value={profile?.email || ''} disabled />
              </div>
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Tu nombre de usuario"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Datos del Usuario</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="form-group">
                <label htmlFor="apellido_paterno">Apellido Paterno</label>
                <input
                  id="apellido_paterno"
                  name="apellido_paterno"
                  type="text"
                  value={formData.apellido_paterno}
                  onChange={handleInputChange}
                  placeholder="Tu apellido paterno"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="apellido_materno">Apellido Materno</label>
                <input
                  id="apellido_materno"
                  name="apellido_materno"
                  type="text"
                  value={formData.apellido_materno}
                  onChange={handleInputChange}
                  placeholder="Tu apellido materno"
                />
              </div>
              <div className="form-group">
                <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                <input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="curp">CURP</label>
              <input
                id="curp"
                name="curp"
                type="text"
                value={formData.curp}
                onChange={handleInputChange}
                placeholder="Tu CURP"
                maxLength={18}
              />
            </div>
          </section>

          <section className="form-section">
            <h2>Preferencias</h2>
            <p className="section-description">
              Selecciona las áreas de tu interés para recibir notificaciones personalizadas
            </p>
            <div className="preferences-grid">
              {areas.map((area) => (
                <label key={area} className="preference-item">
                  <input
                    type="checkbox"
                    checked={preferences.includes(area)}
                    onChange={() => handlePreferenceToggle(area)}
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/')} className="secondary-button">
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}