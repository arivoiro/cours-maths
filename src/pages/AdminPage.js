import React, { useState, useCallback, useEffect } from "react";
import "../styles/_admin.scss";

export default function AdminPage() {
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("adminToken", data.token);
      } else {
        setError(data.error || "Login échoué");
      }
    } catch (err) {
      setError("Erreur réseau");
    }
  };

  // ← Modification ici : vider le champ password lors de la déconnexion
  const logout = () => {
    setToken("");
    setMessages([]);
    setPassword(""); // Vide le champ mot de passe
    localStorage.removeItem("adminToken");
  };

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchMessages();
  }, [token, fetchMessages]);

  if (!token) {
    return (
      <div className="admin-page center-content">
        <div className="login-box">
          <h2>🔒 Login admin</h2>
          <form onSubmit={login}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
            />
            <button type="submit">Se connecter</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2 className="center-content">📩 Messages reçus</h2>
      {loading ? (
        <p className="center-content">Chargement...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id}>
                <td>{msg.id}</td>
                <td>{msg.nom}</td>
                <td>{msg.email}</td>
                <td>{msg.message}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={async () => {
                      if (!window.confirm("Supprimer ce message ?")) return;
                      await fetch(`http://localhost:5000/api/contact/${msg.id}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                      });
                      setMessages(messages.filter((m) => m.id !== msg.id));
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <footer className="admin-footer">
        <button className="logout-btn" onClick={logout}>
          Déconnexion
        </button>
      </footer>
    </div>
  );
}
