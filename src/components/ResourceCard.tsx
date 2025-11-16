import { supabase } from '../lib/supabase';
import { PiDownload } from "react-icons/pi";
import { BiLike } from "react-icons/bi";

import './ResourceCard.css';

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

interface ResourceCardProps {
  resource: Resource;
  viewMode: 'grid' | 'table';
  onDownload: (resourceId: string) => void;
  isAuthenticated: boolean;
}

export default function ResourceCard({ resource, viewMode, onDownload, isAuthenticated }: ResourceCardProps) {
  const getImageUrl = () => {
    const { data } = supabase.storage
      .from('recursos-publicos')
      .getPublicUrl(`assets-img/${resource.imagen}`);
    return data.publicUrl;
  };

  const handleDownloadClick = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para descargar recursos');
      return;
    }
    onDownload(resource.id);
  };

  if (viewMode === 'table') {
    return (
      <div className="resource-card table-view">
        <img src={getImageUrl()} alt={resource.nombre} className="resource-image-table" />
        <div className="resource-content-table">
          <div className="resource-header-table">
            <h3>{resource.nombre}</h3>
            <span className="resource-code">{resource.clave}</span>
          </div>
          <p className="resource-description">{resource.descripcion}</p>
          <div className="resource-tags">
            <span className="tag">{resource.area}</span>
            <span className="tag">{resource.funcion}</span>
            <span className="tag">{resource.tipo_recurso}</span>
            <span className="tag">{resource.clasificacion}</span>
            <span className="tag">{resource.modalidad}</span>
          </div>
          <div className="resource-stats">
            <span><PiDownload /> {resource.descargas} descargas</span>
            <span><BiLike /> {resource.me_gusta} me gusta</span>
          </div>
        </div>
        <button onClick={handleDownloadClick} className="download-button">
          Descargar
        </button>
      </div>
    );
  }

  return (
    <div className="resource-card grid-view">
      <div className="resource-image-container">
        <img src={getImageUrl()} alt={resource.nombre} className="resource-image" />
      </div>
      <div className="resource-content">
        <div className="resource-header">
          <h3>{resource.nombre}</h3>
          <span className="resource-code">{resource.clave}</span>
        </div>
        <p className="resource-description">{resource.descripcion}</p>
        <div className="resource-tags">
          <span className="tag">{resource.area}</span>
          <span className="tag">{resource.tipo_recurso}</span>
        </div>
        <div className="resource-meta">
          <span className="meta-item">{resource.funcion}</span>
          <span className="meta-item">{resource.clasificacion}</span>
          <span className="meta-item">{resource.modalidad}</span>
        </div>
        <div className="resource-stats">
          <span><PiDownload /> {resource.descargas}</span>
          <span><BiLike /> {resource.me_gusta}</span>
        </div>
        <button onClick={handleDownloadClick} className="download-button">
          Descargar
        </button>
      </div>
    </div>
  );
}
