/**
 * Language Modal Component
 * Renders a language selection modal and handles language changes
 */
class LanguageModal {
  constructor() {
    this.modalId = 'language-modal';
    this.initialized = false;
    this.languages = [
      { code: 'en', name: 'English', flag: 'uk-flag' },
      { code: 'pt-BR', name: 'Portuguese', flag: 'br-flag' },
      { code: 'fr', name: 'French', flag: 'fr-flag' },
      { code: 'es', name: 'Spanish', flag: 'es-flag' },
      { code: 'it', name: 'Italian', flag: 'it-flag' },
      { code: 'de', name: 'German', flag: 'de-flag' }
    ];
  }

  /**
   * Initialize the language modal component
   */
  initialize() {
    if (this.initialized) return;
    
    // Create modal if it doesn't exist
    if (!document.getElementById(this.modalId)) {
      this.createModal();
    }
    
    // Initialize event listeners
    this.setupEventListeners();
    
    this.initialized = true;
  }

  /**
   * Create the language modal DOM element
   */
  createModal() {
    const currentLang = this.getCurrentLanguage();
    
    let optionsHtml = '';
    this.languages.forEach(lang => {
      const isActive = currentLang === lang.code;
      optionsHtml += `
        <div class="language-modal-option ${isActive ? 'active' : ''}" 
             onclick="languageModal.changeLanguage('${lang.code}')" 
             tabindex="0" role="button" 
             aria-pressed="${isActive ? 'true' : 'false'}" 
             data-lang="${lang.code}">
          <div class="flag ${lang.flag}"></div>
          <div class="lang-name">
            <span class="lang-name-native">${this.getLanguageName(lang.code)}</span>
          </div>
        </div>
      `;
    });
    
    const modalHtml = `
      <div class="language-modal" id="${this.modalId}" role="dialog" aria-labelledby="language-modal-title" aria-modal="true">
        <div class="language-modal-content">
          <div class="language-modal-header">
            <h5 class="language-modal-title" id="language-modal-title">${this.getLanguageSelectText()}</h5>
          </div>
          <div class="language-modal-body">
            ${optionsHtml}
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
      const languageButton = document.getElementById('language-selector-btn');
      const mobileLanguageButton = document.getElementById('mobile-language-selector-btn');
      
      // Check if click was outside modal content and not on the toggle buttons
      if (modal.classList.contains('show') && 
          !modalContent.contains(e.target) && 
          !languageButton?.contains(e.target) &&
          !mobileLanguageButton?.contains(e.target)) {
        this.closeModal();
      }
    });
    
    // Add keyboard navigation
    const options = document.querySelectorAll(`#${this.modalId} .language-modal-option`);
    options.forEach(option => {
      option.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const lang = option.getAttribute('data-lang');
          if (lang) {
            this.changeLanguage(lang);
          }
        }
      });
    });

    // Handle all language toggle buttons
    document.addEventListener('click', (e) => {
      // Check if clicked element or any of its parents has the language-toggle class or id
      const toggleButton = e.target.closest('#language-selector-btn, #mobile-language-selector-btn, #language-toggle, .language-toggle');
      
      if (toggleButton) {
        e.preventDefault();
        this.toggleModal();
      }
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
   * Get current language from cookie or localStorage
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return localStorage.getItem('language') || 
           document.cookie.replace(/(?:(?:^|.*;\s*)i18next\s*\=\s*([^;]*).*$)|^.*$/, "$1") || 
           'en';
  }

  /**
   * Get translated language name
   * @param {string} code - Language code
   * @returns {string} Translated language name
   */
  getLanguageName(code) {
    // Try to get from i18n if available
    const i18nKey = `language.names.${code}`;
    const translatedName = this.translateIfAvailable(i18nKey);
    
    if (translatedName !== i18nKey) {
      return translatedName;
    }
    
    // Fallback to default names
    const langMap = {
      'en': 'English',
      'pt-BR': 'Portuguese',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian',
      'de': 'German'
    };
    
    return langMap[code] || code;
  }

  /**
   * Get language selection text
   * @returns {string} Text for language selection
   */
  getLanguageSelectText() {
    return this.translateIfAvailable('language.selectLanguage') || 'Select Language';
  }

  /**
   * Translate text if i18n is available
   * @param {string} key - Translation key
   * @returns {string} Translated text or key if not available
   */
  translateIfAvailable(key) {
    // Check if i18n is available
    if (window.i18next && typeof window.i18next.t === 'function') {
      return window.i18next.t(key);
    }
    
    return key;
  }

  /**
   * Change language
   * @param {string} lang - Language code to change to
   */
  changeLanguage(lang) {
    // Save to cookie for server-side rendering
    document.cookie = `i18next=${lang};path=/`;
    
    // Save to localStorage for client-side preference
    localStorage.setItem('language', lang);
    
    // Set RTL for appropriate languages
    const rtlLanguages = ['ar', 'fa', 'he', 'ur'];
    if (rtlLanguages.includes(lang)) {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    
    // Reload page to apply changes
    window.location.reload();
  }
}

// Create global instance
const languageModal = new LanguageModal();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  languageModal.initialize();
});

// Initialize language modal right away to ensure it's available
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    languageModal.initialize();
  });
} else {
  languageModal.initialize();
}