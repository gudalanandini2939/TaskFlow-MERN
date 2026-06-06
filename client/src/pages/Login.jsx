import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_AUTH_URL = "https://taskflow-mern-qrle.onrender.com/auth";
function Login() {
  const [active, setActive] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loginMessage, setLoginMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoginMessage("");

    if (!loginEmail || !loginPassword) {
      setLoginMessage("Please enter email and password");
      return;
    }

    try {
      const response = await fetch(`${API_AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      setLoginMessage("Server not connected");
    }
  };

  const handleRegister = async () => {
    setRegisterMessage("");

    if (!registerName || !registerEmail || !registerPassword) {
      setRegisterMessage("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${API_AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRegisterMessage(data.message || "Registration failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      setRegisterMessage("Server not connected");
    }
  };

  return (
    <div className="auth-page">
      <div className="animated-bg"></div>

      <div className={`auth-card ${active ? "active" : ""}`}>
        <div className="form-box login">
          <h2>Sign In</h2>

          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />

          <div className="password-box">
            <input
              type={showLoginPassword ? "text" : "password"}
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
            >
              {showLoginPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <a href="#">Forgot Password?</a>

          <p className="message">{loginMessage}</p>

          <button type="button" className="login-btn" onClick={handleLogin}>
            Sign In
          </button>
        </div>

        <div className="form-box register">
          <h2>Create Account</h2>

          <input
            type="text"
            placeholder="Username"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
          />

          <div className="password-box">
            <input
              type={showRegisterPassword ? "text" : "password"}
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() =>
                setShowRegisterPassword(!showRegisterPassword)
              }
            >
              {showRegisterPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <p className="message">{registerMessage}</p>

          <button type="button" className="login-btn" onClick={handleRegister}>
            Create Account
          </button>
        </div>

        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Build better habits ✨</h1>
            <p>Plan your day, track progress, and stay one step ahead.</p>

            <button
              type="button"
              className="outline-btn"
              onClick={() => setActive(true)}
            >
              Create Account
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome back, achiever! 🚀</h1>
            <p>Your tasks are waiting. Let's make today productive.</p>

            <button
              type="button"
              className="outline-btn"
              onClick={() => setActive(false)}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;