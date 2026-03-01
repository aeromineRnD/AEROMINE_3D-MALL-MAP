import { Viewer }     from './viewer.js';
import { TagManager } from './tag-manager.js';
import { Popup }      from './popup.js';

async function init() {
  const appEl     = document.getElementById('app');
  const spinnerEl = document.getElementById('spinner');

  // 1. Scene, renderers, controls
  const viewer = new Viewer(appEl);

  // 2. Popup panel (hidden until a tag is clicked)
  const popup = new Popup(appEl);

  // 3. Tag manager (builds tags after model loads)
  const tagManager = new TagManager(viewer, popup);

  spinnerEl.style.display = '';

  try {
    // 4. Load the GLTF model from public/models/test.gltf
    await viewer.load();

    // 5. Attach floating tags to all shops found in the scene
    tagManager.buildTags();

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
          Make sure <code>public/models/test.gltf</code> and <code>test.bin</code> exist.<br>
          <small style="color:#888">${err.message}</small>
        </div>
      </div>
    `;
  } finally {
    spinnerEl.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', init);
