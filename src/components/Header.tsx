import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { RiArrowDownWideFill, RiAccountBox2Line } from "react-icons/ri";
import { LuSunMoon } from "react-icons/lu";

import { SlMagnifier, SlGrid, SlList } from "react-icons/sl";
import { IoMdExit } from "react-icons/io";
import './Header.css';

interface FilterCriterion {
  tipo_recurso: boolean;
  area: boolean;
  funcion: boolean;
  clasificacion: boolean;
  modalidad: boolean;
}

interface HeaderProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: Record<string, string[]>) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export default function Header({ onSearch, onFilterChange, viewMode, onViewModeChange }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFilterCriteria, setShowFilterCriteria] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState<FilterCriterion>({
    tipo_recurso: false,
    area: false,
    funcion: false,
    clasificacion: false,
    modalidad: false,
  });
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCriteriaChange = (criterion: keyof FilterCriterion) => {
    const newCriteria = { ...selectedCriteria, [criterion]: !selectedCriteria[criterion] };
    setSelectedCriteria(newCriteria);

    if (!newCriteria[criterion]) {
      const newFilters = { ...selectedFilters };
      delete newFilters[criterion];
      setSelectedFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  const handleFilterChange = (criterion: string, value: string) => {
    const currentValues = selectedFilters[criterion] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    const newFilters = { ...selectedFilters, [criterion]: newValues };
    if (newValues.length === 0) {
      delete newFilters[criterion];
    }

    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const filterOptions = {
    tipo_recurso: [
      'Documento de Word',
      'Documento de Excel',
      'Documento de Powerpoint',
      'Documento de PDF',
      'Archivo de Imagen',
      'Archivo de Video',
      'Página Web',
      'Aplicación Móvil',
      'Software',
      'Video/canal Youtube',
      'Otros',
    ],
    area: [
      'Seguridad Industrial',
      'Salud Laboral',
      'Proteccion Civil',
      'Medio Ambiente',
      'Sistemas de Gestión',
    ],
    funcion: ['Manual', 'Guia', 'Formato', 'Procedimiento', 'Normativa', 'Evaluación', 'Programa'],
    clasificacion: ['Utilidad Alta', 'Utilidad Media', 'Utilidad Baja'],
    modalidad: ['Editable', 'No editable'],
  };

  return (
    <header className="main-header">
      <div className="header-top">
        <div className="logo-section">
          <Link to="/">
            <div className="app-name">Safety Cloud</div>
            <div className="slogan">Primer Repositorio digital exclusivo para los expertos en prevención de riesgos</div>
          </Link>
        </div>

        <div className="search-section">
          <input
            type="search"
            placeholder="Buscar recursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            <SlMagnifier />
          </button>
        </div>

        <nav className="main-nav">
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/recursos">Recursos</Link>
          <Link to="/apoyo">Apoyo</Link>
          <Link to="/blog">Blog</Link>
        </nav>
      </div>

      <div className="header-bottom">
        <div className="filter-section">
          <div className="filter-dropdown">
            <button onClick={() => setShowFilterCriteria(!showFilterCriteria)}>
              Criterio de filtro
            </button>
            {showFilterCriteria && (
              <div className="dropdown-menu">
                {Object.keys(selectedCriteria).map((criterion) => (
                  <label key={criterion} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedCriteria[criterion as keyof FilterCriterion]}
                      onChange={() => handleCriteriaChange(criterion as keyof FilterCriterion)}
                    />
                    <span>{criterion.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-dropdown">
            <button onClick={() => setShowFilters(!showFilters)}>
              Filtros
            </button>
            {showFilters && (
              <div className="dropdown-menu filters-menu">
                {Object.entries(selectedCriteria).map(([criterion, isSelected]) => {
                  if (!isSelected) return null;
                  return (
                    <div key={criterion} className="filter-group">
                      <div className="filter-group-title">{criterion.replace('_', ' ')}</div>
                      {filterOptions[criterion as keyof typeof filterOptions].map((option) => (
                        <label key={option} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={selectedFilters[criterion]?.includes(option) || false}
                            onChange={() => handleFilterChange(criterion, option)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="view-mode-section">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => onViewModeChange('grid')}
          >
            <SlGrid />
          </button>
          <button
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => onViewModeChange('table')}
          >
            <SlList />
          </button>
        </div>

        <div className="auth-section">
          {user ? (
            <div className="user-menu">
              <button onClick={() => setShowUserMenu(!showUserMenu)}>
                {profile?.username || profile?.email}
                <RiArrowDownWideFill />
              </button>
              {showUserMenu && (
                <div className="dropdown-menu">
                  <Link to="/perfil"><RiAccountBox2Line /> Mi Perfil</Link>
                  <button onClick={toggleTheme}>
                    <LuSunMoon /> Tema: {theme === 'dark' ? 'Oscuro' : 'Claro'}
                  </button>
                  <button onClick={signOut}><IoMdExit /> Cerrar Sesión</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login">
                <button>Iniciar Sesión</button>
              </Link>
              <Link to="/registro">
                <button>Registrarse</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
