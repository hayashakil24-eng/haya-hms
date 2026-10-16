import { useState } from "react";
import { API } from "../hotel";

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

        <div className="login-field">
          <i className="fa fa-user"></i>
          <input
            name="username"
            placeholder="Username"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="login-field">
          <i className="fa fa-lock"></i>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
          </button>
        </div>
        <button type="submit" className="hms-btn" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </section>
  );
}

export default Login;
