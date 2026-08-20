class LoadingSpinner {
  constructor() {
    this.overlay = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    // 1. Inject the CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
      .js-loading-overlay {
        /* Scoped variables */
        --bg-color: #0f172a;
        --primary: #3b82f6;
        --border: #334155;
        
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 99999; /* High z-index to ensure it sits on top */
        
        /* Hidden by default with smooth fade */
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.1s ease, visibility 0.1s ease;
      }

      .js-loading-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      .js-loading-overlay .spinner {
        box-sizing: border-box;
        width: 40px;
        height: 40px;
        border: 4px solid var(--border);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: js-spinner-spin 1s linear infinite;
      }

      /* Uniquely named animation to prevent conflicts */
      @keyframes js-spinner-spin { 
        to { transform: rotate(360deg); } 
      }
    `;
    document.head.appendChild(style);

    // 2. Create the HTML elements dynamically
    this.overlay = document.createElement('div');
    this.overlay.className = 'js-loading-overlay';
    
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    // 3. Assemble and append to the body
    this.overlay.appendChild(spinner);
    document.body.appendChild(this.overlay);

    this.isInitialized = true;
  }

  show() {
    // Initialize on first call if not already done
    if (!this.isInitialized) this.init();
    
    // Disable scrolling on the background page
    document.body.style.overflow = 'hidden'; 
    this.overlay.classList.add('active');
  }

  hide() {
    if (this.overlay) {
      // Re-enable scrolling
      document.body.style.overflow = ''; 
      this.overlay.classList.remove('active');
    }
  }
}

// Export a single instance to the global window object
window.Loader = new LoadingSpinner();