import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  AppProvider,
  Page,
  Card,
  DataTable,
  TextField,
  Button,
  Select,
  Badge,
  Layout,
  Banner,
  Spinner,
  Modal,
  TextContainer,
  FormLayout,
  Tabs,
  EmptyState,
  Icon,
} from "@shopify/polaris";
import {
  AiOutlineShoppingCart,
  AiOutlineDollarCircle,
  AiOutlineReload,
  AiOutlineAlert,
  AiOutlineRise,
  AiOutlineFall,
  AiOutlineStock,
  AiOutlineBarChart,
  AiOutlinePieChart,
  AiOutlineCalendar,
  AiOutlineDownload,
  AiOutlineBell,
  AiOutlineProduct,
  AiOutlineFileText,
  AiOutlineTruck,
  AiOutlineCheckCircle,
  AiOutlineUndo,
  AiOutlineWarning,
  AiOutlineEye,
  AiOutlineEdit,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import enTranslations from '@shopify/polaris/locales/en.json';

// Custom hook for fade-in animation
const useFadeIn = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.6s ease-out'
  };
};

// Enhanced StatCard with modern design
const StatCard = ({ title, value, change, icon, color, delay, subtitle }) => {
  const style = useFadeIn(delay);
  
  const getGradient = (color) => {
    const gradients = {
      blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      green: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      purple: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      orange: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      teal: 'linear-gradient(135deg, #00cdac 0%, #8ddad5 100%)'
    };
    return gradients[color] || gradients.blue;
  };

  return (
    <div style={style}>
      <Card 
        sectioned
        style={{
          background: getGradient(color),
          color: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: 'none',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 500, 
              opacity: 0.9,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {title}
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 700, 
              margin: '8px 0 4px 0',
              lineHeight: 1.1
            }}>
              {value}
            </div>
            {subtitle && (
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8,
                marginBottom: '8px'
              }}>
                {subtitle}
              </div>
            )}
            {change && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '12px', 
                opacity: 0.9,
                fontWeight: 500
              }}>
                {change > 0 ? 
                  <AiOutlineRise style={{ marginRight: '4px' }} /> : 
                  <AiOutlineFall style={{ marginRight: '4px' }} />
                }
                {Math.abs(change)}% from last period
              </div>
            )}
          </div>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '28px',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            {icon}
          </div>
        </div>
        
        {/* Background pattern */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 1
        }}></div>
      </Card>
    </div>
  );
};

// Enhanced ChartCard with modern design
const ChartCard = ({ title, children, width = "100%", height = 300 }) => (
  <Card 
    sectioned
    style={{
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0'
    }}
  >
    <TextContainer>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '18px', 
          fontWeight: 600,
          color: '#202223'
        }}>
          {title}
        </h3>
        <div style={{
          padding: '6px 12px',
          background: '#f6f6f7',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#6d7175',
          fontWeight: 500
        }}>
          Last 30 days
        </div>
      </div>
      <div style={{ width, height }}>
        {children}
      </div>
    </TextContainer>
  </Card>
);

// Enhanced Status Badge Component
const StatusBadge = ({ status, children }) => {
  const statusConfig = {
    fresh: { background: '#e3f2fd', color: '#1976d2', border: '#bbdefb' },
    confirmed: { background: '#e8f5e8', color: '#2e7d32', border: '#c8e6c9' },
    in_stock: { background: '#e8f5e8', color: '#2e7d32', border: '#c8e6c9' },
    out_of_stock: { background: '#ffebee', color: '#c62828', border: '#ffcdd2' },
    dispatched: { background: '#fff3e0', color: '#ef6c00', border: '#ffe0b2' },
    delivered: { background: '#e8f5e8', color: '#2e7d32', border: '#c8e6c9' },
    returned: { background: '#fce4ec', color: '#ad1457', border: '#f8bbd9' },
    damaged: { background: '#fbe9e7', color: '#d84315', border: '#ffccbc' },
    canceled: { background: '#ffebee', color: '#c62828', border: '#ffcdd2' },
    ordered: { background: '#e3f2fd', color: '#1976d2', border: '#bbdefb' },
    received: { background: '#e8f5e8', color: '#2e7d32', border: '#c8e6c9' },
    cancelled: { background: '#ffebee', color: '#c62828', border: '#ffcdd2' },
    paid: { background: '#e8f5e8', color: '#2e7d32', border: '#c8e6c9' },
    pending: { background: '#fff3e0', color: '#ef6c00', border: '#ffe0b2' }
  };

  const config = statusConfig[status] || statusConfig.fresh;

  return (
    <span
      style={{
        background: config.background,
        color: config.color,
        border: `1px solid ${config.border}`,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        textTransform: 'capitalize'
      }}
    >
      {children}
    </span>
  );
};

// Enhanced Action Button Component
const ActionButton = ({ icon, label, onClick, variant = "primary", size = "medium" }) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none'
        };
      case "secondary":
        return {
          background: 'white',
          color: '#5c6ac4',
          border: '2px solid #5c6ac4'
        };
      case "success":
        return {
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          border: 'none'
        };
      default:
        return {
          background: '#f6f6f7',
          color: '#202223',
          border: '1px solid #d2d6dc'
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return { padding: '8px 16px', fontSize: '12px' };
      case "large":
        return { padding: '14px 24px', fontSize: '14px' };
      default:
        return { padding: '10px 20px', fontSize: '13px' };
    }
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...getVariantStyle(),
        ...getSizeStyle(),
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-1px)';
        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      {icon && React.cloneElement(icon, { size: 16 })}
      {label}
    </button>
  );
};

// Status options with enhanced styling
const STATUS_OPTIONS = [
  { label: "Fresh", value: "fresh", color: "#1976d2", icon: "🆕" },
  { label: "Confirmed", value: "confirmed", color: "#2e7d32", icon: "✅" },
  { label: "Canceled", value: "canceled", color: "#c62828", icon: "❌" }
];

const CONFIRMED_STATUS_OPTIONS = [
  { label: "In Stock", value: "in_stock", color: "#2e7d32", icon: "📦" },
  { label: "Out of Stock", value: "out_of_stock", color: "#c62828", icon: "⚠️" },
  { label: "Dispatched", value: "dispatched", color: "#ef6c00", icon: "🚚" },
  { label: "Returned", value: "returned", color: "#ad1457", icon: "↩️" },
  { label: "Damaged", value: "damaged", color: "#d84315", icon: "💥" },
  { label: "Delivered", value: "delivered", color: "#1976d2", icon: "📬" }
];

const PURCHASE_ORDER_STATUS_OPTIONS = [
  { label: "Ordered", value: "ordered", color: "#1976d2", icon: "📋" },
  { label: "Received", value: "received", color: "#2e7d32", icon: "📥" },
  { label: "Cancelled", value: "cancelled", color: "#c62828", icon: "🚫" },
];

// Simple CSV Export Function (as fallback since PDF is not working)
const generateCSVReport = (data, shop) => {
  const { 
    products, 
    orders, 
    inventoryData, 
    orderStatus, 
    purchaseOrders, 
    analytics,
    lowStockAlerts 
  } = data;

  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Header
  csvContent += `Inventory Management Report - ${shop}\n`;
  csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
  
  // Executive Summary
  csvContent += "EXECUTIVE SUMMARY\n";
  const totalRevenue = analytics?.summary?.totalRevenue || 0;
  const totalOrders = orders.length;
  const averageOrderValue = analytics?.summary?.averageOrderValue || 0;
  const lowStockCount = lowStockAlerts.length;
  const purchaseOrderCount = purchaseOrders.length;
  
  csvContent += `Total Revenue,$${totalRevenue.toLocaleString()}\n`;
  csvContent += `Total Orders,${totalOrders}\n`;
  csvContent += `Average Order Value,$${averageOrderValue.toFixed(2)}\n`;
  csvContent += `Products Tracked,${products.length}\n`;
  csvContent += `Low Stock Alerts,${lowStockCount}\n`;
  csvContent += `Purchase Orders,${purchaseOrderCount}\n\n`;
  
  // Products Section
  if (products.length > 0) {
    csvContent += "PRODUCTS INVENTORY\n";
    csvContent += "Product Name,Variant,SKU,Price,Inventory\n";
    products.forEach(product => {
      const inventory = inventoryData[product.sku]?.initialInventory ?? 'Not set';
      csvContent += `"${product.title}","${product.variantTitle}","${product.sku || 'N/A'}","$${product.price}","${inventory}"\n`;
    });
    csvContent += "\n";
  }
  
  // Recent Orders
  if (orders.length > 0) {
    csvContent += "RECENT ORDERS\n";
    csvContent += "Order Name,Customer,Total,Status\n";
    orders.slice(0, 20).forEach(order => {
      const status = orderStatus[order.id]?.status || 'fresh';
      csvContent += `"${order.name}","${order.customer}","${order.total}","${status}"\n`;
    });
    csvContent += "\n";
  }
  
  // Low Stock Alerts
  if (lowStockAlerts.length > 0) {
    csvContent += "LOW STOCK ALERTS\n";
    csvContent += "SKU,Product Name,Current Inventory,Reorder Point\n";
    lowStockAlerts.forEach(alert => {
      csvContent += `"${alert.sku}","${alert.productName || 'Unknown'}","${alert.initialInventory}","${alert.reorderPoint || 5}"\n`;
    });
    csvContent += "\n";
  }
  
  // Purchase Orders
  if (purchaseOrders.length > 0) {
    csvContent += "PURCHASE ORDERS\n";
    csvContent += "PO Number,Original Order,Items Count,Status\n";
    purchaseOrders.forEach(po => {
      csvContent += `"${po.id}","${po.originalOrderName || 'N/A'}","${po.items?.length || 0}","${po.status}"\n`;
    });
  }
  
  return csvContent;
};

export default function AdvancedShopifyApp() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventoryData, setInventoryData] = useState({});
  const [orderStatus, setOrderStatus] = useState({});
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [purchaseOrderModalOpen, setPurchaseOrderModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [tempPurchaseOrderData, setTempPurchaseOrderData] = useState(null);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [scopeIssue, setScopeIssue] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    products: false,
    orders: false,
    purchaseOrders: false,
    analytics: false
  });

  const shop = new URLSearchParams(window.location.search).get("shop");
  const host = new URLSearchParams(window.location.search).get("host");
  const fetchInProgress = useRef(false);

  const setLoadingState = (key, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  };

  // Enhanced fetch function with better error handling
  const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔍 Fetch attempt ${i + 1}: ${url}`);
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('❌ Non-JSON response:', text.substring(0, 200));
          throw new Error(`Server returned non-JSON response: ${response.status}`);
        }
        
        if (response.status === 429) {
          const waitTime = Math.pow(2, i) * 1000;
          console.log(`⏳ Rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        return data;
      } catch (error) {
        console.error(`❌ Fetch attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) {
          // If it's an HTML error, provide a more helpful message
          if (error.message.includes('Non-JSON response') || error.message.includes('Unexpected token')) {
            throw new Error('Server configuration error: API returned HTML instead of JSON. Please check your server setup.');
          }
          throw error;
        }
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  };

  // Enhanced purchase order fetching
  const fetchPurchaseOrders = async () => {
    try {
      console.log('📋 Fetching purchase orders...');
      setLoadingState('purchaseOrders', true);
      
      const data = await fetchWithRetry('/api/purchase-orders');
      
      // Ensure data is an array
      const ordersArray = Array.isArray(data) ? data : [];
      
      console.log(`✅ Fetched ${ordersArray.length} purchase orders`);
      setPurchaseOrders(ordersArray);
      
      return ordersArray;
    } catch (error) {
      console.error('❌ Failed to fetch purchase orders:', error);
      // Set empty array on error
      setPurchaseOrders([]);
      return [];
    } finally {
      setLoadingState('purchaseOrders', false);
    }
  };

  // Fetch orders by status for the status tabs
  const fetchOrdersByStatus = async (status) => {
    try {
      console.log(`📋 Fetching ${status} orders...`);
      const data = await fetchWithRetry(`/api/orders-by-status?status=${status}&shop=${shop}`);
      
      console.log(`✅ Fetched ${data.count} ${status} orders`);
      return data.orders || [];
    } catch (error) {
      console.error(`❌ Failed to fetch ${status} orders:`, error);
      return [];
    }
  };

  // Enhanced data fetching with better error handling
  const fetchData = useCallback(async () => {
    if (!shop) {
      setLoading(false);
      setFetchError("No shop parameter found");
      return;
    }

    if (fetchInProgress.current) {
      console.log('🔄 Fetch already in progress, skipping...');
      return;
    }

    fetchInProgress.current = true;
    setLoading(true);
    setFetchError(null);
    setScopeIssue(false);
    
    try {
      console.log('🔄 Starting data fetch for shop:', shop);
      
      // Test API health first
      console.log('🔗 Testing API health...');
      try {
        const healthCheck = await fetchWithRetry(`/api/health-check`);
        console.log('✅ API health check passed');
      } catch (healthError) {
        console.error('❌ API health check failed:', healthError);
        throw new Error(`API server is not responding properly: ${healthError.message}`);
      }

      // Test connection to Shopify
      console.log('🔗 Testing Shopify connection...');
      const connectionData = await fetchWithRetry(`/api/test-connection?shop=${shop}`);
      
      console.log('🔗 Connection test result:', connectionData);
      setConnectionInfo(connectionData);

      // Check for scope issues
      if (connectionData.orders.hasError && connectionData.orders.data?.includes('ACCESS_DENIED')) {
        setScopeIssue(true);
        throw new Error('Missing required permissions. Please reinstall the app.');
      }

      console.log('✅ Connection successful, fetching data...');

      // Load all data in parallel with error handling for each
      const promises = [
        fetchWithRetry(`/api/products?shop=${shop}`).catch(e => {
          console.error('❌ Products fetch failed:', e);
          return { data: { products: { edges: [] } } };
        }),
        fetchWithRetry(`/api/orders?shop=${shop}`).catch(e => {
          console.error('❌ Orders fetch failed:', e);
          return { data: { orders: { edges: [] } } };
        }),
        fetchWithRetry('/api/inventory').catch(e => {
          console.error('❌ Inventory fetch failed:', e);
          return {};
        }),
        fetchWithRetry('/api/order-status').catch(e => {
          console.error('❌ Order status fetch failed:', e);
          return {};
        }),
        fetchPurchaseOrders().catch(e => {
          console.error('❌ Purchase orders fetch failed:', e);
          return [];
        }),
        fetchWithRetry(`/api/analytics?shop=${shop}&period=30d`).catch(e => {
          console.error('❌ Analytics fetch failed:', e);
          return null;
        }),
        fetchWithRetry(`/api/alerts/low-stock?shop=${shop}`).catch(e => {
          console.error('❌ Alerts fetch failed:', e);
          return { alerts: [] };
        })
      ];

      const [productsRes, ordersRes, inventoryRes, statusRes, purchaseOrdersRes, analyticsRes, alertsRes] = await Promise.all(promises);

      console.log('📊 API Responses:', {
        products: productsRes.data?.products?.edges?.length || 0,
        orders: ordersRes.data?.orders?.edges?.length || 0,
        inventory: Object.keys(inventoryRes).length,
        orderStatus: Object.keys(statusRes).length,
        purchaseOrders: purchaseOrdersRes.length || 0,
        analytics: !!analyticsRes,
        alerts: alertsRes.alerts?.length || 0
      });

      // Process products
      const prodList = productsRes.data?.products?.edges?.map((edge) => {
        const v = edge.node.variants?.edges[0]?.node;
        return {
          id: edge.node.id,
          title: edge.node.title,
          handle: edge.node.handle,
          description: edge.node.description,
          featuredImage: edge.node.featuredImage?.url,
          sku: v?.sku || "",
          variantTitle: v?.title || "",
          price: v?.price || "0.00",
          tracksInventory: v?.inventoryItem?.tracked || false,
        };
      }) || [];

      // Process orders with better error handling - without customer data
      const orderList = ordersRes.data?.orders?.edges?.map((edge) => {
        const node = edge.node;
        return {
          id: node.id,
          name: node.name,
          email: node.email || "N/A",
          customer: "Customer", // Placeholder since we don't have customer scope
          total: node.totalPriceSet ? 
            `${node.totalPriceSet.shopMoney?.amount || 0} ${node.totalPriceSet.shopMoney?.currencyCode || ""}` 
            : "0.00 USD",
          lineItems: node.lineItems?.edges?.map((li) => li.node) || [],
          status: node.displayFulfillmentStatus || 'pending',
          financialStatus: node.displayFinancialStatus || 'pending',
          createdAt: node.createdAt,
        };
      }) || [];

      console.log(`✅ Data processed: ${prodList.length} products, ${orderList.length} orders, ${purchaseOrdersRes.length} purchase orders`);

      setProducts(prodList);
      setOrders(orderList);
      setInventoryData(inventoryRes);
      setOrderStatus(statusRes);
      setAnalytics(analyticsRes);
      setLowStockAlerts(alertsRes.alerts || []);

      // Log any issues
      if (orderList.length === 0) {
        console.warn('⚠️ No orders found. This could be normal if your store has no orders.');
      }
      if (prodList.length === 0) {
        console.warn('⚠️ No products found. This could be normal if your store has no products.');
      }

    } catch (error) {
      console.error('❌ Data fetch failed:', error);
      setFetchError(error.message);
    } finally {
      setLoading(false);
      setDataLoaded(true);
      fetchInProgress.current = false;
    }
  }, [shop]);

  // Optimized data fetching with debouncing
  const optimizedFetchData = useCallback(async () => {
    if (fetchInProgress.current) {
      console.log('🔄 Fetch already in progress, skipping...');
      return;
    }
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (host) {
      setIsEmbedded(true);
    }

    if (shop) {
      optimizedFetchData();
      
      // Set up periodic refresh
      const interval = setInterval(() => {
        optimizedFetchData();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [optimizedFetchData, host, shop]);

  // FIXED: Enhanced inventory save function with better validation
  const handleSave = async (sku) => {
    const val = inputValues[sku];
    
    // Validate input
    if (!val || val.trim() === '') {
      alert('Please enter a valid inventory value');
      return;
    }

    const inventoryValue = parseInt(val);
    
    // Prevent negative values
    if (inventoryValue < 0) {
      alert('Inventory value cannot be negative. Please enter 0 or higher.');
      return;
    }

    // Validate it's a number
    if (isNaN(inventoryValue)) {
      alert('Please enter a valid number for inventory');
      return;
    }

    try {
      console.log(`💾 Saving inventory for SKU: ${sku} = ${inventoryValue}`);
      
      const result = await fetchWithRetry("/api/inventory", {
        method: "POST",
        body: JSON.stringify({ 
          sku, 
          initialInventory: inventoryValue,
          reorderPoint: 5 
        }),
      });
      
      if (result.success) {
        console.log(`✅ Successfully saved inventory for ${sku}: ${inventoryValue}`);
        
        // Update local state immediately
        setInventoryData(prev => ({ 
          ...prev, 
          [sku]: {
            initialInventory: inventoryValue,
            reorderPoint: 5,
            lastUpdated: new Date().toISOString()
          }
        }));
        
        // Clear the input field
        setInputValues(prev => ({ 
          ...prev, 
          [sku]: '' 
        }));
        
        // Show success message
        console.log('Inventory saved successfully');
        
        // Refresh the data to ensure consistency
        setTimeout(() => {
          optimizedFetchData();
        }, 500);
        
      } else {
        throw new Error(result.error || 'Unknown error saving inventory');
      }
    } catch (error) {
      console.error('❌ Failed to save inventory:', error);
      alert(`Failed to save inventory: ${error.message}`);
    }
  };

  // FIXED: Enhanced input change handler with validation
  const handleInputChange = (sku, val) => {
    // Only allow numbers and empty string
    if (val === '' || /^\d+$/.test(val)) {
      setInputValues({ ...inputValues, [sku]: val });
    }
  };

  const handleReinstall = () => {
    if (shop) {
      window.location.href = `/reinstall?shop=${shop}`;
    }
  };

  // Function to handle out of stock status with purchase order creation
  const handleOutOfStockWithPO = (order, items) => {
    setSelectedItems(items);
    setTempPurchaseOrderData({
      orderId: order.id,
      orderName: order.name,
      shop: shop
    });
    setPurchaseOrderModalOpen(true);
  };

  // Function to create purchase order
  const createPurchaseOrder = async () => {
    try {
      const { orderId, shop } = tempPurchaseOrderData;
      
      const result = await fetchWithRetry('/api/purchase-orders/create', {
        method: 'POST',
        body: JSON.stringify({
          orderId: orderId,
          shop: shop,
          items: selectedItems
        }),
      });
      
      if (result.success) {
        console.log('✅ Purchase order created:', result.purchaseOrder);
        
        // Now update the order status to out_of_stock
        await handleStatusChange(orderId, 'out_of_stock', selectedItems);
        
        // Refresh purchase orders list
        fetchPurchaseOrders();
        setPurchaseOrderModalOpen(false);
        setSelectedItems([]);
        setTempPurchaseOrderData(null);
      } else {
        throw new Error(result.error || 'Failed to create purchase order');
      }
    } catch (error) {
      console.error('❌ Failed to create purchase order:', error);
      alert(`Failed to create purchase order: ${error.message}`);
    }
  };

  // Enhanced Status Change Handler
  const handleStatusChange = async (orderId, newStatus, purchaseOrderItems = null) => {
    try {
      console.log(`🔄 Changing order ${orderId} status to: ${newStatus}`);
      
      if (!shop) {
        throw new Error('No shop parameter available');
      }
      
      const requestBody = {
        orderId, 
        status: newStatus,
        shop: shop,
        notes: `Status changed via dashboard`
      };

      // Add purchase order items if provided
      if (purchaseOrderItems) {
        requestBody.purchaseOrderItems = purchaseOrderItems;
      }
      
      const result = await fetchWithRetry("/api/order-status", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (result && result.success) {
        setOrderStatus(prev => ({
          ...prev,
          [orderId]: result.data
        }));
        
        console.log(`✅ Status updated successfully for order ${orderId}`);
        
        if (result.purchaseOrderCreated) {
          alert(`Order status updated to ${newStatus}. Purchase order ${result.purchaseOrder.id} created successfully.`);
        } else {
          alert(`Order status updated to ${newStatus} successfully.`);
        }

        setTimeout(() => {
          optimizedFetchData();
        }, 1000);
      } else {
        throw new Error(result.error || 'Unknown error updating status');
      }
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      let userMessage = error.message;
      alert(`Failed to update status: ${userMessage}`);
    }
  };

  // Handle purchase order status changes
  const handlePurchaseOrderStatusChange = async (purchaseOrderId, newStatus) => {
    try {
      console.log(`🔄 Updating purchase order ${purchaseOrderId} status to: ${newStatus}`);
      
      const result = await fetchWithRetry(`/api/purchase-orders/${purchaseOrderId}/status`, {
        method: "POST",
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (result.success) {
        setPurchaseOrders(prev => 
          prev.map(po => 
            po.id === purchaseOrderId 
              ? { ...po, status: newStatus, updatedAt: new Date().toISOString() }
              : po
          )
        );
        console.log(`✅ Purchase order ${purchaseOrderId} status updated to: ${newStatus}`);
      } else {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('❌ Failed to update purchase order status:', error);
      alert(`Failed to update purchase order status: ${error.message}`);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setActiveModal('product-details');
  };

  const handlePurchaseOrderClick = (purchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setActiveModal('purchase-order-details');
  };

  // FIXED: CSV Export Function (instead of PDF)
  const handleExportData = () => {
    const exportData = {
      products,
      orders,
      inventory: inventoryData,
      orderStatus,
      purchaseOrders,
      analytics,
      lowStockAlerts,
      connectionInfo,
      exportedAt: new Date().toISOString()
    };

    try {
      // Generate CSV report
      const csvContent = generateCSVReport(exportData, shop);
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inventory-report-${shop}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ CSV report generated successfully');
    } catch (error) {
      console.error('❌ Failed to generate CSV:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  // Enhanced tab change handler to prevent unnecessary API calls
  const handleTabChange = (selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
    
    // Only refresh data for specific tabs that need fresh data
    if ([0, 4, 5, 10].includes(selectedTabIndex)) { // Dashboard, Confirmed Orders, Purchase Orders, Alerts
      optimizedFetchData();
    }
  };

  // Get orders by status for the status tabs
  const getOrdersByStatus = (status) => {
    return Object.entries(orderStatus)
      .filter(([orderId, statusData]) => statusData.status === status)
      .map(([orderId, statusData]) => {
        const order = orders.find(o => o.id === orderId);
        return {
          ...order,
          statusData
        };
      })
      .filter(order => order !== undefined); // Remove undefined orders
  };

  // FIXED: Enhanced data processing functions with better inventory display - REMOVED SHOP QTY
  const rowsProducts = products.map((p, index) => {
    const saved = inventoryData[p.sku]?.initialInventory ?? null;
    const isLowStock = saved !== null && saved <= (inventoryData[p.sku]?.reorderPoint || 5);
    const isMissing = saved === null || saved === undefined;

    let inventoryDisplay;
    
    if (isMissing) {
      inventoryDisplay = (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <TextField 
            value={inputValues[p.sku] || ""} 
            onChange={(val) => handleInputChange(p.sku, val)}
            placeholder="Set inventory"
            autoComplete="off"
            type="number"
            min="0"
            style={{
              width: '120px'
            }}
          />
          <ActionButton
            label="Save"
            onClick={() => handleSave(p.sku)}
            variant="success"
            size="small"
          />
        </div>
      );
    } else {
      inventoryDisplay = (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ 
            color: isLowStock ? '#d82c0d' : '#008060',
            fontWeight: isLowStock ? 600 : 500,
            minWidth: '40px',
            fontSize: '14px',
            background: isLowStock ? '#ffebee' : '#e8f5e8',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            {saved} units
          </span>
          {isLowStock && <AiOutlineAlert color="#d82c0d" size={16} />}
          
          {/* Allow editing even if inventory is set */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <TextField 
              value={inputValues[p.sku] || ""} 
              onChange={(val) => handleInputChange(p.sku, val)}
              placeholder="Update"
              autoComplete="off"
              type="number"
              min="0"
              size="slim"
              style={{ width: '80px' }}
            />
            <ActionButton
              label="Update"
              onClick={() => handleSave(p.sku)}
              size="small"
            />
          </div>
        </div>
      );
    }

    return [
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {p.featuredImage && (
          <img 
            src={p.featuredImage} 
            alt={p.title}
            style={{ 
              width: 48, 
              height: 48, 
              borderRadius: 8, 
              objectFit: 'cover',
              border: '2px solid #f0f0f0'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div>
          <div 
            style={{ 
              cursor: 'pointer', 
              color: '#202223',
              fontWeight: 500,
              fontSize: '14px',
              marginBottom: '2px'
            }}
            onClick={() => handleProductClick(p)}
          >
            {p.title}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#6d7175',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <AiOutlineEye size={12} />
            Click to view details
          </div>
        </div>
      </div>,
      <span style={{ color: '#5c6ac4', fontWeight: 500 }}>{p.variantTitle}</span>,
      <code style={{ 
        background: '#f6f6f7', 
        padding: '4px 8px', 
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        {p.sku || "No SKU"}
      </code>,
      <span style={{ 
        color: '#00a47c', 
        fontWeight: 600,
        fontSize: '14px'
      }}>
        ${p.price}
      </span>,
      inventoryDisplay,
    ];
  });

  // Purchase Orders Rows with colored rows based on status
  const purchaseOrderRows = purchaseOrders.map((po) => {
    const statusOption = PURCHASE_ORDER_STATUS_OPTIONS.find(s => s.value === po.status);
    
    // Define row colors based on status
    const getRowStyle = (status) => {
      switch(status) {
        case 'ordered':
          return { 
            backgroundColor: '#f0f7ff', 
            borderLeft: '4px solid #1976d2',
            margin: '4px 0',
            borderRadius: '0 8px 8px 0'
          };
        case 'received':
          return { 
            backgroundColor: '#f0f9f0', 
            borderLeft: '4px solid #2e7d32',
            margin: '4px 0',
            borderRadius: '0 8px 8px 0'
          };
        case 'cancelled':
          return { 
            backgroundColor: '#fff0f0', 
            borderLeft: '4px solid #c62828',
            margin: '4px 0',
            borderRadius: '0 8px 8px 0'
          };
        default:
          return {};
      }
    };

    return [
      <div style={getRowStyle(po.status)}>
        <div style={{ padding: '12px 8px' }}>
          <div 
            style={{ 
              cursor: 'pointer', 
              color: '#1976d2',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => handlePurchaseOrderClick(po)}
          >
            <AiOutlineFileText size={14} />
            {po.id}
          </div>
        </div>
      </div>,
      <span style={{ fontWeight: 500 }}>{po.originalOrderName || 'N/A'}</span>,
      <span style={{ 
        background: '#667eea',
        color: 'white',
        borderRadius: '12px',
        padding: '4px 8px',
        fontSize: '12px',
        fontWeight: 600,
        textAlign: 'center',
        minWidth: '24px'
      }}>
        {po.items?.length || 0}
      </span>,
      <div style={{ fontSize: '12px', color: '#6d7175', maxWidth: '200px' }}>
        {po.items ? po.items.slice(0, 2).map(item => 
          `${item.productName || 'Unknown'} (${item.quantity || 0})`
        ).join(', ') + (po.items.length > 2 ? '...' : '') : 'No items'}
      </div>,
      <span style={{ 
        fontSize: '12px',
        color: '#6d7175',
        fontWeight: 500
      }}>
        {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'Unknown'}
      </span>,
      <StatusBadge status={po.status || 'unknown'}>
        {po.status || 'unknown'}
      </StatusBadge>,
      <Select 
        options={PURCHASE_ORDER_STATUS_OPTIONS} 
        value={po.status || 'ordered'}
        onChange={(value) => handlePurchaseOrderStatusChange(po.id, value)}
      />
    ];
  });

  // Status tab rows
  const createStatusTabRows = (status) => {
    const statusOrders = getOrdersByStatus(status);
    
    return statusOrders.map(order => [
      <span style={{ fontWeight: 600, color: '#202223' }}>{order.name}</span>,
      <span style={{ color: '#5c6ac4' }}>{order.customer}</span>,
      <span style={{ fontWeight: 600, color: '#00a47c' }}>{order.total}</span>,
      <div style={{ fontSize: '12px', color: '#6d7175' }}>
        {order.lineItems.slice(0, 2).map(li => li.title).join(', ') + (order.lineItems.length > 2 ? '...' : '')}
      </div>,
      <StatusBadge status={order.financialStatus}>
        {order.financialStatus}
      </StatusBadge>,
      <span style={{ fontSize: '12px', color: '#6d7175' }}>
        {order.statusData.updatedAt ? new Date(order.statusData.updatedAt).toLocaleDateString() : 'Unknown'}
      </span>,
      <div style={{ 
        fontSize: '12px', 
        color: '#6d7175',
        maxWidth: '150px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {order.statusData.notes || 'No notes'}
      </div>
    ]);
  };

  // Enhanced Tabs with better styling
  const tabs = [
    { id: "dashboard", content: "Dashboard", icon: AiOutlineBarChart, color: "#667eea" },
    { id: "products", content: "Products", icon: AiOutlineShoppingCart, color: "#4facfe" },
    { id: "analytics", content: "Analytics", icon: AiOutlinePieChart, color: "#a18cd1" },
    { id: "orders", content: "Order Status", icon: AiOutlineCalendar, color: "#ff9a9e" },
    { id: "confirmed", content: "Confirmed Orders", icon: AiOutlineCheckCircle, color: "#00cdac" },
    { id: "purchase", content: "Purchase Orders", icon: AiOutlineFileText, color: "#667eea" },
    { id: "dispatched", content: "Dispatched", icon: AiOutlineTruck, color: "#4facfe" },
    { id: "delivered", content: "Delivered", icon: AiOutlineCheckCircle, color: "#00cdac" },
    { id: "returned", content: "Returned", icon: AiOutlineUndo, color: "#a18cd1" },
    { id: "damaged", content: "Damaged", icon: AiOutlineWarning, color: "#ff9a9e" },
    { id: "alerts", content: "Alerts", icon: AiOutlineBell, color: "#ff6b6b" },
  ];

  // Calculate metrics for dashboard
  const totalRevenue = analytics?.summary?.totalRevenue || 0;
  const totalOrders = orders.length;
  const averageOrderValue = analytics?.summary?.averageOrderValue || 0;
  const lowStockCount = lowStockAlerts.length;
  const orderedPurchaseOrders = purchaseOrders.filter(po => po.status === 'ordered').length;

  // Get counts for status tabs
  const confirmedCount = getOrdersByStatus('confirmed').length;
  const dispatchedCount = getOrdersByStatus('dispatched').length;
  const deliveredCount = getOrdersByStatus('delivered').length;
  const returnedCount = getOrdersByStatus('returned').length;
  const damagedCount = getOrdersByStatus('damaged').length;

  // Chart data preparation
  const revenueChartData = analytics?.charts?.revenueByStatus ? [
    { name: 'Paid', revenue: analytics.charts.revenueByStatus.paid, color: '#4caf50' },
    { name: 'Pending', revenue: analytics.charts.revenueByStatus.pending, color: '#ff9800' },
    { name: 'Refunded', revenue: analytics.charts.revenueByStatus.refunded, color: '#f44336' }
  ] : [];

  const inventoryChartData = analytics?.charts?.inventoryHealth ? [
    { name: 'Healthy', value: analytics.charts.inventoryHealth.healthy, color: '#4caf50' },
    { name: 'Low Stock', value: analytics.charts.inventoryHealth.lowStock, color: '#ff9800' },
    { name: 'Out of Stock', value: analytics.charts.inventoryHealth.outOfStock, color: '#f44336' }
  ] : [];

  const purchaseOrderChartData = analytics?.charts?.purchaseOrderStatus ? [
    { name: 'Ordered', count: analytics.charts.purchaseOrderStatus.ordered, color: '#2196f3' },
    { name: 'Received', count: analytics.charts.purchaseOrderStatus.received, color: '#4caf50' },
    { name: 'Cancelled', count: analytics.charts.purchaseOrderStatus.cancelled, color: '#f44336' }
  ] : [];

  if (!shop) {
    return (
      <AppProvider i18n={enTranslations}>
        <Page title="Shopify Inventory Manager">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <Card 
              style={{
                maxWidth: '500px',
                textAlign: 'center',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}
            >
              <EmptyState
                heading="Connect Your Shopify Store"
                action={{ content: 'Install App', url: `/auth?shop=your-store.myshopify.com` }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Please install the app from your Shopify admin to get started with advanced inventory management.</p>
              </EmptyState>
            </Card>
          </div>
        </Page>
      </AppProvider>
    );
  }

  if (loading && !dataLoaded) {
    return (
      <AppProvider i18n={enTranslations}>
        <Page fullWidth>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            gap: 20,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 1.5s ease-in-out infinite alternate'
            }}>
              <AiOutlineShoppingCart size={32} color="white" />
            </div>
            <div style={{ 
              color: '#202223', 
              fontSize: 18,
              fontWeight: 600,
              marginTop: 16
            }}>
              Loading your store data...
            </div>
            <div style={{ 
              color: '#6d7175', 
              fontSize: 14,
              textAlign: 'center'
            }}>
              <div>Shop: {shop}</div>
              <div style={{ marginTop: 4 }}>Preparing your dashboard...</div>
            </div>
          </div>
        </Page>
      </AppProvider>
    );
  }

  return (
    <AppProvider i18n={enTranslations}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.05); }
          }
          .data-table-row:hover {
            background: #f8f9fa !important;
            transform: translateY(-1px);
            transition: all 0.2s ease;
            boxShadow: 0 2px 8px rgba(0,0,0,0.05);
          }
        `}
      </style>
      
      <Page 
        fullWidth 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px'
            }}>
              <AiOutlineShoppingCart />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#202223' }}>
                Advanced Inventory Manager
              </div>
              <div style={{ fontSize: '14px', color: '#6d7175', marginTop: '2px' }}>
                {shop} • Real-time inventory tracking & analytics
              </div>
            </div>
          </div>
        }
        primaryAction={{
          content: 'Export CSV Report',
          icon: AiOutlineDownload,
          onAction: handleExportData,
        }}
        secondaryActions={[
          {
            content: 'Refresh Data',
            icon: AiOutlineReload,
            onAction: optimizedFetchData,
          },
        ]}
      >
        {/* Enhanced Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 700, 
                  margin: '0 0 8px 0',
                  background: 'linear-gradient(45deg, #fff, #e3f2fd)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}>
                  Welcome back!
                </h1>
                <p style={{ 
                  fontSize: '16px', 
                  opacity: 0.9,
                  margin: 0,
                  maxWidth: '500px'
                }}>
                  Manage your inventory, track orders, and analyze performance from one powerful dashboard.
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <ActionButton
                  icon={<AiOutlineBarChart />}
                  label="View Analytics"
                  onClick={() => handleTabChange(2)}
                  variant="secondary"
                />
                <ActionButton
                  icon={<AiOutlineBell />}
                  label="View Alerts"
                  onClick={() => handleTabChange(10)}
                  variant="secondary"
                />
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 1
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            zIndex: 1
          }}></div>
        </div>

        {/* Scope Issue Banner */}
        {scopeIssue && (
          <div style={{ marginBottom: 16 }}>
            <Banner 
              status="critical" 
              title="Permission Issue"
              style={{
                borderRadius: '12px',
                border: '2px solid #ffcdd2'
              }}
            >
              <p>
                The app is missing required permissions. Please reinstall to grant all necessary access.
              </p>
              <Button onClick={handleReinstall} primary>
                Reinstall App
              </Button>
            </Banner>
          </div>
        )}

        {/* Connection Info Banner */}
        {connectionInfo && (
          <div style={{ marginBottom: 16 }}>
            <Banner 
              status="info"
              style={{
                borderRadius: '12px',
                border: '2px solid #bbdefb'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#4caf50',
                  animation: 'pulse 2s infinite'
                }}></div>
                <p style={{ margin: 0 }}>
                  Connected to: <strong>{connectionInfo.shop?.name || shop}</strong> • 
                  Orders: <strong>{connectionInfo.orders.count}</strong> • 
                  Products: <strong>{products.length}</strong> •
                  Purchase Orders: <strong>{purchaseOrders.length}</strong>
                </p>
              </div>
            </Banner>
          </div>
        )}

        {/* Error Banner */}
        {fetchError && (
          <div style={{ marginBottom: 16 }}>
            <Banner 
              status="critical"
              style={{
                borderRadius: '12px',
                border: '2px solid #ffcdd2'
              }}
            >
              <p>Error loading data: {fetchError}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <ActionButton
                  label="Retry"
                  onClick={optimizedFetchData}
                  variant="primary"
                />
                {fetchError.includes('permissions') && (
                  <ActionButton
                    label="Reinstall App"
                    onClick={handleReinstall}
                    variant="success"
                  />
                )}
              </div>
            </Banner>
          </div>
        )}

        {/* Enhanced Alerts Section */}
        {lowStockAlerts.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Banner 
              status="critical"
              style={{
                borderRadius: '12px',
                border: '2px solid #ffcdd2',
                background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AiOutlineAlert size={20} color="#c53030" />
                <div>
                  <strong>Inventory Alert:</strong> You have {lowStockAlerts.length} products with low stock levels that need attention.
                </div>
              </div>
            </Banner>
          </div>
        )}

        {/* Purchase Orders Alert */}
        {orderedPurchaseOrders > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Banner 
              status="warning"
              style={{
                borderRadius: '12px',
                border: '2px solid #ffeaa7',
                background: 'linear-gradient(135deg, #fff9e6 0%, #ffeaa7 100%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AiOutlineFileText size={20} color="#e67e22" />
                <div>
                  <strong>Purchase Orders:</strong> You have {orderedPurchaseOrders} purchase orders that need attention.
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <ActionButton
                  label="View Purchase Orders"
                  onClick={() => handleTabChange(5)}
                  variant="primary"
                  size="small"
                />
              </div>
            </Banner>
          </div>
        )}

        {/* Enhanced Tabs */}
        <div style={{ marginBottom: 32 }}>
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none'
            }}
          >
            <Tabs 
              tabs={tabs.map((tab, index) => ({
                id: tab.id,
                content: (
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      padding: '8px 4px',
                      borderRadius: '8px',
                      background: selectedTab === index ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                      color: selectedTab === index ? 'white' : '#202223',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tab.icon && React.cloneElement(<tab.icon />, { 
                      size: 16,
                      color: selectedTab === index ? 'white' : tab.color
                    })}
                    {tab.content}
                    {tab.id === "confirmed" && confirmedCount > 0 && (
                      <span style={{
                        background: selectedTab === index ? 'rgba(255,255,255,0.2)' : '#e8f5e8',
                        color: selectedTab === index ? 'white' : '#2e7d32',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 600
                      }}>
                        {confirmedCount}
                      </span>
                    )}
                    {tab.id === "purchase" && orderedPurchaseOrders > 0 && (
                      <span style={{
                        background: selectedTab === index ? 'rgba(255,255,255,0.2)' : '#e3f2fd',
                        color: selectedTab === index ? 'white' : '#1976d2',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 600
                      }}>
                        {orderedPurchaseOrders}
                      </span>
                    )}
                    {tab.id === "alerts" && lowStockCount > 0 && (
                      <span style={{
                        background: selectedTab === index ? 'rgba(255,255,255,0.2)' : '#ffebee',
                        color: selectedTab === index ? 'white' : '#c62828',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 600
                      }}>
                        {lowStockCount}
                      </span>
                    )}
                  </div>
                ),
              }))} 
              selected={selectedTab} 
              onSelect={handleTabChange}
            />
          </Card>
        </div>

        {/* Tab Content */}
        <div style={{ padding: 4 }}>
          {/* Dashboard Tab with Graphical Representation */}
          {selectedTab === 0 && (
            <div>
              {/* Key Metrics */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
                gap: 20, 
                marginBottom: 32 
              }}>
                <StatCard
                  title="Total Revenue"
                  value={`$${totalRevenue.toLocaleString()}`}
                  change={12.5}
                  subtitle="Last 30 days"
                  icon={<AiOutlineDollarCircle />}
                  color="blue"
                  delay={0}
                />
                <StatCard
                  title="Total Orders"
                  value={totalOrders.toLocaleString()}
                  change={8.2}
                  subtitle="Processed orders"
                  icon={<AiOutlineShoppingCart />}
                  color="green"
                  delay={100}
                />
                <StatCard
                  title="Avg Order Value"
                  value={`$${averageOrderValue.toFixed(2)}`}
                  change={4.3}
                  subtitle="Average per order"
                  icon={<AiOutlineRise />}
                  color="purple"
                  delay={200}
                />
                <StatCard
                  title="Purchase Orders"
                  value={orderedPurchaseOrders.toString()}
                  change={15.7}
                  subtitle="Active POs"
                  icon={<AiOutlineFileText />}
                  color="orange"
                  delay={300}
                />
              </div>

              {/* Graphical Representation */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
                gap: 24, 
                marginBottom: 32 
              }}>
                {/* Revenue by Status Chart */}
                {revenueChartData.length > 0 && (
                  <ChartCard title="Revenue by Payment Status" height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6d7175"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#6d7175"
                          fontSize={12}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                          contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="revenue" 
                          name="Revenue" 
                          radius={[4, 4, 0, 0]}
                        >
                          {revenueChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                {/* Inventory Health Chart */}
                {inventoryChartData.length > 0 && (
                  <ChartCard title="Inventory Health" height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={inventoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {inventoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [value, 'Products']}
                          contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                {/* Purchase Order Status Chart */}
                {purchaseOrderChartData.length > 0 && (
                  <ChartCard title="Purchase Order Status" height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={purchaseOrderChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6d7175"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#6d7175"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="count" 
                          name="Count" 
                          radius={[4, 4, 0, 0]}
                        >
                          {purchaseOrderChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
              </div>

              {/* Recent Activity */}
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AiOutlineShoppingCart />
                    Recent Orders ({orders.length})
                  </div>
                }
                sectioned
                actions={[{ 
                  content: 'View All Orders', 
                  onAction: () => handleTabChange(3) 
                }]}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              >
                {orders.length === 0 ? (
                  <EmptyState
                    heading="No orders found"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>No orders have been placed yet, or there might be an issue fetching orders.</p>
                    <ActionButton
                      label="Retry Loading Orders"
                      onClick={optimizedFetchData}
                      variant="primary"
                    />
                  </EmptyState>
                ) : (
                  <DataTable
                    columnContentTypes={["text", "text", "text", "text"]}
                    headings={["Order", "Customer", "Total", "Status"]}
                    rows={orders.slice(0, 5).map(o => [
                      <span style={{ fontWeight: 600 }}>{o.name}</span>,
                      o.customer,
                      <span style={{ color: '#00a47c', fontWeight: 500 }}>{o.total}</span>,
                      <StatusBadge status={orderStatus[o.id]?.status || 'fresh'}>
                        {orderStatus[o.id]?.status || 'fresh'}
                      </StatusBadge>
                    ])}
                    showTotalsInFooter={false}
                  />
                )}
              </Card>
            </div>
          )}

          {/* Products Tab - REMOVED SHOP QTY COLUMN */}
          {selectedTab === 1 && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AiOutlineProduct />
                  Product Inventory ({products.length})
                </div>
              }
              sectioned
              actions={[
                { 
                  content: 'Export CSV', 
                  icon: AiOutlineDownload,
                  onAction: handleExportData
                },
                { 
                  content: 'Refresh', 
                  icon: AiOutlineReload, 
                  onAction: optimizedFetchData 
                }
              ]}
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {products.length === 0 ? (
                <EmptyState
                  heading="No products found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No products found in your store, or there might be an issue fetching products.</p>
                  <ActionButton
                    label="Retry Loading Products"
                    onClick={optimizedFetchData}
                    variant="primary"
                  />
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text"]}
                  headings={["Product", "Variant", "SKU", "Price", "Inventory"]}
                  rows={rowsProducts}
                  showTotalsInFooter={false}
                  increasedTableDensity
                />
              )}
            </Card>
          )}

          {/* Analytics Tab */}
          {selectedTab === 2 && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AiOutlineBarChart />
                  Business Analytics
                </div>
              }
              sectioned
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {analytics ? (
                <div>
                  <Layout>
                    <Layout.Section oneHalf>
                      <Card 
                        title="Revenue Summary" 
                        sectioned
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #f0f0f0'
                        }}
                      >
                        <div style={{ display: 'grid', gap: 16 }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                            borderRadius: '8px'
                          }}>
                            <span style={{ fontWeight: 500 }}>Total Revenue:</span>
                            <strong style={{ color: '#00a47c', fontSize: '18px' }}>
                              ${analytics.summary.totalRevenue.toLocaleString()}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Total Orders:</span>
                            <strong>{analytics.summary.totalOrders}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Average Order Value:</span>
                            <strong style={{ color: '#00a47c' }}>
                              ${analytics.summary.averageOrderValue}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Period:</span>
                            <strong>{analytics.summary.period}</strong>
                          </div>
                        </div>
                      </Card>
                    </Layout.Section>
                    <Layout.Section oneHalf>
                      <Card 
                        title="Inventory Health" 
                        sectioned
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #f0f0f0'
                        }}
                      >
                        <div style={{ display: 'grid', gap: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Total Products:</span>
                            <strong>{analytics.inventory.totalProducts}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Low Stock Items:</span>
                            <strong style={{ color: analytics.inventory.lowStockCount > 0 ? '#d82c0d' : '#008060' }}>
                              {analytics.inventory.lowStockCount}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Out of Stock:</span>
                            <strong style={{ color: analytics.inventory.outOfStockCount > 0 ? '#d82c0d' : '#008060' }}>
                              {analytics.inventory.outOfStockCount}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Healthy Stock:</span>
                            <strong style={{ color: '#008060' }}>
                              {analytics.inventory.healthyCount}
                            </strong>
                          </div>
                        </div>
                      </Card>
                    </Layout.Section>
                  </Layout>
                </div>
              ) : (
                <EmptyState
                  heading="No analytics data"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Analytics data is not available yet. This might be because there are no orders.</p>
                  <ActionButton
                    label="Refresh Data"
                    onClick={optimizedFetchData}
                    variant="primary"
                  />
                </EmptyState>
              )}
            </Card>
          )}

          {/* Order Status Tab */}
          {selectedTab === 3 && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AiOutlineCalendar />
                  Order Management ({orders.length})
                </div>
              }
              sectioned
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {orders.length === 0 ? (
                <EmptyState
                  heading="No orders found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No orders have been placed yet, or there might be an issue fetching orders.</p>
                  <ActionButton
                    label="Retry Loading Orders"
                    onClick={optimizedFetchData}
                    variant="primary"
                  />
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Order", "Customer", "Shipping Address", "Contact", "Total", "Items", "Inventory", "Update Status"]}
                  rows={orders.map(o => {
                    const currentStatus = orderStatus[o.id]?.status || 'fresh';
                    const statusOption = STATUS_OPTIONS.find(s => s.value === currentStatus);
                    
                    // Extract SKUs from line items to get inventory
                    const firstSku = o.lineItems[0]?.variant?.sku;
                    const inventory = firstSku ? (inventoryData[firstSku]?.initialInventory ?? 'N/A') : 'N/A';
                    
                    return [
                      <span style={{ fontWeight: 600 }}>{o.name}</span>,
                      o.customer,
                      <span style={{ color: '#6d7175', fontSize: '12px' }}>N/A</span>,
                      o.email || "N/A",
                      <span style={{ color: '#00a47c', fontWeight: 500 }}>{o.total}</span>,
                      <div style={{ fontSize: '12px', color: '#6d7175' }}>
                        {o.lineItems.slice(0, 2).map(li => li.title).join(', ') + (o.lineItems.length > 2 ? '...' : '')}
                      </div>,
                      <span style={{ 
                        background: inventory === 'N/A' ? '#f6f6f7' : '#e8f5e8',
                        color: inventory === 'N/A' ? '#6d7175' : '#008060',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {inventory}
                      </span>,
                      <Select 
                        options={STATUS_OPTIONS} 
                        value={currentStatus}
                        onChange={(value) => handleStatusChange(o.id, value)}
                      />
                    ];
                  })}
                  showTotalsInFooter={false}
                  increasedTableDensity
                />
              )}
            </Card>
          )}

          {/* Confirmed Orders Tab */}
          {selectedTab === 4 && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AiOutlineCheckCircle />
                  Confirmed Orders ({getOrdersByStatus('confirmed').length})
                </div>
              }
              sectioned
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {getOrdersByStatus('confirmed').length === 0 ? (
                <EmptyState
                  heading="No confirmed orders"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No orders have been confirmed yet. Confirm orders from the Order Status tab.</p>
                  <ActionButton
                    label="Go to Order Status"
                    onClick={() => handleTabChange(3)}
                    variant="primary"
                  />
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Order", "Customer", "Total", "Items", "Financial Status", "Confirmed At", "Update Status"]}
                  rows={getOrdersByStatus('confirmed').map(order => {
                    const currentStatus = order.statusData?.status || 'confirmed';
                    const statusOption = CONFIRMED_STATUS_OPTIONS.find(s => s.value === currentStatus);
                    
                    return [
                      <span style={{ fontWeight: 600 }}>{order.name}</span>,
                      order.customer,
                      <span style={{ color: '#00a47c', fontWeight: 500 }}>{order.total}</span>,
                      <div style={{ fontSize: '12px', color: '#6d7175' }}>
                        {order.lineItems.slice(0, 2).map(li => li.title).join(', ') + (order.lineItems.length > 2 ? '...' : '')}
                      </div>,
                      <StatusBadge status={order.financialStatus}>
                        {order.financialStatus}
                      </StatusBadge>,
                      <span style={{ fontSize: '12px', color: '#6d7175' }}>
                        {order.statusData.updatedAt ? new Date(order.statusData.updatedAt).toLocaleDateString() : 'Unknown'}
                      </span>,
                      <Select 
                        options={CONFIRMED_STATUS_OPTIONS} 
                        value={currentStatus}
                        onChange={(value) => {
                          if (value === 'out_of_stock') {
                            // Show modal to select items for purchase order
                            const lineItems = order.lineItems.map(li => ({
                              productName: li.title,
                              quantity: li.quantity,
                              sku: li.variant?.sku || 'N/A',
                              variantTitle: li.variant?.title || 'Default'
                            }));
                            handleOutOfStockWithPO(order, lineItems);
                          } else {
                            handleStatusChange(order.id, value);
                          }
                        }}
                      />
                    ];
                  })}
                  showTotalsInFooter={false}
                  increasedTableDensity
                />
              )}
            </Card>
          )}

          {/* Purchase Orders Tab */}
          {selectedTab === 5 && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AiOutlineFileText />
                  Purchase Orders ({purchaseOrders.length})
                </div>
              }
              sectioned
              actions={[
                {
                  content: 'Refresh',
                  icon: AiOutlineReload,
                  onAction: fetchPurchaseOrders
                }
              ]}
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {purchaseOrders.length === 0 ? (
                <EmptyState
                  heading="No purchase orders"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No purchase orders have been created yet. Purchase orders are created when you select "Out of Stock" for orders.</p>
                  <ActionButton
                    label="Refresh"
                    onClick={fetchPurchaseOrders}
                    variant="primary"
                  />
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "numeric", "text", "text", "text", "text"]}
                  headings={["PO Number", "Original Order", "Items", "Products", "Created", "Status", "Update Status"]}
                  rows={purchaseOrderRows}
                  showTotalsInFooter={false}
                  increasedTableDensity
                />
              )}
            </Card>
          )}

          {/* Dispatched Tab */}
          {selectedTab === 6 && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AiOutlineTruck />
                  Dispatched Orders ({dispatchedCount})
                </div>
              }
              sectioned
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {dispatchedCount === 0 ? (
                <EmptyState
                  heading="No dispatched orders"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No orders have been marked as dispatched yet.</p>
                  <ActionButton
                    label="Go to Order Management"
                    onClick={() => handleTabChange(3)}
                    variant="primary"
                  />
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Order", "Customer", "Total", "Items", "Financial Status", "Dispatched On", "Notes"]}
                  rows={createStatusTabRows('dispatched')}
                  showTotalsInFooter={false}
                  increasedTableDensity
                />
              )}
            </Card>
          )}

          {/* Delivered Tab */}
          {selectedTab === 7 && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AiOutlineCheckCircle />
                  Delivered Orders ({deliveredCount})
                </div>
              }
              sectioned
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {deliveredCount === 0 ? (
                <EmptyState
                  heading="No delivered orders"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No orders have been marked as delivered yet.</p>
                  <ActionButton
                    label="Go to Order Management"
                    onClick={() => handleTabChange(3)}
                    variant="primary"
                  />
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Order", "Customer", "Total", "Items", "Financial Status", "Delivered On", "Notes"]}
                  rows={createStatusTabRows('delivered')}
                  showTotalsInFooter={false}
                  increasedTableDensity
                />
              )}
            </Card>
          )}

          {/* Returned Tab */}
          {selectedTab === 8 && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AiOutlineUndo />
                  Returned Orders ({returnedCount})
                </div>
              }
              sectioned
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {returnedCount === 0 ? (
                <EmptyState
                  heading="No returned orders"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No orders have been marked as returned yet.</p>
                  <ActionButton
                    label="Go to Order Management"
                    onClick={() => handleTabChange(3)}
                    variant="primary"
                  />
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Order", "Customer", "Total", "Items", "Financial Status", "Returned On", "Notes"]}
                  rows={createStatusTabRows('returned')}
                  showTotalsInFooter={false}
                  increasedTableDensity
                />
              )}
            </Card>
          )}

          {/* Damaged Tab */}
          {selectedTab === 9 && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AiOutlineWarning />
                  Damaged Orders ({damagedCount})
                </div>
              }
              sectioned
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {damagedCount === 0 ? (
                <EmptyState
                  heading="No damaged orders"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No orders have been marked as damaged yet.</p>
                  <ActionButton
                    label="Go to Order Management"
                    onClick={() => handleTabChange(3)}
                    variant="primary"
                  />
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Order", "Customer", "Total", "Items", "Financial Status", "Reported On", "Notes"]}
                  rows={createStatusTabRows('damaged')}
                  showTotalsInFooter={false}
                  increasedTableDensity
                />
              )}
            </Card>
          )}

          {/* Alerts Tab */}
          {selectedTab === 10 && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AiOutlineBell />
                  Inventory Alerts ({lowStockCount})
                </div>
              }
              sectioned
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {lowStockCount === 0 ? (
                <EmptyState
                  heading="No alerts"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No low stock alerts at this time. All inventory levels are healthy.</p>
                  <ActionButton
                    label="Refresh"
                    onClick={optimizedFetchData}
                    variant="primary"
                  />
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "numeric", "numeric", "text"]}
                  headings={["SKU", "Product", "Current Inventory", "Reorder Point", "Alert Level"]}
                  rows={lowStockAlerts.map(alert => [
                    <code style={{ 
                      background: '#f6f6f7', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}>
                      {alert.sku}
                    </code>,
                    alert.productName || 'Unknown Product',
                    <span style={{ 
                      color: alert.initialInventory === 0 ? '#d82c0d' : '#ff9800',
                      fontWeight: 600 
                    }}>
                      {alert.initialInventory}
                    </span>,
                    alert.reorderPoint || 5,
                    <StatusBadge 
                      status={alert.alertLevel === 'out-of-stock' ? 'out_of_stock' : 'pending'}
                    >
                      {alert.alertLevel === 'out-of-stock' ? 'Out of Stock' : 'Low Stock'}
                    </StatusBadge>
                  ])}
                  showTotalsInFooter={false}
                  increasedTableDensity
                />
              )}
            </Card>
          )}
        </div>

        {/* Purchase Order Creation Modal */}
        <Modal
          open={purchaseOrderModalOpen}
          onClose={() => setPurchaseOrderModalOpen(false)}
          title="Create Purchase Order"
          primaryAction={{
            content: 'Create Purchase Order',
            onAction: createPurchaseOrder,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: () => setPurchaseOrderModalOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <TextContainer>
              <div style={{ 
                background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  Creating purchase order for order: <strong>{tempPurchaseOrderData?.orderName}</strong>
                </p>
              </div>
              
              <p>The following items will be added to the purchase order:</p>
              
              <Card 
                sectioned
                style={{
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0'
                }}
              >
                <DataTable
                  columnContentTypes={["text", "text", "numeric"]}
                  headings={["Product", "Variant", "Quantity"]}
                  rows={selectedItems.map(item => [
                    item.productName,
                    item.variantTitle,
                    <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                  ])}
                  showTotalsInFooter={false}
                />
              </Card>
              
              <div style={{ 
                marginTop: '16px', 
                padding: '16px', 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
                borderRadius: '8px',
                border: '1px solid #90caf9'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <AiOutlineInfoCircle size={16} color="#1976d2" />
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#0d47a1' }}>
                      <strong>Note:</strong> The purchase order will be created with status "Ordered". 
                      You can update the status later in the Purchase Orders tab.
                    </p>
                  </div>
                </div>
              </div>
            </TextContainer>
          </Modal.Section>
        </Modal>

        {/* Product Details Modal */}
        <Modal
          open={activeModal === 'product-details'}
          onClose={() => setActiveModal(null)}
          title="Product Details"
          large
        >
          <Modal.Section>
            {selectedProduct && (
              <div>
                <Layout>
                  <Layout.Section oneHalf>
                    {selectedProduct.featuredImage ? (
                      <img 
                        src={selectedProduct.featuredImage} 
                        alt={selectedProduct.title}
                        style={{ 
                          width: '100%', 
                          borderRadius: '12px', 
                          maxHeight: 300, 
                          objectFit: 'cover',
                          border: '2px solid #f0f0f0'
                        }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: 200, 
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        <AiOutlineProduct size={48} />
                      </div>
                    )}
                  </Layout.Section>
                  <Layout.Section oneHalf>
                    <TextContainer>
                      <h2 style={{ 
                        marginBottom: 16,
                        color: '#202223',
                        fontSize: '24px'
                      }}>
                        {selectedProduct.title}
                      </h2>
                      <p style={{ 
                        color: '#6d7175', 
                        marginBottom: 24,
                        lineHeight: 1.6
                      }}>
                        {selectedProduct.description || 'No description available.'}
                      </p>
                      <div style={{ 
                        display: 'grid', 
                        gap: 12,
                        background: '#f8f9fa',
                        padding: '16px',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>SKU:</strong> 
                          <code style={{ 
                            background: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {selectedProduct.sku || 'N/A'}
                          </code>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>Price:</strong> 
                          <span style={{ color: '#00a47c', fontWeight: 600 }}>
                            ${selectedProduct.price || '0.00'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>Variant:</strong> 
                          <span>{selectedProduct.variantTitle}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>Inventory Tracking:</strong> 
                          <StatusBadge status={selectedProduct.tracksInventory ? 'confirmed' : 'pending'}>
                            {selectedProduct.tracksInventory ? 'Enabled' : 'Disabled'}
                          </StatusBadge>
                        </div>
                        {inventoryData[selectedProduct.sku] && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <strong>Current Inventory:</strong> 
                              <span style={{ 
                                color: inventoryData[selectedProduct.sku].initialInventory <= 5 ? '#d82c0d' : '#008060',
                                fontWeight: 600
                              }}>
                                {inventoryData[selectedProduct.sku].initialInventory} units
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <strong>Reorder Point:</strong> 
                              <span>{inventoryData[selectedProduct.sku].reorderPoint || 'Not set'}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </TextContainer>
                  </Layout.Section>
                </Layout>
              </div>
            )}
          </Modal.Section>
        </Modal>

        {/* Purchase Order Details Modal */}
        <Modal
          open={activeModal === 'purchase-order-details'}
          onClose={() => setActiveModal(null)}
          title="Purchase Order Details"
          large
        >
          <Modal.Section>
            {selectedPurchaseOrder && (
              <div>
                <TextContainer>
                  <div style={{ 
                    display: 'grid', 
                    gap: 16, 
                    marginBottom: 24,
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>Purchase Order ID:</strong> 
                      <code style={{ 
                        background: 'white', 
                        padding: '6px 12px', 
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 600
                      }}>
                        {selectedPurchaseOrder.id}
                      </code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Original Order:</strong> 
                      <span>{selectedPurchaseOrder.originalOrderName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Created:</strong> 
                      <span>{new Date(selectedPurchaseOrder.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>Status:</strong> 
                      <StatusBadge status={selectedPurchaseOrder.status}>
                        {selectedPurchaseOrder.status}
                      </StatusBadge>
                    </div>
                    <div>
                      <strong>Notes:</strong> 
                      <p style={{ 
                        margin: '8px 0 0 0', 
                        padding: '12px',
                        background: 'white',
                        borderRadius: '6px',
                        border: '1px solid #f0f0f0'
                      }}>
                        {selectedPurchaseOrder.notes}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>Items:</h3>
                    {selectedPurchaseOrder.items && selectedPurchaseOrder.items.length > 0 ? (
                      <DataTable
                        columnContentTypes={["text", "text", "text", "numeric"]}
                        headings={["Product", "Variant", "SKU", "Quantity"]}
                        rows={selectedPurchaseOrder.items.map(item => [
                          item.productName,
                          item.variantTitle,
                          <code style={{ 
                            background: '#f6f6f7', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {item.sku}
                          </code>,
                          <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                        ])}
                        showTotalsInFooter={false}
                      />
                    ) : (
                      <EmptyState
                        heading="No items"
                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                      >
                        <p>No items in this purchase order.</p>
                      </EmptyState>
                    )}
                  </div>
                </TextContainer>
              </div>
            )}
          </Modal.Section>
        </Modal>
      </Page>
    </AppProvider>
  );
}