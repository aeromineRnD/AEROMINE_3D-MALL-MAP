import { Box3, Vector3 }  from 'three';
import { CSS2DObject }    from 'three/addons/renderers/CSS2DRenderer.js';
import { SHOPS_P1 }       from './shop-data.js';

// Clearance above the top face of a building's bounding box (world units)
const TAG_Y_OFFSET = 0.5;

export class TagManager {
  constructor(viewer, popup) {
    this.viewer  = viewer;
    this.popup   = popup;
    this._tags   = [];   // { shop, object3d, el }
  }

  /**
   * Call once after viewer.load() resolves.
   * Traverses the loaded scene, finds meshes whose names match shop-data,
   * and attaches a CSS2DObject tag above each one.
   */
  buildTags(shops = SHOPS_P1) {
    const root = this.viewer.content;
    if (!root) {
      console.warn('[TagManager] No content loaded — call viewer.load() first.');
      return;
    }

    // Fast lookup: meshName → shopData
    const shopMap = new Map(shops.map(s => [s.meshName, s]));

    root.traverse((node) => {
      const shop = shopMap.get(node.name);
      if (!shop) return;

      // Force world matrix propagation so Box3 measures correctly
      // (viewer._fitCamera re-centers the root, children inherit that offset)
      node.updateWorldMatrix(true, true);

      const anchor = this._computeAnchor(node);
      const tagObj = this._createTag(shop, anchor);

      // Add to scene root (NOT to content node) so the tag position
      // is in world space and doesn't double-apply the centering offset
      this.viewer.scene.add(tagObj);
      this._tags.push({ shop, object3d: tagObj, el: tagObj.element });

      console.log(`[TagManager] Tag placed for "${node.name}" at`, anchor);
    });

    if (this._tags.length === 0) {
      console.warn('[TagManager] No matching nodes found. Check that meshName values in shop-data.js match the GLTF node names exactly.');
    }
  }

  // -------------------------------------------------------------------------
  // Anchor computation
  // -------------------------------------------------------------------------

  _computeAnchor(node) {
    const box = new Box3().setFromObject(node);

    return new Vector3(
      (box.min.x + box.max.x) / 2,   // horizontal center
      box.max.y + TAG_Y_OFFSET,       // above the top face
      (box.min.z + box.max.z) / 2    // depth center
    );
  }

  // -------------------------------------------------------------------------
  // CSS2DObject creation
  // -------------------------------------------------------------------------

  _createTag(shop, anchorPosition) {
    const el = document.createElement('div');
    el.className = 'shop-tag';
    el.innerHTML = `
      <span class="tag-icon">${shop.icon}</span>
      <span class="tag-name">${shop.name}</span>
    `;

    // Restore pointer-events on the element itself (the CSS2D overlay div
    // has pointer-events: none, but individual tags must be clickable)
    el.style.pointerEvents = 'auto';

    el.addEventListener('click', (e) => {
      e.stopPropagation();   // prevent outside-click listener in Popup from firing
      this.popup.show(shop, el);
    });

    const obj = new CSS2DObject(el);
    obj.position.copy(anchorPosition);

    // center: (0.5, 1.0) → bottom-center of the div sits at the anchor point
    // so the tag pill appears above the building, not straddling it
    obj.center.set(0.5, 1.0);

    return obj;
  }

  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------

  dispose() {
    this._tags.forEach(({ object3d }) => {
      if (object3d.parent) object3d.parent.remove(object3d);
    });
    this._tags = [];
  }
}
