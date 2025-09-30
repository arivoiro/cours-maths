import React, { useEffect } from "react";
import "../styles/_methodologie.scss";

export default function MethodologiePage() {
  useEffect(() => {
    document.title = "Cours Maths — Méthodologie";
  }, []);
  return (
    <div className="methodologie-page">
      <section className="methodologie">
        <h2>📖 Une Méthodologie Sur-Mesure pour Réussir en Mathématiques</h2>

        <p>
          Chaque élève est unique. Son niveau, ses difficultés et sa manière de comprendre les concepts varient. C’est pourquoi mes cours ne suivent pas une méthode générique, mais une approche 100% personnalisée.
        </p>

        <div className="section">
          <h3>🎯 Diagnostic et Plan Personnalisé</h3>
          <p>
            Dès la première séance, j’évalue les forces et faiblesses de l’élève afin de définir un programme adapté. L’objectif ? Cibler précisément les points à améliorer pour progresser efficacement.
          </p>
        </div>

        <div className="section">
          <h3>📚 Exercices Spécifiques et Concrets</h3>
          <p>
            Fini les exercices copiés des manuels scolaires sans réel intérêt ! J’élabore des exercices sur-mesure adaptés aux besoins de chaque élève :
          </p>
          <ul>
            <li>✅ Problèmes contextualisés pour donner du sens aux maths.</li>
            <li>✅ Progression par paliers : chaque notion est abordée étape par étape.</li>
            <li>✅ Exercices interactifs pour favoriser la compréhension et l’autonomie.</li>
          </ul>
        </div>

        <div className="section">
          <h3>🧠 Comprendre au lieu d’apprendre par cœur</h3>
          <p>
            Mon objectif est que l’élève comprenne réellement les concepts mathématiques, et non qu’il les apprenne par cœur sans logique. Pour cela, j’utilise une approche basée sur :
          </p>
          <ul>
            <li>🔄 Explications imagées pour rendre les notions plus concrètes.</li>
            <li>🎨 Schémas et visualisation : certaines notions abstraites deviennent simples avec une bonne représentation.</li>
            <li>🗣️ Méthode active : l’élève explique à son tour, afin de vérifier s’il a réellement compris.</li>
          </ul>
        </div>

        <div className="section">
          <h3>💡 Motivation et Confiance en Soi</h3>
          <p>
            Un élève motivé et en confiance progresse beaucoup plus vite. C’est pourquoi j’adopte une pédagogie qui :
          </p>
          <ul>
            <li>👏 Valorise chaque progrès, même les petites victoires.</li>
            <li>📈 Fixe des objectifs clairs et atteignables.</li>
            <li>🤝 Apporte un soutien bienveillant, pour que l’élève se sente à l’aise.</li>
          </ul>
        </div>

        <div className="section">
          <h3>📆 Un Suivi Régulier et Adaptatif</h3>
          <p>
            J’ajuste continuellement ma méthode en fonction des progrès de l’élève. Chaque séance permet de :
          </p>
          <ul>
            <li>📊 Évaluer la compréhension et adapter le programme.</li>
            <li>📝 Réviser les notions qui posent problème.</li>
            <li>🚀 Aller plus loin pour ceux qui veulent exceller.</li>
          </ul>
        </div>

        <p className="cta-text">
          Prêt(e) à apprendre les maths autrement et à obtenir des résultats concrets ?  
          <br />
          👉 <a href="/contact" className="cta-link">Réserve dès maintenant ta première séance</a>
        </p>
      </section>
    </div>
  );
}
