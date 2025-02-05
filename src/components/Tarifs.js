import React from "react";
import { Link } from "react-router-dom"; // Import de Link
import "../styles/_tarifs.scss";

const tarifs = [
  { title: <><span className="emoji">🧑‍🏫</span> Séance individuelle (1h)</>, price: "30€/h", color: "blue" },
  { title: <><span className="emoji">🆕</span> Premier cours découverte</>, price: "20€/h", color: "purple" },
  { title: <><span className="emoji">📚</span> Pack suivi régulier (2 séances/semaine)</>, price: "25€/h", color: "orange" },
  { title: <><span className="emoji">👥</span> Cours en petits groupes (max 3 élèves)</>, price: "20€/h par élève", color: "green" }
];

export default function Tarifs() {
  return (
    <section className="tarifs">
      <h2>📈 Tarifs des cours</h2>
      <div className="grid">
        {tarifs.map((item, index) => (
          <Link to="/contact" key={index} className="tarif-link">
            <div className={`tarif-card ${item.color}`}>
              <h3>{item.title}</h3>
              <p className="price">{item.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
