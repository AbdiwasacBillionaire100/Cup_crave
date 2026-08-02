import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { MENU_ITEMS, CATEGORIES } from './src/data/menuData';
import { Order, OrderStatus, User, UserActivityLog } from './src/types';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory databases
const ordersStore = new Map<string, Order>();

// User Authentication Database & Security
interface UserRecord extends User {
  passwordHash: string;
  salt: string;
}

const usersStore = new Map<string, UserRecord>();
const tokensStore = new Map<string, string>(); // token -> email
const activityLogsStore: UserActivityLog[] = [];

// Password Hashing Security Helpers
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function sanitizeUser(user: UserRecord): User {
  const { passwordHash, salt, ...sanitized } = user;
  return sanitized;
}

// Seed Initial Demo Users
(function seedUsers() {
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const adminUser: UserRecord = {
    id: 'user-admin-01',
    name: 'Crave Cups Admin',
    email: 'admin@cravecups.com',
    phone: '(555) 987-6543',
    favoriteDrink: 'Single Origin Espresso Shot',
    role: 'admin',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    lastLoginAt: new Date().toISOString(),
    loginCount: 12,
    salt: adminSalt,
    passwordHash: hashPassword('admin123', adminSalt),
  };
  usersStore.set(adminUser.email.toLowerCase(), adminUser);
  activityLogsStore.push({
    id: 'log-seed-1',
    userId: adminUser.id,
    userName: adminUser.name,
    userEmail: adminUser.email,
    action: 'registered',
    timestamp: adminUser.createdAt,
  });

  const demoSalt = crypto.randomBytes(16).toString('hex');
  const demoUser: UserRecord = {
    id: 'user-customer-01',
    name: 'Sarah Connor',
    email: 'sarah.crave@example.com',
    phone: '(555) 234-5678',
    favoriteDrink: 'Crave Signature Honey Latte',
    role: 'customer',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastLoginAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    loginCount: 4,
    salt: demoSalt,
    passwordHash: hashPassword('coffee123', demoSalt),
  };
  usersStore.set(demoUser.email.toLowerCase(), demoUser);
  activityLogsStore.push({
    id: 'log-seed-2',
    userId: demoUser.id,
    userName: demoUser.name,
    userEmail: demoUser.email,
    action: 'registered',
    timestamp: demoUser.createdAt,
  });
  activityLogsStore.push({
    id: 'log-seed-3',
    userId: demoUser.id,
    userName: demoUser.name,
    userEmail: demoUser.email,
    action: 'logged_in',
    timestamp: demoUser.lastLoginAt,
  });
})();

// AUTHENTICATION API ROUTES

// User Registration Endpoint
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, favoriteDrink } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Full name must be at least 2 characters long' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (usersStore.has(normalizedEmail)) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const userId = 'usr-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();

    const newUser: UserRecord = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : undefined,
      favoriteDrink: favoriteDrink ? favoriteDrink.trim() : undefined,
      role: normalizedEmail.includes('admin') ? 'admin' : 'customer',
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1,
      salt,
      passwordHash,
    };

    usersStore.set(normalizedEmail, newUser);

    const token = generateToken();
    tokensStore.set(token, normalizedEmail);

    // Record activity log
    activityLogsStore.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      action: 'registered',
      timestamp: now,
    });
    activityLogsStore.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      action: 'logged_in',
      timestamp: now,
    });

    res.json({
      success: true,
      user: sanitizeUser(newUser),
      token,
      message: 'Registration successful! Welcome to CraveCups.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Registration failed' });
  }
});

// User Login Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = usersStore.get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const inputHash = hashPassword(password, user.salt);
    if (inputHash !== user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const now = new Date().toISOString();
    user.lastLoginAt = now;
    user.loginCount += 1;
    usersStore.set(normalizedEmail, user);

    const token = generateToken();
    tokensStore.set(token, normalizedEmail);

    activityLogsStore.unshift({
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: 'logged_in',
      timestamp: now,
    });

    res.json({
      success: true,
      user: sanitizeUser(user),
      token,
      message: `Welcome back, ${user.name}!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Login failed' });
  }
});

// Get Current User Profile (Validate Session Token)
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized session' });
  }

  const token = authHeader.split(' ')[1];
  const email = tokensStore.get(token);
  if (!email) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
  }

  const user = usersStore.get(email);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.json({ success: true, user: sanitizeUser(user) });
});

// Logout Endpoint
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const email = tokensStore.get(token);
    if (email) {
      const user = usersStore.get(email);
      if (user) {
        activityLogsStore.unshift({
          id: 'log-' + Math.random().toString(36).substr(2, 9),
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          action: 'logged_out',
          timestamp: new Date().toISOString(),
        });
      }
      tokensStore.delete(token);
    }
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Admin API: View All Registered Users & Live Login Activity Logs
app.get('/api/admin/users', (_req: Request, res: Response) => {
  const registeredUsers = Array.from(usersStore.values()).map(sanitizeUser);
  res.json({
    success: true,
    totalUsers: registeredUsers.length,
    users: registeredUsers,
    activityLogs: activityLogsStore,
  });
});

// Generate driver names & baristas
const BARISTAS = ['Marco (Master Barista)', 'Elena (Latte Specialist)', 'Devon (Cold Brew Artisan)'];
const DRIVERS = ['Alex (Courier #104)', 'Jordan (Courier #218)', 'Siddharth (Express Rider)'];

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Categories API
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json({ success: true, data: CATEGORIES });
});

// Menu Items API (with search & filter)
app.get('/api/menu', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let items = [...MENU_ITEMS];

  if (category && category !== 'all') {
    items = items.filter(item => item.category === category);
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const query = search.toLowerCase().trim();
    items = items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }

  res.json({ success: true, count: items.length, data: items });
});

// Single Menu Item Detail API
app.get('/api/menu/:id', (req: Request, res: Response) => {
  const item = MENU_ITEMS.find(m => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Menu item not found' });
  }
  res.json({ success: true, data: item });
});

// Create Order API
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { items, orderType, customerInfo, subtotal, tax, deliveryFee, tip, discount, promoCode, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty or invalid' });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return res.status(400).json({ success: false, error: 'Customer name and phone number are required' });
    }

    if (orderType === 'delivery' && !customerInfo.address) {
      return res.status(400).json({ success: false, error: 'Delivery address is required for delivery orders' });
    }

    const orderId = 'CC-' + Math.floor(100000 + Math.random() * 900000);
    const barista = BARISTAS[Math.floor(Math.random() * BARISTAS.length)];
    const driver = orderType === 'delivery' ? DRIVERS[Math.floor(Math.random() * DRIVERS.length)] : undefined;

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      orderType: orderType === 'pickup' ? 'pickup' : 'delivery',
      items,
      subtotal: Number(subtotal) || 0,
      tax: Number(tax) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      tip: Number(tip) || 0,
      discount: Number(discount) || 0,
      promoCode,
      total: Number(total) || 0,
      status: 'received',
      customerInfo,
      estimatedTimeMinutes: orderType === 'delivery' ? 25 : 12,
      baristaName: barista,
      driverName: driver,
      driverPhone: orderType === 'delivery' ? '+1 (555) 019-2834' : undefined,
      deliveryLocation: {
        lat: 37.7749,
        lng: -122.4194
      }
    };

    ordersStore.set(orderId, newOrder);

    // Schedule status updates for live simulation
    setTimeout(() => {
      const order = ordersStore.get(orderId);
      if (order) {
        order.status = 'crafting';
        ordersStore.set(orderId, order);
      }
    }, 12000); // 12 sec -> crafting

    setTimeout(() => {
      const order = ordersStore.get(orderId);
      if (order) {
        order.status = order.orderType === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup';
        ordersStore.set(orderId, order);
      }
    }, 30000); // 30 sec -> out for delivery / ready

    setTimeout(() => {
      const order = ordersStore.get(orderId);
      if (order) {
        order.status = 'delivered';
        ordersStore.set(orderId, order);
      }
    }, 60000); // 60 sec -> delivered

    res.status(201).json({ success: true, data: newOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to place order' });
  }
});

// Get Order Details / Real-time Status
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = ordersStore.get(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

// Update Order Status (Admin / Barista Simulator POST route)
app.post('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const order = ordersStore.get(id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const validStatuses: OrderStatus[] = ['received', 'crafting', 'out_for_delivery', 'ready_for_pickup', 'delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid order status' });
  }

  order.status = status;
  if (status === 'delivered') {
    order.estimatedTimeMinutes = 0;
  } else if (status === 'out_for_delivery' || status === 'ready_for_pickup') {
    order.estimatedTimeMinutes = 5;
  } else if (status === 'crafting') {
    order.estimatedTimeMinutes = 10;
  }

  ordersStore.set(id, order);
  res.json({ success: true, data: order });
});

// AI Barista Recommendation Proxy API
app.post('/api/ai-barista', async (req: Request, res: Response) => {
  const { mood, preference, timeOfDay, dietary } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Fallback recommendation logic when key is unconfigured
    const populars = MENU_ITEMS.filter(m => m.isPopular);
    const matched = populars[Math.floor(Math.random() * populars.length)] || MENU_ITEMS[0];
    return res.json({
      success: true,
      recommendation: {
        item: matched,
        headline: `The Barista's Choice for ${mood || 'Your Day'}`,
        reasoning: `Based on your request for ${preference || 'something delicious'}, our head barista recommends our iconic ${matched.name}. It delivers the perfect balance of artisan flavor and energy!`
      }
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert master barista at CraveCups specialty cafe.
Customer request details:
- Mood/Vibe: ${mood || 'Energetic & Cozy'}
- Flavor/Drink preference: ${preference || 'Smooth and balanced'}
- Time of Day: ${timeOfDay || 'Morning'}
- Dietary requirements: ${dietary || 'None'}

Here is our available menu:
${JSON.stringify(MENU_ITEMS.map(m => ({ id: m.id, name: m.name, desc: m.description, category: m.category, price: m.price })))}

Pick EXACTLY ONE menu item ID that best matches their vibe and craft a warm, appetizing 2-sentence recommendation explaination.
Respond strictly in JSON format like this:
{
  "recommendedItemId": "crave-signature-latte",
  "headline": "Morning Golden Warmth",
  "reasoning": "Our Crave Signature Roasted Honey Latte will lift your morning with organic wildflower honey and silky oat foam."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const matchedItem = MENU_ITEMS.find(m => m.id === parsed.recommendedItemId) || MENU_ITEMS[0];

    res.json({
      success: true,
      recommendation: {
        item: matchedItem,
        headline: parsed.headline || `Tailored Crave Selection`,
        reasoning: parsed.reasoning || `Handpicked for your current mood!`
      }
    });
  } catch (err: any) {
    const fallback = MENU_ITEMS[0];
    res.json({
      success: true,
      recommendation: {
        item: fallback,
        headline: "Crave Classic Pick",
        reasoning: "Our signature roasted coffee blend crafted to perfection for any time of day!"
      }
    });
  }
});

// Vite middleware & Production static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`☕ CraveCups Full-Stack Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
