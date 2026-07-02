import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, Map as MapIcon, PlusCircle } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-brand">
          <Building2 className="brand-icon" />
          <span className="brand-text">Менеджер недвижимости</span>
        </NavLink>

        <ul className="navbar-nav">
          <li>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
              <Building2 size={18} />
              <span>Галерея</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <MapIcon size={18} />
              <span>Карта</span>
            </NavLink>
          </li>
          {import.meta.env.DEV && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <PlusCircle size={18} />
                <span>Панель админа</span>
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
