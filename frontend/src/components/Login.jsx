import { useState } from "react";
import { API } from "../hotel";

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      onLogin(data.token);
    } catch {
      setError("Server is not responding. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <img src="/img/haya-logo.webp" alt="Haya HMS logo" />
        <h2>Staff Login</h2>
        <p>Sign in to manage rooms, guests and bookings.</p>

        {error && <div className="login-error">{error}</div>}

        <input
          name="username"
          placeholder="Username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="hms-btn" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </section>
  );
}

export default Login;
