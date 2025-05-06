import React from 'react';
import './Login.css';  // Import your CSS file

function Login() {
  const loginWithGitHub = () => {
    // Redirect to GitHub OAuth2 login
    window.location.href = "http://localhost:8080/oauth2/authorization/github";
  };

  const loginWithGoogle = () => {
    // Redirect to Google OAuth2 login (replace with your URL)
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="login-container">
      <img 
        src="https://www.smartwarehousing.com/hubfs/illustration-of-automatic-logistics-management.png" 
        alt="Logistics Management" 
        className="image-style" 
      />
      <div className="button-container">
      <img
              src="https://media.licdn.com/dms/image/D560BAQF6CchqkqZEEQ/company-logo_200_200/0/1704887637105/techjyot___india_logo?e=2147483647&v=beta&t=S1jLov5GABl39n8XPksGcm8GIQsmvMTLl84RwYZNL-8"
              alt="TechJyot Logo"
            />
        <button className="login-button google" onClick={loginWithGoogle}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google.png" 
            alt="Google Logo" 
            className="logo" 
          />
          Login with Google
        </button>
        <button className="login-button github" onClick={loginWithGitHub}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" 
            alt="GitHub Logo" 
            className="logo" 
          />
          Login with GitHub
        </button>
      </div>
    </div>
  );
}

export default Login;
