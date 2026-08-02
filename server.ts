import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MENU_ITEMS, CATEGORIES } from './src/data/menuData';
import { Order, OrderStatus } from './src/types';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory order database
const ordersStore = new Map<string, Order>();

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
      return res.status(400).json({ success: false, error: 'Customer name and phone are required' });
    }

    const orderId = 'CC-' + Math.floor(100000 + Math.random() * 900000);
    const barista = BARISTAS[Math.floor(Math.random() * BARISTAS.length)];
    const driver = orderType === 'delivery' ? DRIVERS[Math.floor(Math.random() * DRIVERS.length)] : undefined;

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      orderType: orderType || 'delivery',
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
