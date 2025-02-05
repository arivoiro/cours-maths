import React from "react";
import "../styles/_hero.scss";

export default function Hero() {
  return (
    <section className="hero">
      <h2>📚 <span>Des cours adaptés à chaque élève</span></h2>
      <p>
        J'accompagne les <strong>collégiens et lycéens (6e à Terminale)</strong> en <strong>mathématiques</strong>,
        que ce soit en ligne (visioconférence) ou en présentiel à Marcy-l'Étoile.
      </p>
      <div className="benefits">
        <div className="benefit">✅ Éviter l’échec scolaire</div>
        <div className="benefit">✅ Comprendre chaque notion avec des explications claires</div>
        <div className="benefit">✅ Préparer efficacement le brevet et le bac</div>
      </div>
    </section>
  );
}
