import React from "react";
import ContactInfo from "./ContactInfo";
import "../styles/_footer.scss";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <ContactInfo />
        <div className="footer-bottom">
          <p>© 2025 Allan Rivoiron - Tous droits réservés</p>
          <ul>
            <li><a href="/mentions-legales">Mentions légales</a></li>
            <li><a href="/politique-confidentialite">Politique de confidentialité</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
