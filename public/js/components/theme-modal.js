/**
 * Theme Modal Component
 * Renders a theme selection modal and handles theme changes
 */
class ThemeModal {
  constructor() {
    this.modalId = 'theme-modal';
    this.initialized = false;
  }

  /**
   * Initialize the theme modal component
   */
  initialize() {
    if (this.initialized) return;
    
    // Create modal if it doesn't exist
    if (!document.getElementById(this.modalId)) {
      this.createModal();
    }
    
    // Initialize event listeners
    this.setupEventListeners();
    
    // Update theme options based on current theme
    this.updateThemeModalOptions();
    
    this.initialized = true;
  }

  /**
   * Create the theme modal DOM element
   */
  createModal() {
    const modalHtml = `
      <div class="language-modal" id="${this.modalId}" role="dialog" aria-labelledby="theme-modal-title" aria-modal="true">
        <div class="language-modal-content">
          <div class="language-modal-header">
            <h5 class="language-modal-title" id="theme-modal-title">Select Theme</h5>
          </div>
          <div class="language-modal-body">
            <div class="language-modal-option" id="dark-theme-option" onclick="themeModal.changeTheme('dark')" tabindex="0" role="button" data-theme="dark">
              <div class="theme-icon dark">
                <i class="fas fa-moon"></i>
              </div>
              <div class="lang-name">
                <span class="lang-name-native">Dark Theme</span>
              </div>
            </div>
            <div class="language-modal-option" id="light-theme-option" onclick="themeModal.changeTheme('light')" tabindex="0" role="button" data-theme="light">
              <div class="theme-icon light">
                <i class="fas fa-sun"></i>
              </div>
              <div class="lang-name">
                <span class="lang-name-native">Light Theme</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Append to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  /**
   * Set up event listeners for the modal
   */
  setupEventListeners() {
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      const modal = document.getElementById(this.modalId);
      if (!modal) return;
      
      const modalContent = modal.querySelector('.language-modal-content');
      const themeButton = document.getElementById('theme-toggle');
      const mobileThemeButton = document.getElementById('mobile-theme-toggle');
      
      // Check if click was outside modal content and not on the toggle buttons
      if (modal.classList.contains('show') && 
          !modalContent.contains(e.target) && 
          !themeButton?.contains(e.target) &&
          !mobileThemeButton?.contains(e.target)) {
        this.closeModal();
      }
    });
    
    // Add keyboard navigation
    const options = document.querySelectorAll(`#${this.modalId} .language-modal-option`);
    options.forEach(option => {
      option.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const theme = option.getAttribute('data-theme');
          if (theme) {
            this.changeTheme(theme);
          }
        }
      });
    });
  }

  /**
   * Toggle the modal visibility
   */
  toggleModal() {
    const modal = document.getElementById(this.modalId);
    if (!modal) {
      this.initialize();
      return this.toggleModal();
    }
    
    const isVisible = modal.classList.contains('show');
    
    if (isVisible) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  /**
   * Open the modal
   */
  openModal() {
    const modal = document.getElementById(this.modalId);
    if (!modal) {
      this.initialize();
      return this.openModal();
    }
    
    modal.classList.add('show');
    this.updateThemeModalOptions();
  }

  /**
   * Close the modal
   */
  closeModal() {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.classList.remove('show');
    }
  }

  /**
   * Update the active theme option in the modal
   */
  updateThemeModalOptions() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const darkOption = document.getElementById('dark-theme-option');
    const lightOption = document.getElementById('light-theme-option');
    
    if (!darkOption || !lightOption) return;
    
    if (currentTheme === 'light') {
      lightOption.classList.add('active');
      lightOption.setAttribute('aria-pressed', 'true');
      darkOption.classList.remove('active');
      darkOption.setAttribute('aria-pressed', 'false');
    } else {
      darkOption.classList.add('active');
      darkOption.setAttribute('aria-pressed', 'true');
      lightOption.classList.remove('active');
      lightOption.setAttribute('aria-pressed', 'false');
    }
  }

  /**
   * Change theme
   * @param {string} theme - The theme to change to ('light' or 'dark')
   */
  changeTheme(theme) {
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme change to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update all theme toggle icons
    this.updateThemeIcons();
    
    // Update brand logo based on theme
    this.updateBrandLogo(theme);
    
    // Update theme modal options
    this.updateThemeModalOptions();
    
    // Close the modal
    this.closeModal();
  }

  /**
   * Update all theme toggle icons based on current theme
   */
  updateThemeIcons() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    // Update desktop and mobile theme icons
    const desktopIcon = document.querySelector('#theme-toggle i');
    const mobileIcon = document.querySelector('#mobile-theme-toggle i');
    
    if (desktopIcon) {
      desktopIcon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    if (mobileIcon) {
      mobileIcon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }

  /**
   * Update brand logo based on theme
   * @param {string} theme - The current theme
   */
  updateBrandLogo(theme) {
    const logoSelectors = [
      '.navbar-brand img',
      '.login-logo img',
      '.registration-logo img',
      '.business-logo img'
    ];

    logoSelectors.forEach(selector => {
      const logo = document.querySelector(selector);
      if (logo) {
        logo.src = theme === 'light'
          ? 'https://assets.tracklead.com/assets/logo-azul-preto.png'
          : 'https://assets.tracklead.com/assets/logo-ciano-branco.png';
      }
    });
  }
}

// Create global instance
const themeModal = new ThemeModal();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  themeModal.initialize();
  
  // Set up theme toggle buttons
  const themeToggle = document.getElementById('theme-toggle');
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      themeModal.toggleModal();
    });
  }
  
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      themeModal.toggleModal();
    });
  }
  
  // Update theme icons based on current theme
  themeModal.updateThemeIcons();
});