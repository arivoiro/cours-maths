import React, { useState, useCallback, useEffect } from "react";
import "../styles/_admin.scss";

export default function AdminPage() {
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalMessages, setTotalMessages] = useState(0);

  // --- LOGIN ---
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
      const res = await fetch(`http://localhost:5000/api/contact?page=${page}&limit=${limit}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();

      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
        setTotalMessages(data.total || data.messages.length);
      } else {
        console.error("Format inattendu reçu depuis le backend:", data);
        setMessages([]);
        setTotalMessages(0);
      }
    } catch (err) {
      console.error("Erreur lors du fetch des messages:", err);
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
      await fetch(`http://localhost:5000/api/contact/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      // Si c'était le dernier message de la page, on revient à la page précédente
      const newTotal = totalMessages - 1;
      const newTotalPages = Math.ceil(newTotal / limit);

      if (page > newTotalPages && page > 1) {
        setPage(page - 1);
      } else {
        fetchMessages();
      }

    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
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

          {/* --- PAGINATION --- */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Précédent
              </button>
              <span className="page-number">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}

      <footer className="admin-footer">
        <button className="logout-btn" onClick={logout}>
          Déconnexion
        </button>
      </footer>
    </div>
  );
}
