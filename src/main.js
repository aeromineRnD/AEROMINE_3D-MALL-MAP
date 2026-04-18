import { Viewer, MODEL_URL_P1, MODEL_URL_P2 } from './viewer.js';
import { TagManager }         from './tag-manager.js';
import { Popup }              from './popup.js';
import { SHOPS_P1, SHOPS_P2 } from './shop-data.js';

const PHASES = {
  1: { url: MODEL_URL_P1, shops: SHOPS_P1 },
  2: { url: MODEL_URL_P2, shops: SHOPS_P2 },
};

async function init() {
  const appEl     = document.getElementById('app');
  const spinnerEl = document.getElementById('spinner');
  const btn1      = document.getElementById('phase-btn-1');
  const btn2      = document.getElementById('phase-btn-2');

  const viewer     = new Viewer(appEl);
  const popup      = new Popup(appEl);
  const tagManager = new TagManager(viewer, popup);

  let currentPhase = 1;

  async function loadPhase(phase) {
    if (phase === currentPhase && viewer.content) return;

    popup.hide?.();
    tagManager.dispose();
    viewer.clearContent();
    spinnerEl.style.display = '';

    btn1.classList.toggle('active', phase === 1);
    btn2.classList.toggle('active', phase === 2);

    try {
      const { url, shops } = PHASES[phase];
      await viewer.load(url);
      tagManager.buildTags(shops);
      currentPhase = phase;
    } catch (err) {
      console.error('[3D Mall] Failed to load model:', err);
      appEl.innerHTML = `
        <div style="
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: system-ui, sans-serif; color: #b10026; font-size: 0.9rem;
          text-align: center; padding: 2rem;
        ">
          <div>
            <strong>Could not load 3D scene.</strong><br>
            <small style="color:#888">${err.message}</small>
          </div>
        </div>
      `;
    } finally {
      spinnerEl.style.display = 'none';
    }
  }

  btn1.addEventListener('click', () => loadPhase(1));
  btn2.addEventListener('click', () => loadPhase(2));

  await loadPhase(1);
}

document.addEventListener('DOMContentLoaded', init);
