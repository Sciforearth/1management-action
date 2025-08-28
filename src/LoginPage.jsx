import { CredentialTypes } from "rembase-web";
import { rembaseApp } from "./backend";
import { useState } from "react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(e) {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await rembaseApp?.login(CredentialTypes?.email_password(email, password));
      window.location.href= "/"
    } catch (err) {
      setError("Login failed. Please check your email and password.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={login}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !email || !password}
          className="btn-primary"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        
        {error && <p className="error-message">{error}</p>}
        
        <p className="forgot-password">
          <a href="#">Forgot Password?</a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;