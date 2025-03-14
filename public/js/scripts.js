// Active link handler
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
      
      // Se o link estiver em um submenu, expande o pai
      const submenu = link.closest('.collapse');
      if (submenu) {
        submenu.classList.add('show');
        const parentLink = submenu.previousElementSibling;
        if (parentLink) {
          parentLink.setAttribute('aria-expanded', 'true');
        }
      }
    }
  });

  // Animação para submenu
  const submenuToggles = document.querySelectorAll('[data-bs-toggle="collapse"]');
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const icon = toggle.querySelector('.fa-chevron-down');
      if (icon) {
        icon.style.transform = toggle.getAttribute('aria-expanded') === 'true' 
          ? 'rotate(0deg)' 
          : 'rotate(180deg)';
      }
    });
  });
  
  // Adiciona atributos data-title para tooltips no modo mini
  addTooltipAttributes();

  // Load businesses from API and initialize business selector
  loadBusinesses();
  
  // Set up mobile theme toggle
  setupThemeToggle('mobile-theme-toggle');
  
  // Sync business name between mobile and desktop
  syncBusinessNames();
  
  // Use server-provided business data if available
  initializeBusinessName();
  
  // Initialize theme icons based on current theme
  updateThemeIcons();
});

// Function to initialize the business name from server data
function initializeBusinessName() {
  // Check if the server provided business data to window object
  if (window.activeBusinessData) {
    const desktopName = document.getElementById('current-business-name');
    const mobileName = document.getElementById('current-business-name-mobile');
    
    if (desktopName) {
      desktopName.textContent = window.activeBusinessData.name;
    }
    
    if (mobileName) {
      mobileName.textContent = window.activeBusinessData.name;
    }
  }
}

// Função para adicionar tooltips
function addTooltipAttributes() {
  document.querySelectorAll('.nav-link').forEach(link => {
    const text = link.querySelector('span')?.textContent.trim();
    if (text) {
      link.setAttribute('data-title', text);
    }
  });
  
  document.querySelectorAll('.nav-header').forEach(header => {
    const text = header.querySelector('span')?.textContent.trim();
    if (text) {
      header.setAttribute('data-title', text);
    }
  });
}

// Function to sync business names between mobile and desktop
function syncBusinessNames() {
  const desktopName = document.getElementById('current-business-name');
  const mobileName = document.getElementById('current-business-name-mobile');
  
  if (desktopName && mobileName) {
    mobileName.textContent = desktopName.textContent;
  }
}

// Variáveis para elementos de sidebar
const sidebarToggle = document.getElementById('sidebarToggleBtn');
const sidebar = document.getElementById('sidebarMenu');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const mainContent = document.querySelector('main');

// Carrega o estado do sidebar do localStorage
const isSidebarMini = localStorage.getItem('sidebarMini') === 'true';
if (isSidebarMini) {
  sidebar.classList.add('mini');
  mainContent.classList.add('mini');
  toggleSidebarIcon(true);
}

// Função para alternar o ícone do botão de toggle
function toggleSidebarIcon(isMini) {
  const icon = sidebarToggle.querySelector('i');
  if (isMini) {
    icon.classList.replace('fa-bars', 'fa-chevron-right');
  } else {
    icon.classList.replace('fa-chevron-right', 'fa-bars');
  }
}

// Função para alternar o sidebar com transições melhoradas
function toggleSidebar() {
  const contentWrapper = document.querySelector('.content-wrapper');
  
  if (window.innerWidth <= 768) {
    // Comportamento mobile: alterna a visibilidade do sidebar com animação
    const isShowing = sidebar.classList.toggle('show');
    
    if (sidebarOverlay) {
      sidebarOverlay.classList.toggle('show');
    }
    
    // Remove qualquer padding-right definido inline no modo desktop
    if (contentWrapper) {
      contentWrapper.style.paddingRight = "";
    }
    
    // No modo mobile, animamos o ícone para um X quando o sidebar está aberto
    const icon = sidebarToggle.querySelector('i');
    if (isShowing) {
      icon.style.transform = 'rotate(180deg)';
    } else {
      icon.style.transform = 'rotate(0deg)';
    }
  } else {
    // Comportamento desktop: alterna o modo mini e ajusta o padding-right
    // Usamos uma abordagem mais suave para a transição
    const isMini = !sidebar.classList.contains('mini');
    
    // Altera o ícone com base no modo
    toggleSidebarIcon(isMini);
    
    // Adiciona ou remove a classe mini com um ligeiro atraso
    // para permitir que as transições ocorram na ordem correta
    if (isMini) {
      sidebar.classList.add('mini');
      mainContent.classList.add('mini');
    } else {
      sidebar.classList.remove('mini');
      mainContent.classList.remove('mini');
    }
    
    // Anima o padding da área de conteúdo com transição suave
    if (contentWrapper) {
      if (isMini) {
        contentWrapper.style.paddingRight = "3.125rem"; // Sidebar recolhido
      } else {
        contentWrapper.style.paddingRight = "18.75rem"; // Sidebar expandido
      }
    }
    
    // Salva o estado no localStorage
    localStorage.setItem('sidebarMini', isMini);
  }
}

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', toggleSidebar);

  // Define o ícone inicial como bars se não for mini
  if (!sidebar.classList.contains('mini')) {
    const icon = sidebarToggle.querySelector('i');
    if (icon.classList.contains('fa-chevron-right')) {
      icon.classList.replace('fa-chevron-right', 'fa-bars');
    }
  }

  // Fecha o sidebar ao clicar na overlay com animação suave
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('show');
      
      // Atrasa a remoção da classe 'show' do overlay para permitir a animação
      setTimeout(() => {
        sidebarOverlay.classList.remove('show');
      }, 50);
      
      // Reseta a rotação do ícone
      const icon = sidebarToggle.querySelector('i');
      icon.style.transform = 'rotate(0deg)';
    });
  }
  
  // Evento de resize: quando passar para mobile, remove o padding-right inline
  // e trata responsivamente as transições
  window.addEventListener('resize', () => {
    const contentWrapper = document.querySelector('.content-wrapper');
    
    if (window.innerWidth <= 768) {
      if (contentWrapper) {
        contentWrapper.style.paddingRight = "";
      }
      
      // Se o sidebar estiver no modo expandido, oculta-o em modo mobile
      if (sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
        if (sidebarOverlay) {
          sidebarOverlay.classList.remove('show');
        }
      }
      
      // No mobile, o sidebar sempre começa oculto
      if (sidebar.classList.contains('mini')) {
        sidebar.classList.remove('mini');
      }
      
      // Redefine os ícones para modo mobile
      const icon = sidebarToggle.querySelector('i');
      if (icon.classList.contains('fa-chevron-right')) {
        icon.classList.replace('fa-chevron-right', 'fa-bars');
      }
      icon.style.transform = 'rotate(0deg)';
    } else {
      // Em desktop, restaura o estado do sidebar do localStorage
      const shouldBeMini = localStorage.getItem('sidebarMini') === 'true';
      
      if (shouldBeMini !== sidebar.classList.contains('mini')) {
        if (shouldBeMini) {
          sidebar.classList.add('mini');
          mainContent.classList.add('mini');
          if (contentWrapper) {
            contentWrapper.style.paddingRight = "3.125rem";
          }
          toggleSidebarIcon(true);
        } else {
          sidebar.classList.remove('mini');
          mainContent.classList.remove('mini');
          if (contentWrapper) {
            contentWrapper.style.paddingRight = "18.75rem";
          }
          toggleSidebarIcon(false);
        }
      }
    }
  });
}

// Modal de idioma
function toggleLanguageModal() {
  const modal = document.getElementById('language-modal');
  modal.classList.toggle('show');
}

// Theme modal
function toggleThemeModal() {
  const modal = document.getElementById('theme-modal');
  modal.classList.toggle('show');
  
  // Update theme modal options when opening
  if (modal.classList.contains('show')) {
    updateThemeModalOptions();
  }
}

// Function to update theme modal options based on current theme
function updateThemeModalOptions() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const darkOption = document.getElementById('dark-theme-option');
  const lightOption = document.getElementById('light-theme-option');
  
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

// Change theme function
function changeTheme(theme) {
  // Save to localStorage
  localStorage.setItem('theme', theme);
  
  // Apply theme change to document
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update all theme toggle icons and logo
  updateThemeIcons();
  updateBrandLogo(theme);
  
  // Update theme modal options
  updateThemeModalOptions();
  
  // Close the modal
  document.getElementById('theme-modal').classList.remove('show');
}

// Function to update theme icons based on current theme
function updateThemeIcons() {
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

// Business selector modal
function toggleBusinessModal() {
  const modal = document.getElementById('business-modal');
  modal.classList.toggle('show');
  
  // Clear search input when opening the modal
  if (modal.classList.contains('show')) {
    const searchInput = document.getElementById('business-search-input');
    if (searchInput) {
      searchInput.value = '';
      // Focus on search input for better UX
      setTimeout(() => {
        searchInput.focus();
      }, 300);
    }
    
    // Trigger search event to refresh list (show all)
    if (searchInput) {
      searchInput.dispatchEvent(new Event('input'));
    }
  }
}

// Profile modal
function toggleProfileModal() {
  const modal = document.getElementById('profile-modal');
  modal.classList.toggle('show');
}

// Fecha os modais ao clicar fora deles
document.addEventListener('click', function(e) {
  const languageModal = document.getElementById('language-modal');
  const languageModalContent = languageModal.querySelector('.language-modal-content');
  const languageButton = document.getElementById('language-selector-btn');
  const mobileLanguageButton = document.getElementById('mobile-language-selector-btn');
  
  if (languageModal.classList.contains('show') && 
      !languageModalContent.contains(e.target) && 
      !languageButton.contains(e.target) &&
      !mobileLanguageButton.contains(e.target)) {
    languageModal.classList.remove('show');
  }

  const themeModal = document.getElementById('theme-modal');
  const themeModalContent = themeModal.querySelector('.language-modal-content');
  const themeButton = document.getElementById('theme-toggle');
  const mobileThemeButton = document.getElementById('mobile-theme-toggle');
  
  if (themeModal.classList.contains('show') && 
      !themeModalContent.contains(e.target) && 
      !themeButton.contains(e.target) &&
      (mobileThemeButton ? !mobileThemeButton.contains(e.target) : true)) {
    themeModal.classList.remove('show');
  }

  const businessModal = document.getElementById('business-modal');
  const businessModalContent = businessModal.querySelector('.language-modal-content');
  const businessButton = document.getElementById('business-selector-btn');
  const mobileBusinessButton = document.getElementById('business-selector-btn-mobile');
  
  if (businessModal.classList.contains('show') && 
      !businessModalContent.contains(e.target) && 
      !businessButton.contains(e.target) &&
      !mobileBusinessButton.contains(e.target)) {
    businessModal.classList.remove('show');
  }
  
  const profileModal = document.getElementById('profile-modal');
  if (profileModal) {
    const profileModalContent = profileModal.querySelector('.language-modal-content');
    const profileButton = document.getElementById('profile-btn');
    const mobileProfileButton = document.getElementById('mobile-profile-btn');
    
    if (profileModal.classList.contains('show') && 
        !profileModalContent.contains(e.target) && 
        !profileButton.contains(e.target) &&
        (mobileProfileButton ? !mobileProfileButton.contains(e.target) : true)) {
      profileModal.classList.remove('show');
    }
  }
});

// Tratador de mudança de idioma
function changeLanguage(lang) {
  // Save to cookie for server-side rendering
  document.cookie = `i18next=${lang};path=/`;
  
  // Save to localStorage for client-side preference
  localStorage.setItem('language', lang);
  
  // Set RTL for appropriate languages (none of our current languages are RTL)
  const rtlLanguages = ['ar', 'fa', 'he', 'ur'];
  if (rtlLanguages.includes(lang)) {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }
  
  window.location.reload();
}

// Function to load businesses from API and populate the selector
async function loadBusinesses() {
  try {
    const businessModalBody = document.getElementById('business-modal-body');
    const currentBusinessName = document.getElementById('current-business-name');
    const currentBusinessNameMobile = document.getElementById('current-business-name-mobile');
    
    if (!businessModalBody) {
      return; // Modal not found in the DOM
    }
    
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
    const businesses = data.businesses || [];
    const activeBusiness = data.activeBusiness || '';
    
    // Clear the loading state
    businessModalBody.innerHTML = '';
    
    if (businesses.length === 0) {
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
    let activeBusinessData = businesses.find(b => b._id === activeBusiness);
    
    // If no active business is set in session or it's invalid, use the first one
    if (!activeBusinessData && businesses.length > 0) {
      activeBusinessData = businesses[0];
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
    businesses.forEach(business => {
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
        selectBusiness(business._id);
      });
      
      businessOption.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectBusiness(business._id);
        }
      });
      
      businessModalBody.appendChild(businessOption);
    });
    
    // Setup search functionality
    const searchInput = document.getElementById('business-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const options = document.querySelectorAll('#business-modal-body .language-modal-option');
        
        options.forEach(option => {
          const businessName = option.getAttribute('data-business-name');
          const businessId = option.getAttribute('data-business-id');
          const idText = option.querySelector('.business-id').textContent.toLowerCase();
          
          if (businessName.includes(searchTerm) || businessId.includes(searchTerm) || idText.includes(searchTerm)) {
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
            businessModalBody.appendChild(noResults);
          }
        } else if (noResultsMessage) {
          noResultsMessage.remove();
        }
      });
      
      // Handle keyboard navigation within the search results
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const visibleOptions = Array.from(document.querySelectorAll('#business-modal-body .language-modal-option')).filter(opt => opt.style.display !== 'none');
          if (visibleOptions.length > 0) {
            visibleOptions[0].focus();
          }
        }
      });
      
      // Allow keyboard navigation through business options
      const options = document.querySelectorAll('#business-modal-body .language-modal-option');
      options.forEach((option, index) => {
        option.addEventListener('keydown', function(e) {
          const visibleOptions = Array.from(document.querySelectorAll('#business-modal-body .language-modal-option')).filter(opt => opt.style.display !== 'none');
          const currentIndex = visibleOptions.indexOf(this);
          
          if (e.key === 'ArrowDown' && currentIndex < visibleOptions.length - 1) {
            e.preventDefault();
            visibleOptions[currentIndex + 1].focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
              visibleOptions[currentIndex - 1].focus();
            } else {
              searchInput.focus();
            }
          }
        });
      });
    }
    
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
          <button class="btn btn-outline-primary btn-sm" onclick="loadBusinesses()">
            <i class="fas fa-sync-alt me-2"></i>Retry
          </button>
        </div>
      `;
    }
  }
}

// Function to select a business
async function selectBusiness(businessId) {
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
      document.getElementById('business-modal').classList.remove('show');
      
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
      if (spinner) {
        spinner.parentElement.remove();
      }
    });
    
    // Show error message
    const errorToast = showToast('danger', error.message || 'Failed to select business');
  }
}

// Initialize language direction based on saved preference
document.addEventListener('DOMContentLoaded', function() {
  const currentLang = localStorage.getItem('language') || 
                      document.cookie.replace(/(?:(?:^|.*;\s*)i18next\s*\=\s*([^;]*).*$)|^.*$/, "$1") || 
                      'en';
  
  const rtlLanguages = ['ar', 'fa', 'he', 'ur'];
  if (rtlLanguages.includes(currentLang)) {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }
  
  // Add keyboard navigation for language modal
  const languageOptions = document.querySelectorAll('.language-modal-option');
  languageOptions.forEach(option => {
    option.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const lang = this.getAttribute('data-lang');
        if (lang) {
          changeLanguage(lang);
        }
        const theme = this.getAttribute('data-theme');
        if (theme) {
          changeTheme(theme);
        }
      }
    });
  });
  
  // Store user ID in localStorage for reference
  if (window.userId) {
    localStorage.setItem('userId', window.userId);
  }
});

// Função para alternar o tema
function setupThemeToggle(toggleId) {
  const themeToggle = document.getElementById(toggleId);
  if (themeToggle) {
    themeToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleThemeModal();
    });
  }
}

// Apply saved theme on initial load
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Function to update brand logo based on theme
function updateBrandLogo(theme) {
  const brandLogo = document.querySelector('.navbar-brand img');
  if (brandLogo) {
    brandLogo.src = theme === 'light'
      ? 'https://assets.tracklead.com/assets/logo-azul-preto.png'
      : 'https://assets.tracklead.com/assets/logo-ciano-branco.png';
  }
}

// Helper function to show toast notifications
function showToast(type, message) {
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-white bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  
  document.body.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
  
  // Auto-remove after it's hidden
  toastEl.addEventListener('hidden.bs.toast', function() {
    document.body.removeChild(toastEl);
  });
  
  return toast;
}

// Lida com mudanças de orientação com animações suaves
window.addEventListener('orientationchange', function() {
  // Usamos um timeout para permitir que o navegador atualize primeiro
  setTimeout(function() {
    if (sidebar && sidebar.classList.contains('show')) {
      // Primeiro, definimos a opacidade do overlay para 0 para iniciar a transição
      if (sidebarOverlay) {
        sidebarOverlay.style.opacity = '0';
      }
      
      // Em seguida, após um pequeno atraso, removemos as classes de exibição
      setTimeout(function() {
        sidebar.classList.remove('show');
        if (sidebarOverlay) {
          sidebarOverlay.classList.remove('show');
          // Redefinimos a opacidade para o padrão
          sidebarOverlay.style.opacity = '';
        }
      }, 300);
    }
  }, 100);
});

// Gestos de toque aprimorados para melhor experiência mobile
if (sidebar) {
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartTime = 0;
  let touchEndTime = 0;
  
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartTime = new Date().getTime();
  }, { passive: true });
  
  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndTime = new Date().getTime();
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 70; // Reduzido para aumentar sensibilidade
    const swipeTimeThreshold = 300; // Tempo máximo para um swipe ser considerado intencional
    const swipeTime = touchEndTime - touchStartTime;
    
    // Verifica se o movimento foi rápido o suficiente para ser considerado um swipe
    if (swipeTime <= swipeTimeThreshold) {
      // Swipe para a direita (abre sidebar)
      if (touchEndX - touchStartX > swipeThreshold && window.innerWidth <= 768) {
        if (!sidebar.classList.contains('show')) {
          sidebar.classList.add('show');
          if (sidebarOverlay) {
            sidebarOverlay.classList.add('show');
          }
          
          // Anima o ícone do toggle
          const icon = sidebarToggle.querySelector('i');
          icon.style.transform = 'rotate(180deg)';
        }
      }
      
      // Swipe para a esquerda (fecha sidebar)
      if (touchStartX - touchEndX > swipeThreshold && window.innerWidth <= 768) {
        if (sidebar.classList.contains('show')) {
          sidebar.classList.remove('show');
          
          // Atrasa a remoção da overlay para manter a animação suave
          setTimeout(() => {
            if (sidebarOverlay) {
              sidebarOverlay.classList.remove('show');
            }
          }, 50);
          
          // Anima o ícone do toggle
          const icon = sidebarToggle.querySelector('i');
          icon.style.transform = 'rotate(0deg)';
        }
      }
    }
  }
  
  // Adiciona efeitos de resposta tátil para links do sidebar
  document.querySelectorAll('.nav-link, .nav-header').forEach(link => {
    link.addEventListener('touchstart', function() {
      this.style.transition = 'background-color 0.15s ease';
      if (!this.classList.contains('active')) {
        this.style.backgroundColor = 'var(--surface-hover)';
      }
    }, { passive: true });
    
    link.addEventListener('touchend', function() {
      this.style.transition = 'background-color 0.3s ease';
      if (!this.classList.contains('active')) {
        this.style.backgroundColor = '';
      }
    }, { passive: true });
    
    link.addEventListener('touchcancel', function() {
      this.style.backgroundColor = '';
    }, { passive: true });
  });
}

// Carregamento responsivo de imagens
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img[data-src]');
  if (images.length > 0) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => {
      imageObserver.observe(img);
    });
  }
});