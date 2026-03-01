/**
 * Popup — shop detail panel.
 * Created once, reused for all shops via show(shopData) / hide().
 * Appended inside #app so it's positioned relative to the viewer area.
 */
export class Popup {
  constructor(container) {
    this.container    = container;
    this._activeShop  = null;
    this._activeTag   = null;

    this.el = document.createElement('div');
    this.el.className = 'shop-popup';
    this.el.innerHTML = `
      <div class="popup-photo-wrap" id="popup-photo-wrap">
        <img class="popup-photo" id="popup-photo" src="" alt="" />
      </div>
      <div class="popup-header">
        <span class="popup-icon"  id="popup-icon"></span>
        <h2   class="popup-title" id="popup-title"></h2>
        <button class="popup-close" id="popup-close" title="Close">&times;</button>
      </div>
      <div class="popup-body">
        <span class="popup-category" id="popup-category"></span>
        <div class="popup-row">
          <span class="popup-row-label">Hours</span>
          <span id="popup-hours"></span>
        </div>
        <div class="popup-row">
          <span class="popup-row-label">About</span>
          <span id="popup-description"></span>
        </div>
        <div class="popup-row">
          <span class="popup-row-label">Phone</span>
          <a id="popup-phone" class="popup-link"></a>
        </div>
        <div class="popup-row">
          <span class="popup-row-label">Website</span>
          <a id="popup-website" class="popup-link" target="_blank" rel="noopener"></a>
        </div>
      </div>
    `;
    container.appendChild(this.el);

    // Close button
    this.el.querySelector('#popup-close').addEventListener('click', () => this.hide());

    // Outside-click dismissal (skip if click originated from a tag)
    document.addEventListener('click', (e) => {
      if (!this._activeShop) return;
      if (this.el.contains(e.target)) return;
      if (e.target.closest('.shop-tag')) return;
      this.hide();
    });
  }

  show(shopData, tagEl = null) {
    // Toggle: clicking the same tag again closes the popup
    if (this._activeShop === shopData) {
      this.hide();
      return;
    }

    // Remove active state from previous tag
    if (this._activeTag) this._activeTag.classList.remove('active');

    this._activeShop = shopData;
    this._activeTag  = tagEl;

    if (tagEl) tagEl.classList.add('active');

    this.el.querySelector('#popup-icon').textContent        = shopData.icon;
    this.el.querySelector('#popup-title').textContent       = shopData.name;
    this.el.querySelector('#popup-category').textContent    = shopData.category;
    this.el.querySelector('#popup-hours').textContent       = shopData.hours;
    this.el.querySelector('#popup-description').textContent = shopData.description;

    const photoWrap = this.el.querySelector('#popup-photo-wrap');
    const photoImg  = this.el.querySelector('#popup-photo');
    if (shopData.photo) {
      photoImg.src         = shopData.photo;
      photoImg.alt         = shopData.name;
      photoWrap.style.display = '';
    } else {
      photoWrap.style.display = 'none';
    }

    const phoneEl = this.el.querySelector('#popup-phone');
    phoneEl.textContent = shopData.phone;
    phoneEl.href        = `tel:${shopData.phone.replace(/\s/g, '')}`;

    const websiteEl = this.el.querySelector('#popup-website');
    websiteEl.textContent = shopData.website;
    websiteEl.href        = `https://${shopData.website}`;

    this.el.classList.add('visible');
  }

  hide() {
    if (this._activeTag) this._activeTag.classList.remove('active');
    this._activeShop = null;
    this._activeTag  = null;
    this.el.classList.remove('visible');
  }
}
