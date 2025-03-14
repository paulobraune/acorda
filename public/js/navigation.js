// Client-side navigation to prevent full page reloads
document.addEventListener('DOMContentLoaded', function() {
  // Store the current page URL for comparison
  let currentPage = window.location.pathname;
  
  // Cache for loaded content to reduce requests
  const pageCache = {};
  
  // Get the main content container
  const mainContent = document.querySelector('.content-wrapper');
  
  // Intercept all clicks on sidebar navigation links
  document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetHref = this.getAttribute('href');
      
      // Don't reload if clicking the current page
      if (targetHref === currentPage) {
        return;
      }
      
      // Update sidebar active state
      document.querySelectorAll('.sidebar .nav-link').forEach(navLink => {
        navLink.classList.remove('active');
      });
      this.classList.add('active');
      
      // Update browser URL without page refresh
      window.history.pushState({ path: targetHref }, '', targetHref);
      
      // Load the new page content
      loadPageContent(targetHref);
    });
  });
  
  // Handle browser back/forward navigation
  window.addEventListener('popstate', function(e) {
    const targetPath = window.location.pathname;
    loadPageContent(targetPath);
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar .nav-link').forEach(navLink => {
      if (navLink.getAttribute('href') === targetPath) {
        navLink.classList.add('active');
      } else {
        navLink.classList.remove('active');
      }
    });
  });
  
  // Function to load page content
  function loadPageContent(url) {
    // Show loading indicator
    mainContent.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    // Check if we have this page cached
    if (pageCache[url]) {
      updatePageContent(pageCache[url], url);
      return;
    }
    
    // Fetch the page content
    fetch(url)
      .then(response => response.text())
      .then(html => {
        // Cache the fetched content
        pageCache[url] = html;
        updatePageContent(html, url);
      })
      .catch(error => {
        console.error('Error loading page:', error);
        mainContent.innerHTML = `
          <div class="alert alert-danger m-4" role="alert">
            <h4 class="alert-heading">Error Loading Page</h4>
            <p>An error occurred while trying to load the page content. Please try again or refresh the page.</p>
            <hr>
            <p class="mb-0">If the problem persists, please contact support.</p>
          </div>
        `;
      });
  }
  
  // Function to update page content
  function updatePageContent(html, url) {
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract content from the new page
    const newContent = doc.querySelector('.content-wrapper').innerHTML;
    
    // Update page title
    const pageTitle = doc.querySelector('title').textContent;
    document.title = pageTitle;
    
    // Update the content area
    mainContent.innerHTML = newContent;
    
    // Execute any scripts in the new content
    Array.from(doc.querySelectorAll('.content-wrapper script')).forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      mainContent.appendChild(newScript);
    });
    
    // Update current page
    currentPage = url;
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
});