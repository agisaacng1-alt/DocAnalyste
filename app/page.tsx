'use client';
import Link from 'next/link';
import { UploadCloud, MessageSquareText, FileCheck2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="page">
      <header className="header">
        <div className="wordmark">
  <div>
    <span className="mark">◆</span> DocAnalyste
  </div>
  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 16px', fontWeight: 500 }}>
    Par <span style={{ color: '#0f172a', fontWeight: 600 }}>AG ISAAC NH</span>
  </p>
</div>
        <Link href="/analyser" className="header-cta">
          Ouvrir l'outil <ArrowRight size={14} strokeWidth={2.2} />
        </Link>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">Pour indépendants &amp; petites équipes</p>
          <h1>Vos documents,<br />relus et corrigés en quelques secondes.</h1>
          <p className="hero-sub">
            Chargez un rapport, un contrat ou une note en PDF, Word ou texte. Posez votre question.
            Recevez une analyse claire — corrections, incohérences, suggestions — sans y passer l'après-midi.
          </p>
          <Link href="/analyser" className="cta-primary">
            Commencer une analyse <ArrowRight size={16} strokeWidth={2.2} />
          </Link>
          <p className="hero-note">Aucune carte bancaire requise pour essayer.</p>
        </section>

        <section className="steps">
          <div className="step">
            <span className="step-num">1</span>
            <UploadCloud className="step-icon" size={22} strokeWidth={1.6} />
            <h3>Chargez votre document</h3>
            <p>PDF, Word (.docx), texte ou markdown — glissé-déposé ou sélectionné en un clic.</p>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <MessageSquareText className="step-icon" size={22} strokeWidth={1.6} />
            <h3>Posez votre question</h3>
            <p>Une correction, un résumé, une vérification de cohérence — formulez-la en langage courant.</p>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <FileCheck2 className="step-icon" size={22} strokeWidth={1.6} />
            <h3>Recevez une réponse claire</h3>
            <p>Une analyse structurée, prête à relire ou à transmettre, en quelques secondes.</p>
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <ShieldCheck className="feature-icon" size={20} strokeWidth={1.6} />
            <div>
              <h4>Vos documents restent les vôtres</h4>
              <p>Rien n'est stocké après l'analyse : le fichier est lu, traité, puis oublié.</p>
            </div>
          </div>
          <div className="feature">
            <Sparkles className="feature-icon" size={20} strokeWidth={1.6} />
            <div>
              <h4>Pensé pour un usage quotidien</h4>
              <p>Rapports mensuels, comptes rendus, contrats : un outil pour le travail de tous les jours, pas une démo.</p>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        :root {
          --paper: #FBF8F2;
          --ink: #2B2A28;
          --highlight: #F5B942;
          --trust: #2F5D50;
          --trust-dark: #244A40;
          --muted: #A79C8C;
          --danger: #B8483A;
        }
        * { box-sizing: border-box; }
        body {
          background: var(--paper);
          color: var(--ink);
          font-family: 'IBM Plex Sans', sans-serif;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          max-width: 1040px;
          margin: 0 auto;
          padding: 24px 20px 80px;
          overflow-x: hidden;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 28px;
          border-bottom: 1px solid #E4DECF;
          margin-bottom: 48px;
        }

        .wordmark {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 22px;
          letter-spacing: -0.01em;
        }
        .mark { color: var(--highlight); margin-right: 8px; }

        .header-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--trust);
          text-decoration: none;
          border: 1px solid #CFE0D8;
          padding: 8px 14px;
          border-radius: 7px;
          transition: background 0.15s ease;
        }
        .header-cta:hover { background: #F1F7F4; }

        .hero {
          max-width: 680px;
          margin: 0 auto 72px;
          text-align: center;
        }

        .eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--trust);
          margin: 0 0 16px;
        }

        .hero h1 {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 40px;
          line-height: 1.18;
          letter-spacing: -0.015em;
          margin: 0 0 18px;
        }

        .hero-sub {
          font-size: 16px;
          line-height: 1.6;
          color: #55504A;
          margin: 0 auto 28px;
          max-width: 560px;
        }

        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--trust);
          color: #FBF8F2;
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          padding: 13px 24px;
          border-radius: 9px;
          transition: background 0.15s ease;
        }
        .cta-primary:hover { background: var(--trust-dark); }

        .hero-note {
          margin: 14px 0 0;
          font-size: 12.5px;
          color: var(--muted);
        }

        .steps {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          margin-bottom: 56px;
        }
        @media (min-width: 780px) {
          .steps { grid-template-columns: repeat(3, 1fr); }
        }

        .step {
          background: #FFFEFB;
          border: 1px solid #E9E3D3;
          border-radius: 14px;
          padding: 24px;
          position: relative;
        }

        .step-num {
          position: absolute;
          top: 18px;
          right: 20px;
          font-family: 'Fraunces', serif;
          font-size: 26px;
          font-weight: 600;
          color: #EEE6D3;
        }

        .step-icon { color: var(--trust); margin-bottom: 10px; }

        .step h3 {
          font-family: 'Fraunces', serif;
          font-size: 16.5px;
          font-weight: 600;
          margin: 0 0 8px;
        }
        .step p {
          font-size: 13.5px;
          line-height: 1.55;
          color: #6B6459;
          margin: 0;
          padding-right: 20px;
        }

        .features {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          max-width: 720px;
          margin: 0 auto;
        }
        @media (min-width: 640px) {
          .features { grid-template-columns: 1fr 1fr; }
        }

        .feature {
          display: flex;
          gap: 12px;
          padding: 18px;
          border-radius: 12px;
        }
        .feature-icon { color: var(--trust); flex-shrink: 0; margin-top: 2px; }
        .feature h4 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px;
        }
        .feature p {
          font-size: 13px;
          line-height: 1.55;
          color: #6B6459;
          margin: 0;
        }

        @media (max-width: 480px) {
          .hero h1 { font-size: 30px; }
          .hero-sub { font-size: 14.5px; }
          .header-cta span { display: none; }
        }
      `}</style>
    </div>
  );
}