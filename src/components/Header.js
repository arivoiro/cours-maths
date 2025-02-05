import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/_header.scss";

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <h1>Allan Rivoiron - Cours particulier de Mathématiques</h1>
        <nav>
          <ul>
            <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Accueil</NavLink></li>
            <li><NavLink to="/methodologie" className={({ isActive }) => isActive ? "active" : ""}>Méthodologie</NavLink></li>
            <li><NavLink to="/tarifs" className={({ isActive }) => isActive ? "active" : ""}>Tarifs</NavLink></li>
            <li><NavLink to="/faq" className={({ isActive }) => isActive ? "active" : ""}>FAQ</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""}>Contact</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
