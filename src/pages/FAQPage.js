import React from "react";
import "../styles/_faq.scss";

export default function FAQPage() {
  return (
    <div className="faq-page">
      <section className="faq">
        <h2>❓ Foire Aux Questions</h2>

        <div className="faq-container">
          <div className="faq-item">
            <h3>📅 Comment réserver un cours ?</h3>
            <p>
              Réserver un cours est simple : il suffit de se rendre sur la <a href="/contact">page de contact</a> et de remplir le formulaire. Je vous recontacterai rapidement pour fixer un créneau qui vous convient !
            </p>
          </div>

          <div className="faq-item">
            <h3>🎯 Quels niveaux sont acceptés ?</h3>
            <p>
              J’accompagne les élèves du collège au lycée, pour une remise à niveau, un perfectionnement ou une préparation aux examens (brevet, bac). Peu importe votre niveau actuel, mon objectif est de vous faire progresser à votre rythme.
            </p>
          </div>

          <div className="faq-item">
            <h3>🖥️ Cours en ligne ou en présentiel ?</h3>
            <p>
              Les cours peuvent avoir lieu en visioconférence avec partage d’écran et support interactif, ou en présentiel à Marcy-l'Étoile, selon votre préférence.
            </p>
          </div>

          <div className="faq-item">
            <h3>⏳ Combien de temps dure un cours ?</h3>
            <p>
              Une séance individuelle dure 1 heure, mais des sessions plus longues peuvent être organisées sur demande. Pour les packs de suivi, la durée et la fréquence sont ajustées en fonction des besoins.
            </p>
          </div>

          <div className="faq-item">
            <h3>💳 Quels sont les moyens de paiement acceptés ?</h3>
            <p>
              Paiement par virement bancaire, PayPal ou en espèces (pour les cours en présentiel). Une facture est fournie sur demande.
            </p>
          </div>

          <div className="faq-item">
            <h3>📌 Annulation ou report d’un cours ?</h3>
            <p>
              Un cours peut être annulé ou reporté avec minimum 24h d’avance. Toute annulation tardive est considérée comme due, sauf cas exceptionnel.
            </p>
          </div>

          <div className="faq-item">
            <h3>🚀 Quelle est la méthodologie utilisée ?</h3>
            <p>
              J’adapte les cours avec une approche personnalisée et progressive : explications concrètes, exercices sur-mesure, et suivi régulier. Plus de détails sur ma <a href="/methodologie">page méthodologie</a>.
            </p>
          </div>

          <div className="faq-item">
            <h3>📝 Suivi entre les séances ?</h3>
            <p>
              Oui ! Vous pouvez me poser des questions par mail ou message entre les séances pour un suivi optimal.
            </p>
          </div>

          <div className="faq-item">
            <h3>📈 En combien de temps peut-on voir des progrès ?</h3>
            <p>
              Chaque élève progresse différemment, mais en général, les améliorations sont visibles dès quelques séances.
            </p>
          </div>
        </div>

        <p className="cta-text">
          Une autre question ? Contactez-moi directement 👉 <a href="/contact" className="cta-link">Me poser une question</a>
        </p>
      </section>
    </div>
  );
}
