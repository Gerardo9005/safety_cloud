import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './AdminDashboard.css';

interface Resource {
  id: string;
  nombre: string;
  descripcion: string | null;
  clave: string;
  enlace: string;
  tipo_recurso: string;
  imagen: string;
  descargas: number;
  me_gusta: number;
  area: string;
  funcion: string;
  clasificacion: string;
  modalidad: string;
}

export default function AdminDashboard() {
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('panel');
  const [resources, setResources] = useState<Resource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [stats, setStats] = useState({
    totalRecursos: 0,
    totalDescargas: 0,
    totalUsuarios: 0,
  });

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    clave: '',
    enlace: '',
    tipo_recurso: 'Documento de PDF',
    imagen: 'documento-pdf 1502 1127.png',
    descargas: 0,
    me_gusta: 0,
    area: 'Seguridad Industrial',
    funcion: 'Manual',
    clasificacion: 'Utilidad Alta',
    modalidad: 'Editable',
  });

  useEffect(() => {
    if (!profile || !isAdmin) {
      navigate('/');
      return;
    }

    fetchStats();
    fetchResources();
  }, [profile, isAdmin, navigate]);

  const fetchStats = async () => {
    try {
      const { count: resourcesCount } = await supabase
        .from('recursos')
        .select('*', { count: 'exact', head: true });

      const { data: recursos } = await supabase.from('recursos').select('descargas');
      const totalDescargas = recursos?.reduce((sum, r) => sum + r.descargas, 0) || 0;

      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalRecursos: resourcesCount || 0,
        totalDescargas,
        totalUsuarios: usersCount || 0,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('recursos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error al cargar recursos:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingResource) {
        const { error } = await supabase
          .from('recursos')
          .update(formData)
          .eq('id', editingResource.id);

        if (error) throw error;
        alert('Recurso actualizado correctamente');
      } else {
        const { error } = await supabase.from('recursos').insert([formData]);

        if (error) throw error;
        alert('Recurso creado correctamente');
      }

      setShowForm(false);
      setEditingResource(null);
      resetForm();
      fetchResources();
      fetchStats();
    } catch (error) {
      console.error('Error al guardar recurso:', error);
      alert('Error al guardar el recurso');
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      nombre: resource.nombre,
      descripcion: resource.descripcion || '',
      clave: resource.clave,
      enlace: resource.enlace,
      tipo_recurso: resource.tipo_recurso,
      imagen: resource.imagen,
      descargas: resource.descargas,
      me_gusta: resource.me_gusta,
      area: resource.area,
      funcion: resource.funcion,
      clasificacion: resource.clasificacion,
      modalidad: resource.modalidad,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este recurso?')) return;

    try {
      const { error } = await supabase.from('recursos').delete().eq('id', id);

      if (error) throw error;
      alert('Recurso eliminado correctamente');
      fetchResources();
      fetchStats();
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
      alert('Error al eliminar el recurso');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      clave: '',
      enlace: '',
      tipo_recurso: 'Documento de PDF',
      imagen: 'documento-pdf 1502 1127.png',
      descargas: 0,
      me_gusta: 0,
      area: 'Seguridad Industrial',
      funcion: 'Manual',
      clasificacion: 'Utilidad Alta',
      modalidad: 'Editable',
    });
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={activeTab === 'panel' ? 'active' : ''}
            onClick={() => setActiveTab('panel')}
          >
            Panel
          </button>
          <button
            className={activeTab === 'recursos' ? 'active' : ''}
            onClick={() => setActiveTab('recursos')}
          >
            Recursos
          </button>
          <button onClick={() => navigate('/')}>Volver al Sitio</button>
        </nav>
      </aside>

      <main className="dashboard-content">
        {activeTab === 'panel' && (
          <div className="panel-section">
            <h1>Panel de Control</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Recursos</h3>
                <p className="stat-number">{stats.totalRecursos}</p>
              </div>
              <div className="stat-card">
                <h3>Total Descargas</h3>
                <p className="stat-number">{stats.totalDescargas}</p>
              </div>
              <div className="stat-card">
                <h3>Total Usuarios</h3>
                <p className="stat-number">{stats.totalUsuarios}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recursos' && (
          <div className="resources-section">
            <div className="section-header">
              <h1>Gestión de Recursos</h1>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingResource(null);
                  resetForm();
                }}
              >
                Nuevo Recurso
              </button>
            </div>

            {showForm && (
              <div className="modal-overlay" onClick={() => setShowForm(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>{editingResource ? 'Editar Recurso' : 'Nuevo Recurso'}</h2>
                  <form onSubmit={handleSubmit} className="resource-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Nombre</label>
                        <input
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Clave</label>
                        <input
                          name="clave"
                          value={formData.clave}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>Descripción</label>
                        <textarea
                          name="descripcion"
                          value={formData.descripcion}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>Enlace de Descarga</label>
                        <input
                          name="enlace"
                          type="url"
                          value={formData.enlace}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Tipo de Recurso</label>
                        <select
                          name="tipo_recurso"
                          value={formData.tipo_recurso}
                          onChange={handleInputChange}
                        >
                          <option>Documento de Word</option>
                          <option>Documento de Excel</option>
                          <option>Documento de Powerpoint</option>
                          <option>Documento de PDF</option>
                          <option>Archivo de Imagen</option>
                          <option>Archivo de Video</option>
                          <option>Página Web</option>
                          <option>Aplicación Móvil</option>
                          <option>Software</option>
                          <option>Video/canal Youtube</option>
                          <option>Otros</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Área</label>
                        <select name="area" value={formData.area} onChange={handleInputChange}>
                          <option>Seguridad Industrial</option>
                          <option>Salud Laboral</option>
                          <option>Proteccion Civil</option>
                          <option>Medio Ambiente</option>
                          <option>Sistemas de Gestión</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Función</label>
                        <select name="funcion" value={formData.funcion} onChange={handleInputChange}>
                          <option>Manual</option>
                          <option>Guia</option>
                          <option>Formato</option>
                          <option>Procedimiento</option>
                          <option>Normativa</option>
                          <option>Evaluación</option>
                          <option>Programa</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Clasificación</label>
                        <select
                          name="clasificacion"
                          value={formData.clasificacion}
                          onChange={handleInputChange}
                        >
                          <option>Utilidad Alta</option>
                          <option>Utilidad Media</option>
                          <option>Utilidad Baja</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Modalidad</label>
                        <select
                          name="modalidad"
                          value={formData.modalidad}
                          onChange={handleInputChange}
                        >
                          <option>Editable</option>
                          <option>No editable</option>
                        </select>
                      </div>

                      <div className="form-group full-width">
                        <label>Nombre de Imagen</label>
                        <input
                          name="imagen"
                          value={formData.imagen}
                          onChange={handleInputChange}
                          placeholder="documento-pdf 1502 1127.png"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingResource(null);
                        }}
                        className="secondary-button"
                      >
                        Cancelar
                      </button>
                      <button type="submit">Guardar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="resources-table">
              <table>
                <thead>
                  <tr>
                    <th>Clave</th>
                    <th>Nombre</th>
                    <th>Área</th>
                    <th>Tipo</th>
                    <th>Descargas</th>
                    <th>Me Gusta</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr key={resource.id}>
                      <td className="code-text">{resource.clave}</td>
                      <td>{resource.nombre}</td>
                      <td>{resource.area}</td>
                      <td>{resource.tipo_recurso}</td>
                      <td>{resource.descargas}</td>
                      <td>{resource.me_gusta}</td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(resource)} className="edit-btn">
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="delete-btn"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
