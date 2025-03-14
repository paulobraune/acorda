/**
 * Business Modal Component
 * Renders a business selection modal and handles business changes
 */
class BusinessModal {
  constructor() {
    this.modalId = 'business-modal';
    this.initialized = false;
    this.businesses = [];
  }

  /**
   * Initialize the business modal component
   */
  initialize() {
    if (this.initialized) return;
    
    // Create modal if it doesn't exist
    if (!document.getElementById(this.modalId)) {
      this.createModal();
    }
    
    // Initialize event listeners
    this.setupEventListeners();
    
    // Load businesses
    this.loadBusinesses();
    
    this.initialized = true;
  }

  /**
   * Create the business modal DOM element
   */
  createModal() {
    const modalHtml = `
      <div class="language-modal" id="${this.modalId}" role="dialog" aria-labelledby="business-modal-title" aria-modal="true">
        <div class="language-modal-content">
          <div class="language-modal-header">
            <h5 class="language-modal-title" id="business-modal-title">Select Business</h5>
            <div class="business-search-wrapper mt-3">
              <div class="input-group">
                <span class="input-group-text bg-transparent border-end-0">
                  <i class="fas fa-search text-muted"></i>
                </span>
                <input type="text" id="business-search-input" class="form-control border-start-0" placeholder="Search by name or ID..." aria-label="Search businesses">
              </div>
            </div>
          </div>
          <div class="language-modal-body" id="business-modal-body">
            <!-- Business options will be dynamically populated -->
            <div class="text-center p-3">
              <div class="spinner-border spinner-border-sm text-primary mb-2" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mb-0">Loading businesses...</p>
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
      const businessButton = document.getElementById('business-selector-btn');
      const mobileBusinessButton = document.getElementById('business-selector-btn-mobile');
      
      // Check if click was outside modal content and not on the toggle buttons
      if (modal.classList.contains('show') && 
          !modalContent.contains(e.target) && 
          !businessButton?.contains(e.target) &&
          !mobileBusinessButton?.contains(e.target)) {
        this.closeModal();
      }
    });
    
    // Set up search functionality
    const searchInput = document.getElementById('business-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearch.bind(this));
      
      // Handle keyboard navigation within the search results
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const visibleOptions = Array.from(document.querySelectorAll('#business-modal-body .language-modal-option')).filter(opt => opt.style.display !== 'none');
          if (visibleOptions.length > 0) {
            visibleOptions[0].focus();
          }
        }
      });
    }
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
    
    // Clear search input when opening the modal
    const searchInput = document.getElementById('business-search-input');
    if (searchInput) {
      searchInput.value = '';
      // Focus on search input for better UX
      setTimeout(() => {
        searchInput.focus();
      }, 300);
      
      // Trigger search event to refresh list (show all)
      searchInput.dispatchEvent(new Event('input'));
    }
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
   * Load businesses from API
   */
  async loadBusinesses() {
    try {
      const businessModalBody = document.getElementById('business-modal-body');
      const currentBusinessName = document.getElementById('current-business-name');
      const currentBusinessNameMobile = document.getElementById('current-business-name-mobile');
      
      if (!businessModalBody) return;
      
      // Clear existing options and show loading state
      businessModalBody.innerHTML = `
        <div class="text-center p-3">
          <div class="spinner-border spinner-border-sm text-primary mb-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mb-0">Loading businesses...</p>
        </div>
      `;
      
      // Fetch businesses from the API
      const response = await fetch('/api/user/businesses');
      if (!response.ok) {
        throw new Error('Failed to load businesses');
      }
      
      const data = await response.json();
      this.businesses = data.businesses || [];
      const activeBusiness = data.activeBusiness || '';
      
      // Clear the loading state
      businessModalBody.innerHTML = '';
      
      if (this.businesses.length === 0) {
        // Show empty state
        businessModalBody.innerHTML = `
          <div class="text-center p-3">
            <i class="fas fa-briefcase mb-3 text-muted" style="font-size: 2rem;"></i>
            <p class="mb-3">You don't have any businesses yet.</p>
            <a href="/create-business" class="btn btn-primary btn-sm">
              <i class="fas fa-plus me-2"></i>Create Business
            </a>
          </div>
        `;
        return;
      }
      
      // Find the active business
      let activeBusinessData = this.businesses.find(b => b._id === activeBusiness);
      
      // If no active business is set in session or it's invalid, use the first one
      if (!activeBusinessData && this.businesses.length > 0) {
        activeBusinessData = this.businesses[0];
      }
      
      // Update UI with active business name
      if (activeBusinessData) {
        if (currentBusinessName) currentBusinessName.textContent = activeBusinessData.name;
        if (currentBusinessNameMobile) currentBusinessNameMobile.textContent = activeBusinessData.name;
        
        // Save active business data to window object for page transitions
        window.activeBusinessData = {
          id: activeBusinessData._id,
          name: activeBusinessData.name
        };
      }
      
      // Add business options to the modal
      this.businesses.forEach(business => {
        const isActive = activeBusiness && business._id === activeBusiness;
        
        const businessOption = document.createElement('div');
        businessOption.className = `language-modal-option ${isActive ? 'active' : ''}`;
        businessOption.setAttribute('role', 'button');
        businessOption.setAttribute('tabindex', '0');
        businessOption.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        businessOption.setAttribute('data-business-id', business._id);
        businessOption.setAttribute('data-business-name', business.name.toLowerCase());
        
        // Determine role text
        let roleIcon = '';
        let roleText = '';
        let roleClass = '';
        
        // Determine role badge
        if (business.userId === localStorage.getItem('userId')) {
          roleIcon = '<i class="fas fa-crown text-warning"></i>';
          roleText = 'Owner';
          roleClass = 'owner';
        } else {
          // Anyone who can see the business is an admin (Member role will be added later)
          roleText = 'Admin';
          roleClass = 'admin';
        }
        
        businessOption.innerHTML = `
          <div class="business-icon">
            <i class="fas fa-briefcase"></i>
          </div>
          <div class="lang-name flex-grow-1">
            <div class="d-flex flex-column">
              <span class="lang-name-native">${business.name}</span>
              <small class="text-muted business-id">${business._id}</small>
            </div>
          </div>
          <div class="business-role ${roleClass}">
            ${roleIcon}
            <small>${roleText}</small>
          </div>
        `;
        
        businessOption.addEventListener('click', () => {
          this.selectBusiness(business._id);
        });
        
        businessOption.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectBusiness(business._id);
          }
          
          const visibleOptions = Array.from(document.querySelectorAll('#business-modal-body .language-modal-option')).filter(opt => opt.style.display !== 'none');
          const currentIndex = visibleOptions.indexOf(businessOption);
          
          if (e.key === 'ArrowDown' && currentIndex < visibleOptions.length - 1) {
            e.preventDefault();
            visibleOptions[currentIndex + 1].focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
              visibleOptions[currentIndex - 1].focus();
            } else {
              const searchInput = document.getElementById('business-search-input');
              if (searchInput) searchInput.focus();
            }
          }
        });
        
        businessModalBody.appendChild(businessOption);
      });
      
      // Add a button to create a new business
      const createBusinessBtn = document.createElement('div');
      createBusinessBtn.className = 'language-modal-footer';
      createBusinessBtn.innerHTML = `
        <a href="/create-business" class="btn btn-primary btn-sm d-block">
          <i class="fas fa-plus me-2"></i>Add New Business
        </a>
      `;
      businessModalBody.appendChild(createBusinessBtn);
      
    } catch (error) {
      console.error('Error loading businesses:', error);
      // Show error state
      const businessModalBody = document.getElementById('business-modal-body');
      if (businessModalBody) {
        businessModalBody.innerHTML = `
          <div class="text-center p-3 text-danger">
            <i class="fas fa-exclamation-circle mb-3" style="font-size: 2rem;"></i>
            <p>Failed to load businesses. Please try again.</p>
            <button class="btn btn-outline-primary btn-sm" onclick="businessModal.loadBusinesses()">
              <i class="fas fa-sync-alt me-2"></i>Retry
            </button>
          </div>
        `;
      }
    }
  }

  /**
   * Handle search functionality
   * @param {Event} event - Input event
   */
  handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const options = document.querySelectorAll('#business-modal-body .language-modal-option');
    
    options.forEach(option => {
      const businessName = option.getAttribute('data-business-name');
      const businessId = option.getAttribute('data-business-id');
      const idText = option.querySelector('.business-id')?.textContent.toLowerCase();
      
      if ((businessName && businessName.includes(searchTerm)) || 
          (businessId && businessId.includes(searchTerm)) || 
          (idText && idText.includes(searchTerm))) {
        option.style.display = '';
      } else {
        option.style.display = 'none';
      }
    });
    
    // Show message if no results found
    const visibleOptions = document.querySelectorAll('#business-modal-body .language-modal-option[style=""]');
    const noResultsMessage = document.getElementById('no-businesses-results');
    
    if (visibleOptions.length === 0 && searchTerm) {
      if (!noResultsMessage) {
        const noResults = document.createElement('div');
        noResults.id = 'no-businesses-results';
        noResults.className = 'text-center p-3';
        noResults.innerHTML = `
          <i class="fas fa-search mb-3 text-muted" style="font-size: 1.5rem;"></i>
          <p class="mb-0">No businesses found matching "${searchTerm}"</p>
        `;
        const businessModalBody = document.getElementById('business-modal-body');
        if (businessModalBody) {
          businessModalBody.appendChild(noResults);
        }
      }
    } else if (noResultsMessage) {
      noResultsMessage.remove();
    }
  }

  /**
   * Select a business
   * @param {string} businessId - Business ID to select
   */
  async selectBusiness(businessId) {
    try {
      // Show loading state
      document.querySelectorAll('#business-modal-body .language-modal-option').forEach(option => {
        option.classList.add('disabled');
        option.style.pointerEvents = 'none';
      });
      
      const selectedOption = document.querySelector(`#business-modal-body .language-modal-option[data-business-id="${businessId}"]`);
      if (selectedOption) {
        selectedOption.innerHTML += `
          <div class="position-absolute top-0 end-0 p-2">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        `;
      }
      
      // Set active business via API
      const response = await fetch('/api/user/set-active-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ businessId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to set active business');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update UI
        const desktopNameElement = document.getElementById('current-business-name');
        const mobileNameElement = document.getElementById('current-business-name-mobile');
        
        if (desktopNameElement) {
          desktopNameElement.textContent = result.business.name;
        }
        
        if (mobileNameElement) {
          mobileNameElement.textContent = result.business.name;
        }
        
        // Save business data for page transitions
        window.activeBusinessData = {
          id: result.business._id,
          name: result.business.name
        };
        
        // Update business options
        document.querySelectorAll('#business-modal-body .language-modal-option').forEach(option => {
          if (option.getAttribute('data-business-id') === businessId) {
            option.classList.add('active');
            option.setAttribute('aria-pressed', 'true');
          } else {
            option.classList.remove('active');
            option.setAttribute('aria-pressed', 'false');
          }
        });
        
        // Close modal
        this.closeModal();
        
        // Redirect to overview page instead of reloading current page
        window.location.href = '/overview';
      } else {
        throw new Error(result.message || 'Failed to set active business');
      }
    } catch (error) {
      console.error('Error selecting business:', error);
      
      // Remove loading state
      document.querySelectorAll('#business-modal-body .language-modal-option').forEach(option => {
        option.classList.remove('disabled');
        option.style.pointerEvents = '';
        
        // Remove any spinner
        const spinner = option.querySelector('.spinner-border');
        if (spinner && spinner.parentElement) {
          spinner.parentElement.remove();
        }
      });
      
      // Show error message
      if (typeof showToast === 'function') {
        showToast('danger', error.message || 'Failed to select business');
      } else {
        alert(error.message || 'Failed to select business');
      }
    }
  }
}

// Create global instance
const businessModal = new BusinessModal();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Set up business toggle buttons
  const businessToggle = document.getElementById('business-selector-btn');
  const mobileBusinessToggle = document.getElementById('business-selector-btn-mobile');
  
  if (businessToggle || mobileBusinessToggle) {
    businessModal.initialize();
    
    if (businessToggle) {
      businessToggle.addEventListener('click', (e) => {
        e.preventDefault();
        businessModal.toggleModal();
      });
    }
    
    if (mobileBusinessToggle) {
      mobileBusinessToggle.addEventListener('click', (e) => {
        e.preventDefault();
        businessModal.toggleModal();
      });
    }
  }
});