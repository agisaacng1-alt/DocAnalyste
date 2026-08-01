'use client';
import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, X, RotateCcw, AlertTriangle, Loader2, Zap, MessagesSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ACCEPTED = '.pdf,.docx,.txt,.md';
const MAX_SIZE = 15 * 1024 * 1024; // 15 Mo

const AUTO_PROMPT =
  "Analyse ce document en profondeur : identifie les forces, les faiblesses et propose des suggestions d'amélioration concrètes. Structure ta réponse avec des sections claires.";

type Mode = 'auto' | 'guide';
type ChatMessage = { role: 'user' | 'assistant'; content: string };

function normalizeMarkdownLists(md: string) {
  const lines = md.split('\n');
  const isListLine = (l: string) => /^\s*([*+-]|\d+\.)\s+/.test(l);
  const out: string[] = [];
  for (const line of lines) {
    const prev = out[out.length - 1];
    if (isListLine(line) && prev !== undefined && prev.trim() !== '' && !isListLine(prev)) {
      out.push('');
    }
    out.push(line);
  }
  return out.join('\n');
}

function ExtBadge({ name }: { name: string }) {
  const ext = (name.split('.').pop() || '').toUpperCase();
  const cls = ext === 'PDF' ? 'badge-pdf' : ext === 'DOCX' ? 'badge-docx' : 'badge-txt';
  return <span className={`ext-badge ${cls}`}>{ext}</span>;
}

export default function Home() {
  const [fileName, setFileName] = useState('');
  const [fileText, setFileText] = useState('');
  const [mode, setMode] = useState<Mode>('auto');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError('');
    setMessages([]);

    if (file.size > MAX_SIZE) {
      setError('Ce fichier dépasse 15 Mo. Choisissez un fichier plus léger.');
      return;
    }

    setUploading(true);
    setFileName('');
    setFileText('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/extract', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Impossible de lire ce fichier.");
        return;
      }

      setFileText(data.text);
      setFileName(data.filename);
    } catch {
      setError('La connexion a échoué pendant la lecture du fichier. Réessayez.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearFile = () => {
    setFileName('');
    setFileText('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const askClaude = async (overrideContent?: string) => {
    const content = (overrideContent ?? question).trim();
    if (!fileText || !content) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setQuestion('');
    setAsking(true);
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ documentText: fileText, messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "La question n'a pas pu être traitée.");
        return;
      }
      setMessages([...nextMessages, { role: 'assistant', content: data.text }]);
    } catch {
      setError('La connexion a échoué pendant l’analyse. Réessayez.');
    } finally {
      setAsking(false);
    }
  };

  const reset = () => {
    clearFile();
    setMode('auto');
    setQuestion('');
    setMessages([]);
    setError('');
  };

  const isFirstAutoTurn = mode === 'auto' && messages.length === 0;
  const canAsk = !!fileText && !asking && (isFirstAutoTurn || question.trim().length > 0);

  const mainButtonLabel = asking
    ? (isFirstAutoTurn ? 'Génération du rapport…' : 'Rédaction de la réponse…')
    : (isFirstAutoTurn ? 'Générer le rapport complet →' : messages.length === 0 ? 'Analyser →' : 'Envoyer →');

  return (
    <div className="page">
      <header className="header">
        <div className="wordmark" style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <span className="mark">◆</span> DocAnalyste
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginTop: '2px', paddingLeft: '16px' }}>
            Par <strong style={{ color: '#0f172a' }}>AG ISAAC NH</strong>
          </span>
        </div>
        <button className="reset-btn" onClick={reset}>
          <RotateCcw size={13} strokeWidth={2.2} /> <span>Nouveau</span>
        </button>
      </header>

      <main className="board">
        {/* SECTION 1 & 2 : Document et Mode */}
        <section className="card">
          <p className="step-label">1 · Votre document</p>

          {!fileName ? (
            <div
              className={`dropzone ${dragOver ? 'is-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleFileUpload}
                className="sr-only"
              />
              {uploading ? (
                <>
                  <Loader2 className="spin" size={26} strokeWidth={1.75} />
                  <p className="dz-text">Lecture du fichier…</p>
                </>
              ) : (
                <>
                  <UploadCloud className="dz-icon" size={26} strokeWidth={1.5} />
                  <p className="dz-text">Glissez un fichier ici, ou cliquez pour en choisir un</p>
                  <p className="dz-sub">PDF, Word (.docx), texte (.txt, .md) — 15 Mo max</p>
                </>
              )}
            </div>
          ) : (
            <div className="file-chip">
              <CheckCircle2 className="file-check" size={18} strokeWidth={2} />
              <ExtBadge name={fileName} />
              <span className="file-name">{fileName}</span>
              <button className="file-remove" onClick={clearFile} aria-label="Retirer le fichier">
                <X size={15} strokeWidth={2.2} />
              </button>
            </div>
          )}

          <p className="step-label" style={{ marginTop: 22 }}>2 · Mode d'analyse</p>
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-btn ${mode === 'auto' ? 'is-active' : ''}`}
              onClick={() => setMode('auto')}
              disabled={messages.length > 0}
            >
              <Zap size={15} strokeWidth={2.2} />
              <span>
                <strong>Automatisé</strong>
                <em>Rapport complet en un clic</em>
              </span>
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'guide' ? 'is-active' : ''}`}
              onClick={() => setMode('guide')}
              disabled={messages.length > 0}
            >
              <MessagesSquare size={15} strokeWidth={2.2} />
              <span>
                <strong>Interactif</strong>
                <em>Question par question</em>
              </span>
            </button>
          </div>
          {messages.length > 0 && (
            <p className="mode-locked-note">Le mode est verrouillé une fois l'analyse commencée. Cliquez sur "Nouveau" pour en changer.</p>
          )}

          {/* Bloc de lancement initial : uniquement tant qu'il n'y a aucun message.
              CORRECTIF : en mode Interactif, on affiche désormais un textarea pour
              saisir la première question — auparavant seul le bouton apparaissait,
              sans aucun moyen de remplir `question`, donc `canAsk` restait bloqué
              à false et "Analyser" ne faisait jamais rien. */}
          {messages.length === 0 && (
            <div style={{ marginTop: '20px' }}>
              {isFirstAutoTurn ? (
                <p className="auto-explainer" style={{ marginBottom: '12px' }}>
                  Le rapport complet (forces, faiblesses, suggestions) sera généré automatiquement.
                </p>
              ) : (
                <textarea
                  className="question-box"
                  placeholder="Que voulez-vous savoir sur ce document ?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={!fileText}
                  style={{ marginBottom: '10px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && canAsk) {
                      e.preventDefault();
                      askClaude();
                    }
                  }}
                />
              )}
              <button
                className="ask-btn"
                onClick={() => askClaude(isFirstAutoTurn ? AUTO_PROMPT : undefined)}
                disabled={!canAsk}
              >
                {asking ? (
                  <><Loader2 className="spin" size={16} strokeWidth={2.2} /> {mainButtonLabel}</>
                ) : (
                  mainButtonLabel
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="error-banner" role="alert" style={{ marginTop: '14px' }}>
              <AlertTriangle size={16} strokeWidth={2.2} />
              <span><strong>Erreur.</strong> {error}</span>
            </div>
          )}
        </section>

        {/* SECTION 3 : Flux de conversation et zone de saisie à la suite */}
        <section className="card">
          <p className={`step-label ${messages.length ? 'label-lit' : ''}`}>
            {messages.length ? 'Rapport & Conversation' : 'Réponse'}
          </p>

          {messages.length === 0 ? (
            <p className="answer-empty">
              {fileText
                ? (mode === 'auto'
                    ? 'Cliquez sur "Générer le rapport complet" ci-dessus pour lancer l\'analyse.'
                    : 'Posez votre question ci-dessus : la réponse apparaîtra ici.')
                : 'Chargez d’abord un document pour pouvoir l’interroger.'}
            </p>
          ) : (
            <div className="thread">
              {messages.map((m, i) => (
                m.role === 'user' ? (
                  <p key={i} className="msg-question">
                    {m.content === AUTO_PROMPT ? '📋 Rapport complet demandé' : m.content}
                  </p>
                ) : (
                  <div key={i} className="answer-text">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeMarkdownLists(m.content)}</ReactMarkdown>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Zone de saisie de suivi (n'apparaît qu'après le premier message,
              qu'il vienne du mode Automatisé ou du mode Interactif) */}
          {fileText && messages.length > 0 && (
            <div className="followup-box-container">
              <p className="step-label" style={{ marginTop: '20px', marginBottom: '8px' }}>Posez une question de suivi</p>
              <textarea
                className="question-box"
                placeholder="Posez une question sur une section précise..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={asking}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && canAsk) {
                    e.preventDefault();
                    askClaude();
                  }
                }}
              />
              <button
                className="ask-btn"
                onClick={() => askClaude()}
                disabled={!canAsk}
              >
                {asking ? (
                  <><Loader2 className="spin" size={16} strokeWidth={2.2} /> Rédaction de la réponse…</>
                ) : (
                  'Envoyer la question →'
                )}
              </button>
            </div>
          )}

          {error && messages.length > 0 && (
            <div className="error-banner" role="alert" style={{ marginTop: '14px' }}>
              <AlertTriangle size={16} strokeWidth={2.2} />
              <span><strong>Erreur.</strong> {error}</span>
            </div>
          )}
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
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 20px 64px;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 28px;
          border-bottom: 1px solid #E4DECF;
          margin-bottom: 32px;
        }

        .wordmark {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 22px;
          letter-spacing: -0.01em;
        }

        .mark { color: var(--highlight); margin-right: 8px; }

        .reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1px solid #D8D0BC;
          color: var(--ink);
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 13px;
          padding: 7px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .reset-btn:hover { background: #F0EAD9; border-color: var(--muted); }

        .board {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card {
          background: #FFFEFB;
          border: 1px solid #E9E3D3;
          border-radius: 14px;
          padding: 24px;
        }

        .step-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--muted);
          margin: 0 0 14px;
          display: inline-block;
          position: relative;
        }

        .label-lit::after {
          content: '';
          position: absolute;
          left: -3px;
          right: -3px;
          bottom: -2px;
          height: 6px;
          background: var(--highlight);
          z-index: -1;
          border-radius: 2px;
        }

        .dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          border: 1.5px dashed #CDC3AB;
          border-radius: 10px;
          padding: 32px 16px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .dropzone:hover, .dropzone.is-over {
          border-color: var(--trust);
          background: #F4F1E6;
        }

        .dz-icon { color: var(--muted); margin-bottom: 2px; }
        .dz-text { font-size: 14px; font-weight: 500; margin: 0; }
        .dz-sub { font-size: 12.5px; color: var(--muted); margin: 2px 0 0; }

        .sr-only {
          position: absolute;
          width: 1px; height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
        }

        .file-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          border: 1px solid #DCE7E1;
          background: #F1F7F4;
          border-radius: 10px;
          padding: 11px 14px;
        }
        .file-check { color: var(--trust); flex-shrink: 0; }

        .ext-badge {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          font-weight: 600;
          padding: 3px 7px;
          border-radius: 5px;
          flex-shrink: 0;
        }
        .badge-pdf { background: #F6E4E0; color: var(--danger); }
        .badge-docx { background: #E4EDE8; color: var(--trust); }
        .badge-txt { background: #EFE9DA; color: #8A7F6C; }

        .file-name {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          flex: 1 1 auto;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .file-remove {
          display: inline-flex;
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .file-remove:hover { color: var(--danger); background: #FBEEEA; }

        .mode-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .mode-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          border: 1.5px solid #E1DAC7;
          background: var(--paper);
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
          color: var(--ink);
        }
        .mode-btn span { display: flex; flex-direction: column; gap: 1px; }
        .mode-btn strong { font-size: 13.5px; }
        .mode-btn em { font-size: 11.5px; font-style: normal; color: var(--muted); }
        .mode-btn.is-active {
          border-color: var(--trust);
          background: #F1F7F4;
        }
        .mode-btn.is-active svg { color: var(--trust); }
        .mode-btn:disabled { opacity: 0.75; cursor: not-allowed; }
        .mode-locked-note {
          font-size: 12px;
          color: var(--muted);
          margin: 8px 0 0;
        }

        .auto-explainer {
          font-size: 13.5px;
          color: var(--ink);
          background: #F4F1E6;
          border: 1px solid #E1DAC7;
          border-radius: 10px;
          padding: 12px 14px;
          line-height: 1.5;
        }

        .question-box {
          width: 100%;
          min-height: 80px;
          resize: vertical;
          border: 1px solid #E1DAC7;
          border-radius: 10px;
          padding: 12px 14px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          color: var(--ink);
          background: var(--paper);
        }

        .ask-btn {
          margin-top: 10px;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--trust);
          color: #FBF8F2;
          border: none;
          border-radius: 9px;
          padding: 12px 16px;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .ask-btn:hover:not(:disabled) { background: var(--trust-dark); }
        .ask-btn:disabled { background: #C9C2AF; cursor: not-allowed; }

        .error-banner {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          border: 1px solid #EFCFC6;
          background: #FCF1EE;
          color: var(--danger);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
        }

        .answer-empty {
          font-size: 13.5px;
          color: var(--muted);
          margin: 0;
          line-height: 1.5;
        }

        .thread > .answer-text {
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px dashed #EEE8D8;
        }
        .thread > .answer-text:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .msg-question {
          font-weight: 600;
          color: var(--trust-dark);
          background: #F1F7F4;
          border: 1px solid #DCE7E1;
          border-radius: 8px;
          padding: 10px 14px;
          margin: 0 0 16px;
          font-size: 14px;
        }

        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        :global(.answer-text h1),
        :global(.answer-text h2),
        :global(.answer-text h3) {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          color: var(--ink);
          margin: 18px 0 8px;
        }
        :global(.answer-text p) { margin: 0 0 10px; line-height: 1.65; }
        :global(.answer-text ul) { margin: 0 0 12px; padding-left: 22px; list-style-type: disc; }
        :global(.answer-text li) { margin-bottom: 5px; }
      `}</style>
    </div>
  );
}