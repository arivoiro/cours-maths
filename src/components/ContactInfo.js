import React from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import "../styles/_contactinfo.scss";

export default function ContactInfo() {
  return (
    <div className="contact-info">
      <div className="contact-item">
        <FaMapMarkerAlt className="icon" />
        <span>Marcy-l'Étoile, France</span>
      </div>
      <div className="contact-item">
        <FaEnvelope className="icon" />
        <a href="mailto:allan.rivoiron@example.com">allan.rivoiron02@gmail.com</a>
      </div>
      <div className="contact-item">
        <FaPhone className="icon" />
        <a href="tel:+33669092716">+33 6 69 09 27 16</a>
      </div>
    </div>
  );
}
