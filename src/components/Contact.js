import React, { useState } from "react";
import "../styles/_contact.scss";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.target);

    try {
      const response = await fetch("https://formspree.io/f/mgvoybzr", {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError("❌ Une erreur est survenue, veuillez réessayer.");
      }
    } catch (err) {
      setError("❌ Impossible d'envoyer le message, vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-wrapper">
      <section className="contact">
        {!submitted && ( // Masquer titre et paragraphe après envoi
          <>
            <h2>📞 Contact & Réservation</h2>
            <p>Réservez un premier cours dès maintenant et donnez à votre enfant toutes les chances de réussir !</p>
          </>
        )}

        {submitted ? (
          <p className="success-message">✅ Merci ! Votre demande a bien été envoyée.</p>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <label htmlFor="name">Nom :</label>
            <input type="text" id="name" name="name" required />

            <label htmlFor="email">Adresse email :</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="message">Message :</label>
            <textarea id="message" name="message" required></textarea>

            {/* Champ caché anti-spam */}
            <input type="text" name="_gotcha" style={{ display: "none" }} />

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="cta" disabled={loading}>
              {loading ? "📨 Envoi en cours..." : "📩 Envoyer"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
