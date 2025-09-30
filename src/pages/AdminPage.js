import React, { useState, useCallback, useEffect } from "react";
import "../styles/_admin.scss";

const API_URL = process.env.REACT_APP_API_URL || "https://maths-par-allan.onrender.com";

export default function AdminPage() {
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalMessages, setTotalMessages] = useState(0);

  // --- LOGIN ---
  const login = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        if (res.status === 401) setError("Mot de passe incorrect");
        else if (res.status === 500) setError("Erreur serveur, réessayez plus tard");
        else setError(`Erreur inconnue : ${res.status}`);
        return;
      }

      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("adminToken", data.token);
      } else {
        setError("Aucun token reçu du serveur");
      }
    } catch (err) {
      setError("Erreur réseau : impossible de joindre le backend.");
      console.error(err);
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    setToken("");
    setMessages([]);
    setPassword("");
    localStorage.removeItem("adminToken");
  };

  // --- FETCH MESSAGES ---
  const fetchMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contact?page=${page}&limit=${limit}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) setError("Token manquant, veuillez vous reconnecter");
        else if (res.status === 403) setError("Token invalide ou expiré");
        else if (res.status === 500) setError("Erreur serveur lors de la récupération des messages");
        setMessages([]);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
        setTotalMessages(data.total || data.messages.length);
      } else {
        setError("Format inattendu reçu depuis le backend");
        setMessages([]);
        setTotalMessages(0);
      }
    } catch (err) {
      setError("Erreur réseau : impossible de joindre le backend");
      console.error(err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, limit]);

  useEffect(() => {
    if (token) fetchMessages();
  }, [token, page, fetchMessages]);

  // --- DELETE MESSAGE ---
  const deleteMessage = async (id) => {
    if (!window.confirm("Supprimer ce message ?")) return;
    try {
      const res = await fetch(`${API_URL}/api/contact/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) {
        alert(`Erreur lors de la suppression : ${res.status}`);
        return;
      }

      const newTotal = totalMessages - 1;
      const newTotalPages = Math.ceil(newTotal / limit);
      if (page > newTotalPages && page > 1) setPage(page - 1);
      else fetchMessages();
    } catch (err) {
      alert("Erreur réseau lors de la suppression");
      console.error(err);
    }
  };

  const totalPages = Math.ceil(totalMessages / limit);

  // --- LOGIN FORM ---
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

  // --- ADMIN PANEL ---
  return (
    <div className="admin-page">
      <h2 className="center-content">📩 Messages reçus</h2>

      {loading ? (
        <p className="center-content">Chargement...</p>
      ) : (
        <>
          {error && <p className="error center-content">{error}</p>}
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Message</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(messages || []).map((msg, index) => (
                <tr key={msg.id}>
                  <td>{(page - 1) * limit + index + 1}</td>
                  <td>{msg.nom}</td>
                  <td>{msg.email}</td>
                  <td>{msg.message}</td>
                  <td>
                    <button className="delete-btn" onClick={() => deleteMessage(msg.id)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-messages">Aucun message pour le moment.</td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                ← Précédent
              </button>
              <span className="page-number">
                Page {page} / {totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Suivant →
              </button>
            </div>
          )}
        </>
      )}

      <footer className="admin-footer">
        <button className="logout-btn" onClick={logout}>Déconnexion</button>
      </footer>
    </div>
  );
}
