import { CredentialTypes } from "rembase-web";
import { rembaseApp } from "./backend";
import { useState } from "react";

function LoginPage() {
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendOTP() {
    if (!contact) {
      setError("Please enter a contact number");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await rembaseApp?.sendWhatsappOTP(contact);
      setOtpSent(true);
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      console.error("OTP send error:", err);
    } finally {
      setLoading(false);  
    }
  }

  async function login(e) {
    e.preventDefault();
    
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      console.log(otp);
      await rembaseApp?.login(CredentialTypes?.whatsapp("+919318455101", otp));
    } catch (err) {
      setError("Login failed. Please try again.");
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
          <label htmlFor="contact">Contact Number:</label>
          <input 
            type="text" 
            id="contact" 
            name="contact" 
            value={contact} 
            onChange={(e) => setContact(e.target.value)}
            placeholder="Enter contact number"
            disabled={loading}
          />
        </div>
        
        {!otpSent ? (
          <button 
            type="button" 
            onClick={sendOTP}
            disabled={loading || !contact}
            className="btn-primary"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <div className="form-group">
            <label htmlFor="otp">OTP:</label>
            <input 
              type="text" 
              id="otp" 
              name="otp" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              disabled={loading}
            />
          </div>
        )}
        
        {otpSent && (
          <button 
            type="submit" 
            disabled={loading || !otp}
            className="btn-primary"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        )}
        
        {error && <p className="error-message">{error}</p>}
        
        <p className="forgot-password">
          <a href="#">Forgot Password?</a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;