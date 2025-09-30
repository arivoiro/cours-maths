import React, { useState } from "react";
import "../styles/_contact.scss";

const API_URL = process.env.REACT_APP_API_URL || "https://maths-par-allan.onrender.com";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const nom = event.target.name.value;
    const email = event.target.email.value;
    const message = event.target.message.value;

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, message }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else if (response.status === 400) {
        setError("❌ Veuillez remplir tous les champs.");
      } else if (response.status === 500) {
        setError("❌ Erreur serveur, veuillez réessayer plus tard.");
      } else {
        setError(`❌ Erreur inconnue : ${response.status}`);
      }
    } catch (err) {
      setError("❌ Impossible d'envoyer le message. Vérifiez votre connexion et que le backend est en ligne.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-wrapper">
      <section className="contact">
        {!submitted && (
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
