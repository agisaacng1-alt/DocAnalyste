'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Loader2 } from 'lucide-react';

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Connexion impossible.");
        return;
      }
      router.push('/analyser');
    } catch {
      setError('La connexion a échoué. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="wordmark">
          <span className="mark">◆</span> DocAnalyste
        </div>
        <h1>Connexion</h1>
        <p className="sub">Entrez votre email pour accéder à votre compte et vos crédits.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-wrap">
            <Mail size={16} strokeWidth={2} className="input-icon" />
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? <><Loader2 className="spin" size={16} /> Connexion…</> : 'Continuer →'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        :root {
          --paper: #FBF8F2; --ink: #2B2A28; --highlight: #F5B942;
          --trust: #2F5D50; --trust-dark: #244A40; --muted: #A79C8C; --danger: #B8483A;
        }
        * { box-sizing: border-box; }
        body { background: var(--paper); color: var(--ink); font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .card {
          width: 100%;
          max-width: 380px;
          background: #FFFEFB;
          border: 1px solid #E9E3D3;
          border-radius: 16px;
          padding: 32px 28px;
        }
        .wordmark {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 19px;
          margin-bottom: 24px;
        }
        .mark { color: var(--highlight); margin-right: 6px; }
        h1 {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 600;
          margin: 0 0 6px;
        }
        .sub {
          font-size: 13.5px;
          color: #6B6459;
          margin: 0 0 22px;
          line-height: 1.5;
        }
        .input-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #E1DAC7;
          border-radius: 9px;
          padding: 11px 13px;
          margin-bottom: 14px;
        }
        .input-icon { color: var(--muted); flex-shrink: 0; }
        .input-wrap input {
          border: none;
          outline: none;
          background: none;
          font-size: 14.5px;
          width: 100%;
          color: var(--ink);
          font-family: 'IBM Plex Sans', sans-serif;
        }
        button {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--trust);
          color: #FBF8F2;
          border: none;
          border-radius: 9px;
          padding: 12px;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
        }
        button:hover:not(:disabled) { background: var(--trust-dark); }
        button:disabled { opacity: 0.7; cursor: not-allowed; }
        .error {
          margin-top: 12px;
          font-size: 13px;
          color: var(--danger);
        }
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
