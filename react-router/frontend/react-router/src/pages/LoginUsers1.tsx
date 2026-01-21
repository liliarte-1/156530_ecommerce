import { useState } from "react";
import { useNavigate } from "react-router";
import { oauthLogin } from "../api/users1";
import { saveToken } from "../api/users1";
import { logout } from "../api/users1";
import "./LoginUsers1.css";

export default function LoginUser() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await oauthLogin(email, password);

      saveToken(token.access_token);
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
  logout();
  navigate("/products");
  }


  return (
    <div className="login-user">
      <h1>Login User</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
      <button
        type="button"
        onClick={handleLogout}
        className="cancel-btn">
        Logout
      </button>
    </div>

    </div>
  );
}
