import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './assetRenderEngine.css'
import './print.css'
import { loadDesignSystem } from './utils/designSystemLoader.ts'

// Load design system from backend API before rendering
loadDesignSystem().then(() => {
  console.log('🎨 Design system loaded, rendering app...');
  renderApp();
}).catch((error) => {
  console.error('❌ Failed to load design system, rendering with defaults:', error);
  renderApp();
});

function renderApp() {
  // Browser detection
  const isEdge = /Edg/.test(navigator.userAgent);

if (!isEdge) {
  const showBrowserWarning = () => {
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    warning.innerHTML = `
      <div style="
        background: white;
        padding: 40px;
        border-radius: 12px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <h2 style="color: #B21A53; margin: 0 0 16px 0; font-size: 24px;">Unsupported Browser</h2>
        <p style="color: #333; margin: 0 0 24px 0; line-height: 1.6;">
          This site has been developed on the Microsoft Stack and only supports <strong>Microsoft Edge Browser</strong>.
        </p>
        <p style="color: #666; font-size: 14px; margin: 0 0 24px 0;">
          For the best experience, please open this application in Microsoft Edge.
        </p>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: #B21A53;
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 12px;
        ">Continue Anyway</button>
        <button onclick="window.location.href='microsoft-edge:' + window.location.href" style="
          background: #0078D4;
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        ">Open in Edge</button>
      </div>
    `;
    document.body.appendChild(warning);
  };
  
  // Show warning after a brief delay to ensure DOM is ready
  setTimeout(showBrowserWarning, 100);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
