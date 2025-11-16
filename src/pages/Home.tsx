import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

import Header from '../components/Header';
import ResourceCard from '../components/ResourceCard';
import './Home.css';

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

export default function Home() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 20;

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('recursos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
      setFilteredResources(data || []);
    } catch (error) {
      console.error('Error al cargar recursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredResources(resources);
      setCurrentPage(1);
      return;
    }

    const filtered = resources.filter(
      (resource) =>
        resource.nombre.toLowerCase().includes(query.toLowerCase()) ||
        resource.descripcion?.toLowerCase().includes(query.toLowerCase()) ||
        resource.clave.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredResources(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (filters: Record<string, string[]>) => {
    if (Object.keys(filters).length === 0) {
      setFilteredResources(resources);
      setCurrentPage(1);
      return;
    }

    const filtered = resources.filter((resource) => {
      return Object.entries(filters).every(([criterion, values]) => {
        if (values.length === 0) return true;
        return values.includes(resource[criterion as keyof Resource] as string);
      });
    });

    setFilteredResources(filtered);
    setCurrentPage(1);
  };

  const handleDownload = async (resourceId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para descargar recursos');
      return;
    }

    try {
      const resource = resources.find((r) => r.id === resourceId);
      if (!resource) return;

      await supabase.from('descargas').insert({
        user_id: user.id,
        recurso_id: resourceId,
      });

      await supabase
        .from('recursos')
        .update({ descargas: resource.descargas + 1 })
        .eq('id', resourceId);

      window.open(resource.enlace, '_blank');

      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, descargas: r.descargas + 1 } : r))
      );
      setFilteredResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, descargas: r.descargas + 1 } : r))
      );

      setTimeout(() => {
        const shouldRate = confirm('¿Te gustaría calificar este recurso?');
        if (shouldRate) {
          handleRateResource(resourceId);
        }
      }, 2000);
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  const handleRateResource = async (resourceId: string) => {
    if (!user) return;

    try {
      const resource = resources.find((r) => r.id === resourceId);
      if (!resource) return;

      await supabase.from('calificaciones').insert({
        user_id: user.id,
        recurso_id: resourceId,
        calificacion: true,
      });

      await supabase
        .from('recursos')
        .update({ me_gusta: resource.me_gusta + 1 })
        .eq('id', resourceId);

      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, me_gusta: r.me_gusta + 1 } : r))
      );
      setFilteredResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, me_gusta: r.me_gusta + 1 } : r))
      );

      alert('¡Gracias por tu calificación!');
    } catch (error) {
      console.error('Error al calificar:', error);
    }
  };

  const indexOfLastResource = currentPage * resourcesPerPage;
  const indexOfFirstResource = indexOfLastResource - resourcesPerPage;
  const currentResources = filteredResources.slice(indexOfFirstResource, indexOfLastResource);
  const totalPages = Math.ceil(filteredResources.length / resourcesPerPage);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Cargando recursos...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <main className="main-content">
        {filteredResources.length === 0 ? (
          <div className="no-results">
            <h2>No se encontraron recursos</h2>
            <p>Intenta ajustar tus filtros o búsqueda</p>
          </div>
        ) : (
          <>
            <div className={`resources-container ${viewMode}-mode`}>
              {currentResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  viewMode={viewMode}
                  onDownload={handleDownload}
                  isAuthenticated={!!user}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>

                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? 'active' : ''}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
