'use client';

export default function ForgotPassword() {
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      <h1>Forgot Password</h1>
      <p>If you need assistance with your password, please contact the admin on WhatsApp.</p>
      <a 
        href="https://wa.link/np4c4a" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ color: 'green', textDecoration: 'underline' }}
      >
        Contact Admin on WhatsApp
      </a>
    </div>
  );
}
