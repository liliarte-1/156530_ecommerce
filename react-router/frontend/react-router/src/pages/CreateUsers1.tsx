import { useState } from "react";
/**
 * useNavigate: Hook for programmatic navigation.
 * - Returns a function to navigate to different routes
 * - Useful after form submissions, button clicks, etc.
 * - Unlike <Link>, this is used in event handlers, not JSX
 */
import { useNavigate } from "react-router";
import { createUser } from "../api/users1";
import "./CreateUsers1.css";

export default function CreateUser() {
  // Get the navigate function to redirect user after actions
  const navigate = useNavigate();
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createUser({
        username,
        email,
        password,
      });

      // redirect to home after successful creation
      // This is equivalent to clicking a <Link to="/">
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-user">
      <h1>Create new user</h1>
      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-group">
          <label htmlFor="name">User name</label>
          <input
            type="text"
            id="name"
            value={username}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter username"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
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
          />
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Creating..." : "Create User"}
          </button>
          {/* navigate() can also be called in onClick handlers */}
          <button type="button" onClick={() => navigate("/")} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
