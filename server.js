const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-http-middleware");
const Backend = require("i18next-fs-backend");
const db = require('./utils/db'); // Import the database utility

// Comment out the Redis section if not using Redis
/*
const { createClient } = require('redis');
const RedisStore = require('connect-redis').default;

// Initialize Redis client
let redisClient = createClient();
redisClient.connect().catch(console.error);

// Initialize Redis store
let redisStore = new RedisStore({
  client: redisClient,
  prefix: 'tracklead:'
});
*/

const app = express();

// i18next setup
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, '/locales/{{lng}}/{{ns}}.json')
    },
    fallbackLng: 'en',
    preload: ['en', 'pt-BR'],
    supportedLngs: ['en', 'pt-BR']
  });

app.use(i18nextMiddleware.handle(i18next));

// Configurando Template Engine (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
// Add middleware to serve files from locales directory
app.use('/locales', express.static(path.join(__dirname, "locales")));

// Middleware para parse de requisição POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Support for JSON payloads

// Determine environment and set production flag
const isProduction = process.env.NODE_ENV === "production";
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);

// Configurando sessão
app.use(
  session({
    // When moving to production, replace with redisStore and uncomment the Redis section above
    // store: redisStore,
    secret: "tracklead-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      // Only use secure cookies if we're behind HTTPS
      secure: false, // Set to false to work in both HTTP and HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);

// Add session debug middleware in development
if (!isProduction) {
  app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
  });
}

// Middleware to get the active business for every request
app.use(async (req, res, next) => {
  if (req.session && req.session.user && req.session.activeBusiness) {
    try {
      // Fetch active business details for this request
      const activeBusiness = await db.getById('businesses', req.session.activeBusiness);
      if (activeBusiness) {
        // Make active business available to all views
        res.locals.activeBusiness = activeBusiness;
      }
    } catch (error) {
      console.error("Error fetching active business:", error);
    }
  }
  next();
});

// Função de verificação de autenticação
function checkAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect("/login");
}

// Add middleware to handle AJAX requests
app.use((req, res, next) => {
  // If this is an AJAX request and we need authentication
  if (req.xhr && !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
});

// Rota de Login (GET)
app.get("/login", (req, res) => {
  // If already logged in, redirect to overview
  if (req.session && req.session.user) {
    return res.redirect("/overview");
  }
  res.render("login");
});

// Rota de Login (POST) - now using the database utility
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Find user by email and password
    const users = await db.find('users', { email: username, password: password });
    
    if (users.length > 0) {
      // Set session data
      req.session.user = { 
        id: users[0]._id,
        username: users[0].email,
        name: users[0].name
      };
      
      // Force session save before redirecting
      req.session.save(async (err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.render("login", { error: "Erro ao iniciar sessão. Tente novamente." });
        }
        
        // Check if user has any businesses
        const businesses = await db.find('businesses', { userId: users[0]._id });
        
        if (businesses && businesses.length > 0) {
          // If user has businesses, set the first as active and redirect to overview
          req.session.activeBusiness = businesses[0]._id;
          
          // Get active business details
          const activeBusiness = await db.getById('businesses', businesses[0]._id);
          res.locals.activeBusiness = activeBusiness;
          
          console.log("User has businesses, redirecting to /overview");
          return res.redirect("/overview");
        } else {
          // If user has no businesses, redirect to create business
          console.log("User has no businesses, redirecting to /create-business");
          return res.redirect("/create-business");
        }
      });
    } else {
      // User not found
      return res.render("login", { error: "Credenciais inválidas. Por favor, tente novamente." });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.render("login", { error: "Erro ao processar login. Tente novamente." });
  }
});

// Social Login routes
app.post("/social-login/:provider", async (req, res) => {
  const { provider } = req.params;
  
  try {
    // In a real app, would validate tokens, etc.
    // For this demo, we'll create a mock user if not exists
    
    const email = `${provider}user@example.com`;
    const name = provider === 'google' ? 'Google User' : 'Facebook User';
    
    // Check if user exists
    let users = await db.find('users', { email });
    let user;
    
    if (users.length === 0) {
      // Create user if not exists
      user = await db.create('users', {
        name,
        email,
        password: 'social-auth', // In real app, would use a random string or token
        role: 'user',
        active: true,
        provider
      });
    } else {
      user = users[0];
    }
    
    // Set session
    req.session.user = {
      id: user._id,
      username: user.email,
      name: user.name
    };
    
    // Check if user has businesses
    const businesses = await db.find('businesses', { userId: user._id });
    
    if (businesses && businesses.length > 0) {
      // Set the first business as active
      req.session.activeBusiness = businesses[0]._id;
      // Get active business details
      const activeBusiness = await db.getById('businesses', businesses[0]._id);
      res.locals.activeBusiness = activeBusiness;
    }
    
    // Save session and redirect
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.render("login", { error: "Erro ao iniciar sessão. Tente novamente." });
      }
      
      if (businesses && businesses.length > 0) {
        return res.redirect("/overview");
      } else {
        return res.redirect("/create-business");
      }
    });
    
  } catch (error) {
    console.error(`${provider} login error:`, error);
    return res.render("login", { error: `Erro ao processar login com ${provider}.` });
  }
});

// Rota de Registro (GET)
app.get("/register", (req, res) => {
  // If already logged in, redirect to overview
  if (req.session && req.session.user) {
    return res.redirect("/overview");
  }
  res.render("registration");
});

// Social Register routes
app.post("/social-register/:provider", async (req, res) => {
  const { provider } = req.params;
  
  try {
    // In a real app, would validate tokens, etc.
    // For this demo, we'll create a mock user
    
    const email = `${provider}user@example.com`;
    const name = provider === 'google' ? 'Google User' : 'Facebook User';
    
    // Check if user already exists
    const existingUsers = await db.find('users', { email });
    
    let user;
    if (existingUsers.length > 0) {
      user = existingUsers[0];
    } else {
      // Create new user
      user = await db.create('users', {
        name,
        email,
        password: 'social-auth', // In real app, would use a random string or token
        role: 'user',
        active: true,
        provider
      });
    }
    
    // Set session
    req.session.user = {
      id: user._id,
      username: user.email,
      name: user.name
    };
    
    // Save session and redirect to business creation
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.render("registration", { error: "Erro ao criar sessão. Tente novamente." });
      }
      
      return res.redirect("/create-business");
    });
    
  } catch (error) {
    console.error(`${provider} registration error:`, error);
    return res.render("registration", { error: `Erro ao registrar com ${provider}.` });
  }
});

// Create Business Route
app.get("/create-business", checkAuth, (req, res) => {
  res.render("create-business");
});

// Create Business API (POST)
app.post("/api/create-business", checkAuth, async (req, res) => {
  try {
    console.log("Received business creation request:", req.body);
    
    const { businessName, businessType, integration, plan } = req.body;
    
    // Validate required fields
    if (!businessName || !businessType) {
      return res.status(400).json({
        success: false,
        message: "Business name and type are required"
      });
    }
    
    // Create business in database
    const newBusiness = await db.create('businesses', {
      name: businessName,
      type: businessType,
      integration: integration || 'api',
      plan: plan || 'starter',
      userId: req.session.user.id,
      status: 'active'
    });
    
    console.log("Business created successfully:", newBusiness);
    
    // Add user to business_users collection with admin role
    const businessUser = await db.create('business_users', {
      userId: req.session.user.id,
      businessId: newBusiness._id,
      role: 'admin',
      status: 'active'
    });
    
    console.log("User linked to business with admin role:", businessUser);
    
    // Set this new business as the active business
    req.session.activeBusiness = newBusiness._id;
    
    return res.status(201).json({
      success: true,
      message: "Business created successfully",
      business: newBusiness,
      businessUser: businessUser
    });
  } catch (error) {
    console.error("Error creating business:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating business: " + error.message
    });
  }
});

// Rota de Registro (POST)
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUsers = await db.find('users', { email });
    if (existingUsers.length > 0) {
      return res.render("registration", { error: "Email already registered" });
    }
    
    // Create new user
    const newUser = await db.create('users', {
      name,
      email,
      password,
      role: 'user',
      active: true
    });
    
    // Set session data
    req.session.user = {
      id: newUser._id,
      username: newUser.email,
      name: newUser.name
    };
    
    // Redirect to business creation
    return res.redirect("/create-business");
  } catch (error) {
    console.error("Registration error:", error);
    return res.render("registration", { error: "Error creating account. Please try again." });
  }
});

// Rota de Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Rota principal (pós login), redireciona para /overview
app.get("/", checkAuth, (req, res) => {
  res.redirect("/overview");
});

// Helper function to get active business from session
async function getActiveBusiness(req) {
  try {
    // First check if there's an active business in the session
    if (req.session.activeBusiness) {
      const business = await db.getById('businesses', req.session.activeBusiness);
      if (business) {
        return business;
      }
    }
    
    // If no active business in session or it doesn't exist anymore,
    // get the first business the user has access to
    const userId = req.session.user.id;
    
    // First check for businesses directly owned by the user
    const ownedBusinesses = await db.find('businesses', { userId });
    
    if (ownedBusinesses.length > 0) {
      // Set the first owned business as active and return it
      req.session.activeBusiness = ownedBusinesses[0]._id;
      return ownedBusinesses[0];
    }
    
    // If no directly owned businesses, check business_users for relationships
    const businessUsers = await db.find('business_users', { userId });
    
    if (businessUsers.length > 0) {
      // Get the first business the user has access to
      const business = await db.getById('businesses', businessUsers[0].businessId);
      if (business) {
        // Set as active and return it
        req.session.activeBusiness = business._id;
        return business;
      }
    }
    
    return null; // No business found for user
  } catch (error) {
    console.error("Error fetching active business:", error);
    return null;
  }
}

// Helper function to get user's business
async function getUserBusiness(userId) {
  try {
    // First check for businesses directly owned by the user
    const ownedBusinesses = await db.find('businesses', { userId });
    
    if (ownedBusinesses.length > 0) {
      return ownedBusinesses[0]; // Return the first owned business
    }
    
    // If no directly owned businesses, check business_users for relationships
    const businessUsers = await db.find('business_users', { userId });
    
    if (businessUsers.length > 0) {
      // Get the first business the user has access to
      const business = await db.getById('businesses', businessUsers[0].businessId);
      return business;
    }
    
    return null; // No business found for user
  } catch (error) {
    console.error("Error fetching user business:", error);
    return null;
  }
}

// Helper function to get all businesses a user has access to
async function getUserBusinesses(userId) {
  try {
    // Initialize the result array
    let userBusinesses = [];
    
    // Get businesses directly owned by the user
    const ownedBusinesses = await db.find('businesses', { userId });
    userBusinesses = [...ownedBusinesses];
    
    // Get businesses the user has access to via business_users
    const businessUsers = await db.find('business_users', { userId });
    
    if (businessUsers.length > 0) {
      // For each business user relationship, get the business details
      for (const busUser of businessUsers) {
        // Skip if we already added this business (to avoid duplicates)
        if (userBusinesses.some(b => b._id === busUser.businessId)) {
          continue;
        }
        
        const business = await db.getById('businesses', busUser.businessId);
        if (business) {
          userBusinesses.push({
            ...business,
            userRole: busUser.role // Add the user's role in this business
          });
        }
      }
    }
    
    return userBusinesses;
  } catch (error) {
    console.error("Error fetching user businesses:", error);
    return [];
  }
}

// API endpoint to get user's businesses
app.get("/api/user/businesses", checkAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get all businesses the user has access to
    const businesses = await getUserBusinesses(userId);
    
    // Include which business is currently active
    const activeBusiness = req.session.activeBusiness || '';
    
    return res.json({
      success: true,
      businesses: businesses,
      activeBusiness: activeBusiness
    });
  } catch (error) {
    console.error("Error fetching user businesses:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching businesses: " + error.message
    });
  }
});

// Set active business for user session
app.post("/api/user/set-active-business", checkAuth, async (req, res) => {
  try {
    const { businessId } = req.body;
    const userId = req.session.user.id;
    
    // Verify the business exists
    const business = await db.getById('businesses', businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }
    
    // Verify user has access to this business
    const userBusinesses = await getUserBusinesses(userId);
    const hasAccess = userBusinesses.some(b => b._id === businessId);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this business"
      });
    }
    
    // Set active business in session
    req.session.activeBusiness = businessId;
    
    return res.json({
      success: true,
      message: "Active business set successfully",
      business: business
    });
  } catch (error) {
    console.error("Error setting active business:", error);
    return res.status(500).json({
      success: false,
      message: "Error setting active business: " + error.message
    });
  }
});

// Get Active Business Info
app.get("/api/user/active-business", checkAuth, async (req, res) => {
  try {
    const activeBusiness = await getActiveBusiness(req);
    
    if (!activeBusiness) {
      return res.status(404).json({
        success: false,
        message: "No active business found"
      });
    }
    
    return res.json({
      success: true,
      business: activeBusiness
    });
  } catch (error) {
    console.error("Error fetching active business:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching active business: " + error.message
    });
  }
});

// Define API endpoints for AJAX partial content
app.get("/content/:page", checkAuth, async (req, res) => {
  const page = req.params.page;
  res.render(`pages/${page}`, { 
    pageTitle: page.charAt(0).toUpperCase() + page.slice(1),
    layout: false,
    user: req.session.user,
    activeBusiness: res.locals.activeBusiness,
    partialContent: true
  });
});

// Cada página do Dashboard será renderizada usando o layout base (dashboard-layout.ejs)

// Overview
app.get("/overview", checkAuth, (req, res) => {
  res.render("pages/Overview/Overview", { pageTitle: "Overview" });
});

// Sales Analytics
app.get("/analytics/sales-analytics", checkAuth, (req, res) => {
  res.render("pages/Analytics/SalesAnalytics/index", { pageTitle: "Sales Analytics" });
});

// Customers
app.get("/analytics/customers", checkAuth, (req, res) => {
  res.render("pages/Analytics/Customers/index", { pageTitle: "Customers" });
});

// Catalog - Products
app.get("/catalog/products", checkAuth, async (req, res) => {
  try {
    // Get products from the database
    const products = await db.getAll('products');
    res.render("pages/Catalog/Products/index", { 
      pageTitle: "Products",
      products
    });
  } catch (error) {
    console.error("Error loading products:", error);
    res.render("pages/Catalog/Products/index", { 
      pageTitle: "Products",
      products: []
    });
  }
});

// Catalog - List All Feeds
app.get("/catalog/list-all-feeds", checkAuth, async (req, res) => {
  try {
    // Get feeds from the database
    const feeds = await db.getAll('feeds');
    res.render("pages/Catalog/ListAllFeeds/index", { 
      pageTitle: "List All Feeds",
      feeds
    });
  } catch (error) {
    console.error("Error loading feeds:", error);
    res.render("pages/Catalog/ListAllFeeds/index", { 
      pageTitle: "List All Feeds",
      feeds: []
    });
  }
});

// Catalog - Create New Feed
app.get("/catalog/create-new-feed", checkAuth, (req, res) => {
  res.render("pages/Catalog/CreateNewFeed/index", { pageTitle: "Create New Feed" });
});

// Catalog - Map Categories
app.get("/catalog/map-categories", checkAuth, (req, res) => {
  res.render("pages/Catalog/MapCategories/index", { pageTitle: "Map Categories" });
});

// Pixels - List All Pixels
app.get("/pixels/list-all-pixels", checkAuth, async (req, res) => {
  try {
    // Get the active business
    const activeBusiness = await getActiveBusiness(req);
    
    if (!activeBusiness) {
      return res.render("pages/Pixels/ListAllPixels/index", { 
        pageTitle: "List All Pixels",
        pixels: []
      });
    }
    
    // Get pixels for this specific business
    const allPixels = await db.getAll('pixels');
    const businessPixels = allPixels.filter(pixel => pixel.businessId === activeBusiness._id);
    
    res.render("pages/Pixels/ListAllPixels/index", { 
      pageTitle: "List All Pixels",
      pixels: businessPixels
    });
  } catch (error) {
    console.error("Error loading pixels:", error);
    res.render("pages/Pixels/ListAllPixels/index", { 
      pageTitle: "List All Pixels",
      pixels: []
    });
  }
});

// Pixels - Add New Pixel
app.get("/pixels/add-new-pixel", checkAuth, (req, res) => {
  res.render("pages/Pixels/AddNewPixel/index", { pageTitle: "Add New Pixel" });
});

// API - Create new pixel
app.post("/api/pixels", checkAuth, async (req, res) => {
  try {
    const { type, name, id, active } = req.body;
    
    // Validate required fields
    if (!type || !name || !id) {
      return res.status(400).json({ 
        success: false, 
        message: "Type, name, and ID are required fields" 
      });
    }
    
    // Get the active business
    const activeBusiness = await getActiveBusiness(req);
    
    if (!activeBusiness) {
      return res.status(404).json({ 
        success: false, 
        message: "No active business found. Please select or create a business first." 
      });
    }
    
    // Create new pixel in database
    const newPixel = await db.create('pixels', {
      type,
      name,
      id,
      businessId: activeBusiness._id, // Link to active business
      active: active !== undefined ? active : true
    });
    
    return res.status(201).json({ 
      success: true, 
      message: "Pixel created successfully", 
      pixel: newPixel 
    });
  } catch (error) {
    console.error("Error creating pixel:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error creating pixel: " + error.message 
    });
  }
});

// API - Update pixel
app.put("/api/pixels/:id", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pixelId, active } = req.body;
    
    // Get the pixel to update
    const existingPixel = await db.getById('pixels', id);
    
    if (!existingPixel) {
      return res.status(404).json({ 
        success: false, 
        message: "Pixel not found" 
      });
    }
    
    // Get active business
    const activeBusiness = await getActiveBusiness(req);
    
    // Verify user has access to this pixel through the active business
    if (!activeBusiness || existingPixel.businessId !== activeBusiness._id) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to update this pixel" 
      });
    }
    
    // Update the pixel
    const updatedPixel = await db.update('pixels', id, {
      name,
      id: pixelId,
      active
    });
    
    return res.json({ 
      success: true, 
      message: "Pixel updated successfully", 
      pixel: updatedPixel 
    });
  } catch (error) {
    console.error("Error updating pixel:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error updating pixel: " + error.message 
    });
  }
});

// API - Delete pixel
app.delete("/api/pixels/:id", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the pixel to delete
    const existingPixel = await db.getById('pixels', id);
    
    if (!existingPixel) {
      return res.status(404).json({ 
        success: false, 
        message: "Pixel not found" 
      });
    }
    
    // Get active business
    const activeBusiness = await getActiveBusiness(req);
    
    // Verify user has access to this pixel through the active business
    if (!activeBusiness || existingPixel.businessId !== activeBusiness._id) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to delete this pixel" 
      });
    }
    
    // Delete the pixel
    const deleted = await db.delete('pixels', id);
    
    return res.json({ 
      success: true, 
      message: "Pixel deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting pixel:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error deleting pixel: " + error.message 
    });
  }
});

// Pixels - Pixel Settings
app.get("/pixels/pixel-settings", checkAuth, (req, res) => {
  res.render("pages/Pixels/PixelSettings/index", { pageTitle: "Pixel Settings" });
});

// Consent - Banner Manager
app.get("/consent/banner-manager", checkAuth, (req, res) => {
  res.render("pages/Consent/BannerManager/index", { pageTitle: "Banner Manager" });
});

// Affiliate - Referrals Program
app.get("/affiliate/referrals-program", checkAuth, (req, res) => {
  res.render("pages/Affiliate/ReferralsProgram/index", { pageTitle: "Referrals Program" });
});

// Settings
app.get("/settings", checkAuth, (req, res) => {
  res.render("pages/Settings/index", { pageTitle: "Settings" });
});

// Settings - Account
app.get("/settings/account", checkAuth, (req, res) => {
  res.render("pages/Settings/Account/index", { pageTitle: "Account Settings" });
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});