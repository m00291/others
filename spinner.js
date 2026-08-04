(function () {
  class LoadingSpinner {
    constructor() {
      this.overlay = null;
      this.isInitialized = false;
    }

    init() {
      if (this.isInitialized) return;

      // Automatically inject CSS into document head
      const style = document.createElement('style');
      style.textContent = `
        .js-loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .js-loading-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        .js-loading-overlay .spinner {
          box-sizing: border-box;
          width: 40px;
          height: 40px;
          border: 4px solid #334155;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: js-spinner-spin 1s linear infinite;
        }
        @keyframes js-spinner-spin { 
          to { transform: rotate(360deg); } 
        }
      `;
      document.head.appendChild(style);

      // Create overlay element
      this.overlay = document.createElement('div');
      this.overlay.className = 'js-loading-overlay';
      this.overlay.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(this.overlay);

      this.isInitialized = true;
    }

    show() {
      if (!this.isInitialized) this.init();
      document.body.style.overflow = 'hidden';
      this.overlay.classList.add('active');
    }

    hide() {
      if (this.overlay) {
        document.body.style.overflow = '';
        this.overlay.classList.remove('active');
      }
    }
  }

  // Attach to global window object
  window.Loader = new LoadingSpinner();
})();