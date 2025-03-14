/**
 * Profile Modal Component
 * Renders a user profile modal
 */
class ProfileModal {
  constructor() {
    this.modalId = 'profile-modal';
    this.initialized = false;
  }

  /**
   * Initialize the profile modal component
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
   * Create the profile modal DOM element
   */
  createModal() {
    const userName = window.user ? window.user.name : (localStorage.getItem('userName') || 'User Name');
    const userEmail = window.user ? window.user.username : (localStorage.getItem('userEmail') || 'user@example.com');
    const userRole = window.user ? (window.user.role || 'User') : (localStorage.getItem('userRole') || 'User');
    const userId = window.user ? window.user.id : (localStorage.getItem('userId') || 'user_id');
    
    const modalHtml = `
      <div class="language-modal" id="${this.modalId}" role="dialog" aria-labelledby="profile-modal-title" aria-modal="true">
        <div class="language-modal-content">
          <div class="language-modal-header">
            <h5 class="language-modal-title" id="profile-modal-title">User Profile</h5>
          </div>
          <div class="language-modal-body" id="profile-modal-body">
            <div class="profile-avatar-wrapper">
              <div class="profile-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="profile-name">
                <h6>${userName}</h6>
              </div>
            </div>
            
            <div class="profile-details">
              <div class="profile-detail-item">
                <div class="profile-detail-label">Email</div>
                <div class="profile-detail-value">${userEmail}</div>
              </div>
              <div class="profile-detail-item">
                <div class="profile-detail-label">Role</div>
                <div class="profile-detail-value">${userRole}</div>
              </div>
              <div class="profile-detail-item">
                <div class="profile-detail-label">User ID</div>
                <div class="profile-detail-value profile-user-id">${userId}</div>
              </div>
            </div>
            
            <div class="language-modal-footer">
              <a href="/settings/account" class="btn btn-primary btn-sm w-100">
                <i class="fas fa-cog me-2"></i>Edit Profile
              </a>
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
      const profileButton = document.getElementById('profile-btn');
      const mobileProfileButton = document.getElementById('mobile-profile-btn');
      
      // Check if click was outside modal content and not on the toggle buttons
      if (modal.classList.contains('show') && 
          !modalContent.contains(e.target) && 
          !profileButton?.contains(e.target) &&
          !mobileProfileButton?.contains(e.target)) {
        this.closeModal();
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
}

// Create global instance
const profileModal = new ProfileModal();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Set up profile toggle buttons
  const profileToggle = document.getElementById('profile-btn');
  const mobileProfileToggle = document.getElementById('mobile-profile-btn');
  
  if (profileToggle || mobileProfileToggle) {
    profileModal.initialize();
    
    if (profileToggle) {
      profileToggle.addEventListener('click', (e) => {
        e.preventDefault();
        profileModal.toggleModal();
      });
    }
    
    if (mobileProfileToggle) {
      mobileProfileToggle.addEventListener('click', (e) => {
        e.preventDefault();
        profileModal.toggleModal();
      });
    }
  }
});