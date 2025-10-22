"use client";

import { useState } from 'react'

const API_BASE = '' // same origin in Next.js

export default function Page() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [lastResult, setLastResult] = useState(null) // { ok: boolean, message: string }
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_COMMUNITY_URL || ''
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || ''
  const usagePolicy = process.env.NEXT_PUBLIC_USAGE_POLICY || ''
  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || ''

  const privacyLink = (
    <a
      href={privacyUrl}
      title="Privacy Policy"
      target="_blank"
      rel="noopener noreferrer"
      className="policy-btn"
    >
      Privacy Policy
    </a>
  );

  const policyLinks = (
    <div className="policy-links">
      {privacyLink}
    </div>
  )

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const submit = async () => {
    if (!prompt.trim()) {
      showToast('Insert a prompt')
      return
    }
    try {
      setLoading(true)
      const res = await fetch(`/api/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        const msg = json?.error || 'API error'
        setLastResult({ ok: false, message: msg })
        throw new Error(msg)
      }
      setPrompt('')
      const okMsg = `Prompt sent! ID: ${json.id}`
      setLastResult({ ok: true, message: okMsg })
      showToast(`Prompt sent! ID: ${json.id}`)
    } catch (err) {
      console.error(err)
      showToast(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <img src="/Logo.png" alt="Build The Feed logo" width={48} height={48} className="logo" />
        <h1 className="title">Build The Feed</h1>
      </header>
      <div className="card">
        <h2 className="heading">Write your idea</h2>
        <textarea id="prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Generate a cat eating pizza..." className="textarea" />
        <div className="actions">
          <button onClick={submit} disabled={loading} className="btn btn--primary">{loading ? 'Sending...' : 'Send'}</button>
        </div>
        {lastResult && (
          <div className={`result ${lastResult.ok ? 'result--ok' : 'result--ko'}`}>
            <strong>{lastResult.ok ? 'Esito: OK' : 'Esito: KO'}</strong>
            <div className="mt-4">{lastResult.message}</div>
          </div>
        )}
      </div>

      {toast && (
        <div className="toast">{toast}</div>
      )}

      {/* Footer with socials and policies */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="socials">
            {telegramUrl && (
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M9.04 15.314l-.258 3.622c.37 0 .53-.159.72-.35l1.73-1.661 3.588 2.635c.658.362 1.124.171 1.305-.61l2.364-11.06c.21-.978-.354-1.36-1.0-1.12L4.63 10.37c-1.051.41-1.035.999-.179 1.26l3.539 1.104 8.227-5.2c.386-.262.738-.117.448.145l-7.626 6.635z" fill="#0F2A3A"/>
                </svg>
                Join the community
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 7.2a4.8 4.8 0 100 9.6 4.8 4.8 0 000-9.6zm0 7.8a3 3 0 110-6 3 3 0 010 6z" fill="#0F2A3A"/>
                  <path d="M17.4 2H6.6A4.6 4.6 0 002 6.6v10.8A4.6 4.6 0 006.6 22h10.8A4.6 4.6 0 0022 17.4V6.6A4.6 4.6 0 0017.4 2zm3 15.4a3 3 0 01-3 3H6.6a3 3 0 01-3-3V6.6a3 3 0 013-3h10.8a3 3 0 013 3v10.8z" fill="#0F2A3A"/>
                  <circle cx="17.5" cy="6.5" r="1.2" fill="#0F2A3A"/>
                </svg>
                See Instagram Page
              </a>
            )}
          </div>

          <div>
            <div><strong>Usage Policy</strong></div>
            <div>
                {usagePolicy}
            </div>
          </div>

          {policyLinks}
        </div>
      </footer>
    </div>
  )
}

