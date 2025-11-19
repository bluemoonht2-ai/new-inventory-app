import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.shopify.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.shopify.com"],
      frameSrc: ["'self'", "https://cdn.shopify.com", "https://*.myshopify.com"],
      frameAncestors: ["'self'", "https://*.myshopify.com", "https://admin.shopify.com"]
    }
  }
}));
app.use(compression());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Custom CSP middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://cdn.shopify.com; script-src 'self' 'unsafe-inline' https://cdn.shopify.com; frame-src 'self' https://cdn.shopify.com https://*.myshopify.com; frame-ancestors https://*.myshopify.com https://admin.shopify.com;"
  );
  next();
});

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SCOPES = "read_products,read_orders,write_products,read_inventory,read_customers",
  HOST,
  PORT = 3000,
  NODE_ENV = 'development',
  MONGODB_URI
} = process.env;

if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !HOST) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

// MongoDB Connection
const connectDB = async () => {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ MongoDB Connected');
    } else {
      console.log('⚠️  MONGODB_URI not set, using development mode with local JSON files');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// MongoDB Models
const Token = mongoose.model('Token', new mongoose.Schema({
  shop: { type: String, required: true, unique: true },
  access_token: { type: String, required: true },
  installed_at: { type: Date, default: Date.now },
  scopes: { type: String, required: true }
}));

const Inventory = mongoose.model('Inventory', new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  initialInventory: { type: Number, required: true },
  reorderPoint: { type: Number, default: 5 },
  lastUpdated: { type: Date, default: Date.now }
}));

const OrderStatus = mongoose.model('OrderStatus', new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  notes: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  shop: { type: String, required: true },
  history: [{
    from: String,
    to: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
}));

const PurchaseOrder = mongoose.model('PurchaseOrder', new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  originalOrderId: { type: String, required: true },
  originalOrderName: { type: String, required: true },
  items: [{
    productName: String,
    quantity: Number,
    sku: String,
    variantTitle: String
  }],
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'ordered' },
  notes: { type: String, default: '' },
  shop: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
}));

// Enhanced Rate limiting - Shopify App Optimized
const createAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for Shopify app usage
  message: {
    error: "Too many requests, please try again after 15 minutes",
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.query.shop || req.ip;
  },
  skip: (req) => {
    if (req.path.includes('/webhooks/')) return true;
    if (req.path === '/health') return true;
    return false;
  },
  handler: (req, res) => {
    const key = req.query.shop || req.ip;
    console.log(`🚨 Rate limit exceeded for: ${key}`);
    res.status(429).json({
      error: "Too many requests, please try again later",
      details: `Rate limit exceeded for ${key}`,
      retryAfter: 900,
      tips: [
        "Reduce the frequency of manual refreshes",
        "Use the auto-refresh feature instead",
        "Contact support if this persists"
      ]
    });
  }
});

// Apply to API routes only
app.use('/api/', createAccountLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Generate unique purchase order ID
const generatePurchaseOrderId = () => {
  return `PO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
};

// Enhanced GraphQL function with detailed logging
async function graphql(shop, token, query, vars = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔍 GraphQL Attempt ${i + 1} for ${shop}`);
      
      const response = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify({ query, variables: vars }),
      });

      console.log(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error: ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.errors) {
        console.error('❌ GraphQL Errors:', JSON.stringify(data.errors, null, 2));
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }
      
      console.log(`✅ GraphQL Success`);
      return data;
    } catch (error) {
      console.error(`❌ GraphQL attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Database Helper Functions
const dbHelpers = {
  // Token operations
  getToken: async (shop) => {
    if (mongoose.connection.readyState === 1) {
      const tokenDoc = await Token.findOne({ shop });
      return tokenDoc ? tokenDoc.access_token : null;
    }
    return null;
  },

  saveToken: async (shop, access_token, scopes) => {
    if (mongoose.connection.readyState === 1) {
      await Token.findOneAndUpdate(
        { shop },
        { 
          access_token, 
          installed_at: new Date(),
          scopes: scopes || SCOPES
        },
        { upsert: true, new: true }
      );
      return true;
    }
    return false;
  },

  // Inventory operations
  getInventory: async () => {
    if (mongoose.connection.readyState === 1) {
      const inventory = await Inventory.find();
      return inventory.reduce((acc, item) => {
        acc[item.sku] = {
          initialInventory: item.initialInventory,
          reorderPoint: item.reorderPoint,
          lastUpdated: item.lastUpdated
        };
        return acc;
      }, {});
    }
    return {};
  },

  saveInventory: async (sku, initialInventory, reorderPoint = 5) => {
    if (mongoose.connection.readyState === 1) {
      await Inventory.findOneAndUpdate(
        { sku },
        { 
          initialInventory,
          reorderPoint,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
      return true;
    }
    return false;
  },

  // OrderStatus operations
  getOrderStatus: async () => {
    if (mongoose.connection.readyState === 1) {
      const orderStatuses = await OrderStatus.find();
      return orderStatuses.reduce((acc, item) => {
        acc[item.orderId] = {
          status: item.status,
          notes: item.notes,
          updatedAt: item.updatedAt,
          shop: item.shop,
          history: item.history
        };
        return acc;
      }, {});
    }
    return {};
  },

  saveOrderStatus: async (orderId, status, notes, shop) => {
    if (mongoose.connection.readyState === 1) {
      const existing = await OrderStatus.findOne({ orderId });
      const previousStatus = existing ? existing.status : 'fresh';
      
      await OrderStatus.findOneAndUpdate(
        { orderId },
        {
          status,
          notes: notes || '',
          updatedAt: new Date(),
          shop,
          $push: {
            history: {
              from: previousStatus,
              to: status,
              timestamp: new Date(),
              notes: notes || ''
            }
          }
        },
        { upsert: true, new: true }
      );
      return true;
    }
    return false;
  },

  // PurchaseOrder operations
  getPurchaseOrders: async () => {
    if (mongoose.connection.readyState === 1) {
      return await PurchaseOrder.find().sort({ createdAt: -1 });
    }
    return [];
  },

  savePurchaseOrder: async (purchaseOrderData) => {
    if (mongoose.connection.readyState === 1) {
      const purchaseOrder = new PurchaseOrder(purchaseOrderData);
      await purchaseOrder.save();
      return purchaseOrder;
    }
    return null;
  },

  updatePurchaseOrderStatus: async (id, status) => {
    if (mongoose.connection.readyState === 1) {
      await PurchaseOrder.findOneAndUpdate(
        { id },
        { 
          status,
          updatedAt: new Date()
        }
      );
      return true;
    }
    return false;
  }
};

// Purchase Order Creation Function
async function createPurchaseOrder(orderId, shop, items) {
  try {
    console.log(`📋 Creating purchase order for order: ${orderId}`);
    
    const token = await dbHelpers.getToken(shop);
    
    if (!token) {
      throw new Error('No access token available for shop');
    }

    // Get order details for the PO
    const orderQuery = `
      query ($id: ID!) {
        order(id: $id) {
          id
          name
          lineItems(first: 10) {
            edges {
              node {
                title
                quantity
                variant {
                  sku
                  title
                }
              }
            }
          }
        }
      }
    `;

    let orderName = `Order ${orderId}`;
    try {
      const orderData = await graphql(shop, token, orderQuery, { id: orderId });
      if (orderData.data?.order) {
        orderName = orderData.data.order.name;
      }
    } catch (error) {
      console.log('⚠️ Could not fetch order details, using fallback name');
    }

    const purchaseOrder = {
      id: generatePurchaseOrderId(),
      originalOrderId: orderId,
      originalOrderName: orderName,
      items: items,
      createdAt: new Date(),
      status: 'ordered',
      notes: `Created for order ${orderName} due to out of stock items.`,
      shop: shop
    };

    const savedPO = await dbHelpers.savePurchaseOrder(purchaseOrder);
    if (!savedPO) {
      throw new Error('Failed to save purchase order to database');
    }
    
    console.log(`✅ Created purchase order ${savedPO.id} with ${items.length} items`);
    return savedPO;
  } catch (error) {
    console.error('❌ Error creating purchase order:', error);
    throw error;
  }
}

// OAuth Routes
app.get("/auth", (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).json({ error: "Missing shop parameter" });

  const redirectUri = `${HOST}/auth/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  console.log(`🔐 Starting OAuth for shop: ${shop}`);
  console.log(`🔑 Scopes being requested: ${SCOPES}`);
  
  res.redirect(installUrl);
});

app.get("/auth/callback", async (req, res) => {
  try {
    const { shop, code, host } = req.query;
    
    if (!shop || !code) {
      return res.status(400).json({ error: "Missing shop or code parameter" });
    }

    console.log(`🔄 OAuth callback for shop: ${shop}`);

    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const resp = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`❌ OAuth token exchange failed: ${resp.status}`, errorText);
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    
    const data = await resp.json();
    
    await dbHelpers.saveToken(shop, data.access_token, data.scope);
    
    console.log(`✅ App installed successfully for ${shop}`);
    console.log(`📋 Granted scopes: ${data.scope || SCOPES}`);
    
    const redirectUrl = host 
      ? `https://${shop}/admin/apps/${SHOPIFY_API_KEY}`
      : `${HOST}/?shop=${shop}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ OAuth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Fixed Orders API without customer field
app.get("/api/orders", async (req, res) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: "Missing shop parameter" });
    }

    const token = await dbHelpers.getToken(shop);
    
    if (!token) {
      return res.status(403).json({ error: "App not installed" });
    }

    console.log(`📋 Fetching orders for: ${shop}`);

    // Simplified orders query without customer field
    const q = `
      query {
        orders(first: 50, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              email
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      sku
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const json = await graphql(shop, token, q);
    
    const orderCount = json.data?.orders?.edges?.length || 0;
    console.log(`✅ Fetched ${orderCount} orders for ${shop}`);
    
    res.json(json);
  } catch (error) {
    console.error("❌ Orders API error:", error);
    res.status(500).json({ 
      error: "Failed to fetch orders", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Products API
app.get("/api/products", async (req, res) => {
  try {
    const { shop } = req.query;
    const token = await dbHelpers.getToken(shop);
    
    if (!token) return res.status(403).json({ error: "App not installed" });

    console.log(`📦 Fetching products for: ${shop}`);

    const q = `
      query {
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
              description
              featuredImage {
                url
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    sku
                    title
                    price
                    inventoryItem {
                      tracked
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const json = await graphql(shop, token, q);
    const productCount = json.data?.products?.edges?.length || 0;
    console.log(`✅ Fetched ${productCount} products`);
    
    res.json(json);
  } catch (error) {
    console.error("❌ Products API error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Order Status Management with Purchase Order Creation
app.post("/api/order-status", async (req, res) => {
  try {
    const { orderId, status, notes, shop, purchaseOrderItems } = req.body;
    
    console.log(`🔄 Order status update request:`, {
      orderId,
      status,
      shop,
      hasNotes: !!notes,
      hasPurchaseOrderItems: !!purchaseOrderItems
    });
    
    if (!orderId || !status) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing orderId or status" 
      });
    }

    if (!shop) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing shop parameter" 
      });
    }

    // Verify the app is installed for this shop
    const token = await dbHelpers.getToken(shop);
    
    if (!token) {
      return res.status(403).json({ 
        success: false, 
        error: "App not installed for this shop" 
      });
    }

    await dbHelpers.saveOrderStatus(orderId, status, notes, shop);
    
    console.log(`✅ Updated order ${orderId} status to: ${status}`);

    let purchaseOrder = null;
    
    // CREATE PURCHASE ORDER WHEN STATUS IS OUT_OF_STOCK AND ITEMS ARE PROVIDED
    if (status === 'out_of_stock' && purchaseOrderItems && Array.isArray(purchaseOrderItems) && purchaseOrderItems.length > 0) {
      try {
        console.log(`📋 Creating purchase order for out_of_stock order ${orderId} with ${purchaseOrderItems.length} items`);
        
        purchaseOrder = await createPurchaseOrder(orderId, shop, purchaseOrderItems);
        
        if (purchaseOrder) {
          console.log(`✅ Purchase order created:`, purchaseOrder.id);
        }
      } catch (poError) {
        console.error('❌ Purchase order creation failed:', poError);
        // Don't fail the entire request if purchase order creation fails
      }
    }

    const orderStatusData = await dbHelpers.getOrderStatus();
    
    const responseData = { 
      success: true, 
      data: orderStatusData[orderId],
      purchaseOrderCreated: !!purchaseOrder,
      purchaseOrder: purchaseOrder
    };
    
    res.json(responseData);
    
  } catch (error) {
    console.error("❌ Order status update error:", error);
    
    const errorResponse = { 
      success: false, 
      error: "Failed to update order status",
      details: error.message
    };
    
    res.status(500).json(errorResponse);
  }
});

// Order Status GET endpoint
app.get("/api/order-status", async (req, res) => {
  try {
    const status = await dbHelpers.getOrderStatus();
    res.json(status);
  } catch (error) {
    console.error("❌ Order status read error:", error);
    res.status(500).json({ error: "Failed to read order status" });
  }
});

// Get orders by status
app.get("/api/orders-by-status", async (req, res) => {
  try {
    const { status, shop } = req.query;
    
    if (!status) {
      return res.status(400).json({ error: "Missing status parameter" });
    }

    const orderStatusData = await dbHelpers.getOrderStatus();
    
    // Filter orders by status
    const filteredOrders = Object.entries(orderStatusData)
      .filter(([orderId, orderData]) => orderData.status === status)
      .map(([orderId, orderData]) => ({
        id: orderId,
        ...orderData
      }));

    console.log(`📋 Found ${filteredOrders.length} orders with status: ${status}`);
    
    res.json({
      status: status,
      count: filteredOrders.length,
      orders: filteredOrders
    });
  } catch (error) {
    console.error("❌ Orders by status error:", error);
    res.status(500).json({ error: "Failed to fetch orders by status" });
  }
});

// Purchase Orders API
app.get("/api/purchase-orders", async (req, res) => {
  try {
    const purchaseOrders = await dbHelpers.getPurchaseOrders();
    
    console.log(`📋 Serving ${purchaseOrders.length} purchase orders`);
    res.json(purchaseOrders);
  } catch (error) {
    console.error("❌ Purchase orders read error:", error);
    res.status(500).json({ error: "Failed to fetch purchase orders" });
  }
});

// Create Purchase Order Endpoint
app.post("/api/purchase-orders/create", async (req, res) => {
  try {
    const { orderId, shop, items } = req.body;
    
    console.log(`🔄 Purchase order creation request:`, {
      orderId,
      shop,
      itemCount: items?.length || 0
    });
    
    if (!orderId || !shop || !items || !Array.isArray(items)) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing orderId, shop, or items array" 
      });
    }

    // Verify the app is installed for this shop
    const token = await dbHelpers.getToken(shop);
    
    if (!token) {
      return res.status(403).json({ 
        success: false, 
        error: "App not installed for this shop" 
      });
    }

    const purchaseOrder = await createPurchaseOrder(orderId, shop, items);
    
    res.json({
      success: true,
      purchaseOrder,
      message: `Purchase order ${purchaseOrder.id} created successfully`
    });
    
  } catch (error) {
    console.error("❌ Purchase order creation error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to create purchase order",
      details: error.message
    });
  }
});

// Update Purchase Order Status
app.post("/api/purchase-orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Purchase Order Status Update:`, {
      purchaseOrderId: id,
      newStatus: status
    });
    
    if (!status) {
      return res.status(400).json({ 
        success: false,
        error: "Missing status" 
      });
    }

    const success = await dbHelpers.updatePurchaseOrderStatus(id, status);
    
    if (!success) {
      return res.status(404).json({ 
        success: false,
        error: "Purchase order not found or database error" 
      });
    }

    console.log(`✅ Updated purchase order ${id} status to ${status}`);
    
    const purchaseOrders = await dbHelpers.getPurchaseOrders();
    const updatedPO = purchaseOrders.find(po => po.id === id);
    
    res.json({ 
      success: true, 
      data: updatedPO,
      message: `Purchase order status updated to ${status}`
    });
  } catch (error) {
    console.error("❌ Purchase order status update error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update purchase order status",
      details: error.message
    });
  }
});

// Enhanced Analytics API
app.get("/api/analytics", async (req, res) => {
  try {
    const { shop, period = '30d' } = req.query;
    const token = await dbHelpers.getToken(shop);
    const inventory = await dbHelpers.getInventory();
    const purchaseOrders = await dbHelpers.getPurchaseOrders();
    
    if (!token) return res.status(403).json({ error: "App not installed" });

    console.log(`📊 Generating enhanced analytics for: ${shop}`);

    // Simple analytics query
    const ordersQuery = `
      query {
        orders(first: 100, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
              displayFinancialStatus
            }
          }
        }
      }
    `;

    const ordersData = await graphql(shop, token, ordersQuery);
    
    // Simple analytics calculation
    const orders = ordersData.data?.orders?.edges || [];
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + parseFloat(order.node.totalPriceSet?.shopMoney?.amount || 0);
    }, 0);

    // Calculate revenue by status for charts
    const revenueByStatus = {
      paid: 0,
      pending: 0,
      refunded: 0
    };

    orders.forEach(order => {
      const status = order.node.displayFinancialStatus?.toLowerCase() || 'pending';
      const amount = parseFloat(order.node.totalPriceSet?.shopMoney?.amount || 0);
      if (revenueByStatus[status] !== undefined) {
        revenueByStatus[status] += amount;
      }
    });

    // Inventory analytics
    const totalProducts = Object.keys(inventory).length;
    const lowStockCount = Object.values(inventory).filter(item => 
      item.initialInventory <= (item.reorderPoint || 5)
    ).length;
    const outOfStockCount = Object.values(inventory).filter(item => 
      item.initialInventory === 0
    ).length;

    // Purchase order analytics
    const poStatusCount = {
      ordered: purchaseOrders.filter(po => po.status === 'ordered').length,
      received: purchaseOrders.filter(po => po.status === 'received').length,
      cancelled: purchaseOrders.filter(po => po.status === 'cancelled').length
    };

    const analytics = {
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? parseFloat((totalRevenue / orders.length).toFixed(2)) : 0,
        period
      },
      charts: {
        revenueByStatus,
        inventoryHealth: {
          healthy: totalProducts - lowStockCount - outOfStockCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount
        },
        purchaseOrderStatus: poStatusCount
      },
      inventory: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        healthyCount: totalProducts - lowStockCount - outOfStockCount
      },
      purchaseOrders: {
        total: purchaseOrders.length,
        ...poStatusCount
      }
    };
    
    console.log(`✅ Enhanced analytics generated: $${analytics.summary.totalRevenue} revenue from ${analytics.summary.totalOrders} orders`);
    res.json(analytics);
  } catch (error) {
    console.error("❌ Analytics API error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Low Stock Alerts
app.get("/api/alerts/low-stock", async (req, res) => {
  try {
    const { shop } = req.query;
    const token = await dbHelpers.getToken(shop);
    const inventory = await dbHelpers.getInventory();
    
    if (!token) return res.status(403).json({ error: "App not installed" });

    const lowStockItems = Object.entries(inventory)
      .filter(([sku, item]) => {
        const currentInventory = item.initialInventory || 0;
        const reorderPoint = item.reorderPoint || 5;
        return currentInventory <= reorderPoint;
      })
      .map(([sku, item]) => ({ 
        sku, 
        ...item,
        alertLevel: item.initialInventory === 0 ? 'out-of-stock' : 'low-stock'
      }));

    console.log(`🚨 Found ${lowStockItems.length} low stock items for ${shop}`);
    res.json({ alerts: lowStockItems });
  } catch (error) {
    console.error("❌ Low stock alerts error:", error);
    res.status(500).json({ error: "Failed to fetch low stock alerts" });
  }
});

// Enhanced Test Shop Connection Endpoint
app.get("/api/test-connection", async (req, res) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: "Missing shop parameter" });
    }

    const token = await dbHelpers.getToken(shop);
    
    if (!token) {
      return res.status(403).json({ 
        error: "No access token",
        debug: {
          hasTokenForThisShop: false,
          shop: shop
        }
      });
    }

    // Test multiple endpoints
    const shopQuery = `
      query {
        shop {
          name
          email
          id
        }
      }
    `;

    const ordersQuery = `
      query {
        orders(first: 1) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `;

    const [shopResult, ordersResult] = await Promise.all([
      graphql(shop, token, shopQuery).catch(e => ({ error: e.message })),
      graphql(shop, token, ordersQuery).catch(e => ({ error: e.message }))
    ]);

    const response = {
      success: true,
      shop: shopResult.data?.shop || shopResult.error,
      orders: {
        count: ordersResult.data?.orders?.edges?.length || 0,
        data: ordersResult.data?.orders || ordersResult.error,
        hasError: !!ordersResult.error
      },
      connection: {
        shop: shop,
        hasToken: true,
        tokenLength: token.length,
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      }
    };

    console.log('🔗 Enhanced connection test:', response);
    res.json(response);
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    res.status(500).json({ 
      error: "Connection test failed", 
      details: error.message,
      debug: {
        shop: req.query.shop,
        hasToken: false
      }
    });
  }
});

// Reinstall endpoint to fix scope issues
app.get("/reinstall", async (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).json({ error: "Missing shop parameter" });

  // Delete existing token to force reinstall
  if (mongoose.connection.readyState === 1) {
    await Token.deleteOne({ shop });
  }

  console.log(`🔄 Forcing reinstall for shop: ${shop}`);
  
  const redirectUri = `${HOST}/auth/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  res.redirect(installUrl);
});

// Debug endpoint to check tokens and basic info
app.get("/api/debug-info", async (req, res) => {
  let tokens = [];
  if (mongoose.connection.readyState === 1) {
    tokens = await Token.find();
  }
  
  const { shop } = req.query;
  
  const response = {
    environment: NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    installedShops: tokens.map(t => t.shop),
    totalTokens: tokens.length,
    currentShop: shop,
    hasTokenForCurrentShop: shop ? tokens.some(t => t.shop === shop) : false,
    requiredScopes: SCOPES
  };

  console.log('🔧 Debug Info:', response);
  res.json(response);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    requiredScopes: SCOPES
  });
});

// API health check endpoint
app.get("/api/health-check", (req, res) => {
  res.json({ 
    status: "API Healthy", 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: [
      '/api/products',
      '/api/orders', 
      '/api/purchase-orders',
      '/api/analytics',
      '/api/inventory'
    ]
  });
});

// Enhanced Inventory endpoints with better validation
app.get("/api/inventory", async (req, res) => {
  try {
    const inventory = await dbHelpers.getInventory();
    
    const lowStockItems = Object.entries(inventory)
      .filter(([sku, item]) => item.initialInventory <= (item.reorderPoint || 5))
      .reduce((acc, [sku, item]) => {
        acc[sku] = item;
        return acc;
      }, {});

    console.log(`📦 Serving inventory data:`, {
      totalItems: Object.keys(inventory).length,
      lowStockItems: Object.keys(lowStockItems).length,
      zeroInventory: Object.entries(inventory).filter(([_, item]) => item.initialInventory === 0).length
    });
    
    res.json(inventory);
  } catch (error) {
    console.error("❌ Inventory read error:", error);
    res.status(500).json({ error: "Failed to read inventory" });
  }
});

// Enhanced inventory save endpoint with strict validation - NO NEGATIVE VALUES
app.post("/api/inventory", async (req, res) => {
  try {
    const { sku, initialInventory, reorderPoint = 5 } = req.body;
    
    console.log('📦 Inventory save request:', { sku, initialInventory, reorderPoint });
    
    if (!sku || initialInventory == null) {
      return res.status(400).json({ 
        success: false,
        error: "Missing SKU or initial inventory" 
      });
    }

    // Validate inventory value
    const inventoryValue = parseInt(initialInventory);
    if (isNaN(inventoryValue)) {
      return res.status(400).json({
        success: false,
        error: "Invalid inventory value - must be a number"
      });
    }

    // STRICTLY PREVENT negative inventory values
    if (inventoryValue < 0) {
      return res.status(400).json({
        success: false,
        error: "Inventory value cannot be negative. Please enter 0 or higher."
      });
    }

    const success = await dbHelpers.saveInventory(sku, inventoryValue, reorderPoint);
    if (!success) {
      throw new Error('Failed to save inventory data to database');
    }
    
    console.log(`✅ Saved inventory for SKU: ${sku} = ${inventoryValue}`);
    
    const inventory = await dbHelpers.getInventory();
    
    res.json({ 
      success: true, 
      data: inventory[sku],
      message: `Inventory set to ${inventoryValue} for SKU: ${sku}`
    });
  } catch (error) {
    console.error("❌ Inventory save error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to save inventory",
      details: error.message
    });
  }
});

// New endpoint to get low stock report
app.get("/api/inventory/low-stock-report", async (req, res) => {
  try {
    const inventory = await dbHelpers.getInventory();
    
    const report = {
      totalProducts: Object.keys(inventory).length,
      lowStock: [],
      outOfStock: [],
      healthyStock: []
    };

    Object.entries(inventory).forEach(([sku, item]) => {
      const stockItem = { sku, ...item };
      
      if (item.initialInventory === 0) {
        report.outOfStock.push(stockItem);
      } else if (item.initialInventory <= (item.reorderPoint || 5)) {
        report.lowStock.push(stockItem);
      } else {
        report.healthyStock.push(stockItem);
      }
    });

    console.log(`📊 Inventory Report:`, {
      total: report.totalProducts,
      outOfStock: report.outOfStock.length,
      low: report.lowStock.length,
      healthy: report.healthyStock.length
    });

    res.json(report);
  } catch (error) {
    console.error("❌ Inventory report error:", error);
    res.status(500).json({ error: "Failed to generate inventory report" });
  }
});

// Ensure API routes don't get served as static files
app.use('/api/', (req, res, next) => {
  next();
});

// Enhanced error handling middleware for API routes
app.use('/api/', (error, req, res, next) => {
  console.error('💥 API Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    ...(NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler for API routes
app.use('/api/', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Serve frontend - THIS SHOULD BE LAST
app.get("/", (req, res) => {
  res.json({ 
    message: "Shopify Inventory App API", 
    status: "Running with MongoDB",
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: [
      "/health",
      "/api/products?shop=your-store",
      "/api/orders?shop=your-store",
      "/api/purchase-orders",
      "/api/test-connection?shop=your-store",
      "/reinstall?shop=your-store (to fix scope issues)"
    ],
    requiredScopes: SCOPES
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Shopify Inventory App Running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Host: ${HOST}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log(`📋 Required Scopes: ${SCOPES}`);
  console.log(`\n📊 Available Endpoints:`);
  console.log(`   • Health: ${HOST}/health`);
  console.log(`   • Products: ${HOST}/api/products?shop=your-store`);
  console.log(`   • Orders: ${HOST}/api/orders?shop=your-store`);
  console.log(`   • Purchase Orders: ${HOST}/api/purchase-orders`);
  console.log(`   • Test Connection: ${HOST}/api/test-connection?shop=your-store`);
  console.log(`   • Reinstall (fix scopes): ${HOST}/reinstall?shop=your-store`);
  console.log(`\n✅ Ready to serve data!`);
});