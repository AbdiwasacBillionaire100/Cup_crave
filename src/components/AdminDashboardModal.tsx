import React, { useState, useEffect } from 'react';
import { MenuItem, InventoryItem, SalesAnalytics, CategoryId } from '../types';
import {
  X,
  LayoutDashboard,
  UtensilsCrossed,
  Boxes,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  DollarSign,
  ShoppingBag,
  Truck,
  Store,
  Award,
  ArrowUpRight,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMenuUpdated?: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onMenuUpdated,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'menu' | 'inventory' | 'analytics'>('menu');

  // Menu Manager States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('all');
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  // Menu Form Data State
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: 'coffee' as CategoryId,
    price: '',
    description: '',
    image: '',
    calories: '220',
  });

  // Inventory Tracker States
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    category: 'Coffee',
    quantity: '',
    unit: 'kg',
    minThreshold: '5',
  });

  // Analytics States
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);

  // Common UI States
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch Data Functions
  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/admin/menu');
      const data = await res.json();
      if (data.success) {
        setMenuItems(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin menu:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/admin/inventory');
      const data = await res.json();
      if (data.success) {
        setInventoryItems(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const refreshAll = async () => {
    setIsLoading(true);
    await Promise.all([fetchMenu(), fetchInventory(), fetchAnalytics()]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      refreshAll();
    }
  }, [isOpen]);

  // MENU MANAGER ACTIONS
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/admin/menu/${item.id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        showNotification(`${item.name} is now ${data.data.available ? 'Available' : 'Out of Stock'}`);
        fetchMenu();
        if (onMenuUpdated) onMenuUpdated();
      }
    } catch (err) {
      showNotification('Failed to toggle availability', 'error');
    }
  };

  const handleDeleteMenuItem = async (item: MenuItem) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) return;
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification(`Deleted "${item.name}"`);
        fetchMenu();
        if (onMenuUpdated) onMenuUpdated();
      }
    } catch (err) {
      showNotification('Failed to delete menu item', 'error');
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.price) {
      showNotification('Item name and price are required', 'error');
      return;
    }

    try {
      if (editingMenuItem) {
        // Edit existing
        const res = await fetch(`/api/admin/menu/${editingMenuItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: menuForm.name,
            category: menuForm.category,
            price: Number(menuForm.price),
            description: menuForm.description,
            image: menuForm.image,
            calories: Number(menuForm.calories),
          }),
        });
        const data = await res.json();
        if (data.success) {
          showNotification(`Updated "${menuForm.name}" successfully`);
          setEditingMenuItem(null);
          setIsAddingMenuItem(false);
          fetchMenu();
          if (onMenuUpdated) onMenuUpdated();
        }
      } else {
        // Create new
        const res = await fetch('/api/admin/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: menuForm.name,
            category: menuForm.category,
            price: Number(menuForm.price),
            description: menuForm.description,
            image: menuForm.image,
            calories: Number(menuForm.calories),
          }),
        });
        const data = await res.json();
        if (data.success) {
          showNotification(`Added "${menuForm.name}" to menu`);
          setIsAddingMenuItem(false);
          fetchMenu();
          if (onMenuUpdated) onMenuUpdated();
        }
      }
    } catch (err) {
      showNotification('Operation failed', 'error');
    }
  };

  const startEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
      image: item.image,
      calories: (item.calories || 220).toString(),
    });
    setIsAddingMenuItem(true);
  };

  // INVENTORY ACTIONS
  const handleRestock = async (id: string, delta: number) => {
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Restocked ${data.data.name} (+${delta} ${data.data.unit})`);
        fetchInventory();
      }
    } catch (err) {
      showNotification('Failed to restock', 'error');
    }
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientForm.name || !ingredientForm.quantity) {
      showNotification('Ingredient name and quantity are required', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ingredientForm.name,
          category: ingredientForm.category,
          quantity: Number(ingredientForm.quantity),
          unit: ingredientForm.unit,
          minThreshold: Number(ingredientForm.minThreshold),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Added ingredient "${ingredientForm.name}"`);
        setIsAddingIngredient(false);
        setIngredientForm({ name: '', category: 'Coffee', quantity: '', unit: 'kg', minThreshold: '5' });
        fetchInventory();
      }
    } catch (err) {
      showNotification('Failed to add ingredient', 'error');
    }
  };

  // Filtered lists
  const filteredMenuItems = menuItems.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      m.description.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCategory = menuCategoryFilter === 'all' || m.category === menuCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredInventory = inventoryItems.filter(
    (i) =>
      i.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      i.category.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const lowStockCount = inventoryItems.filter((i) => i.quantity <= i.minThreshold).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-6xl bg-[#1F1A17] border border-[#3A312B] rounded-3xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Notification Alert Banner */}
        {notification && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
              notification.type === 'success'
                ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
                : 'bg-rose-950 border-rose-700 text-rose-200'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Dashboard Top Header */}
        <div className="p-4 sm:p-5 bg-[#15110F] border-b border-[#3A312B] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E65F2B] to-[#D4A373] p-0.5 shadow-md shadow-[#E65F2B]/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#1F1A17] rounded-[14px] flex items-center justify-center text-[#E65F2B]">
                <LayoutDashboard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#E65F2B] uppercase tracking-wider">Full-Stack Admin Control</span>
                <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Server
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white">CraveCups Store Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshAll}
              className="p-2 text-stone-400 hover:text-white rounded-2xl bg-[#2D2521] border border-[#3A312B] transition-all flex items-center gap-1 text-xs font-bold"
              title="Refresh All Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-full bg-[#2D2521] border border-[#3A312B] transition-colors"
              aria-label="Close Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Tab Navigation Header */}
        <div className="p-3 bg-[#15110F] border-b border-[#3A312B] overflow-x-auto">
          <div className="bg-[#2D2521] p-1.5 rounded-2xl border border-[#3A312B] flex gap-1 min-w-max">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-[#E65F2B] text-white shadow-lg shadow-[#E65F2B]/30 border border-[#E65F2B]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Menu Manager ({menuItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer relative ${
                activeTab === 'inventory'
                  ? 'bg-[#E65F2B] text-white shadow-lg shadow-[#E65F2B]/30 border border-[#E65F2B]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Inventory Tracker ({inventoryItems.length})</span>
              {lowStockCount > 0 && (
                <span className="bg-amber-500 text-stone-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {lowStockCount} Low
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#E65F2B] text-white shadow-lg shadow-[#E65F2B]/30 border border-[#E65F2B]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Sales Analytics</span>
            </button>
          </div>
        </div>

        {/* TAB 1: MENU MANAGER */}
        {activeTab === 'menu' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Menu Controls Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#2D2521] p-3 rounded-2xl border border-[#3A312B]">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Search menu items..."
                    className="w-full bg-[#1F1A17] border border-[#3A312B] focus:border-[#E65F2B] text-white text-xs p-2 pl-9 rounded-xl outline-none"
                  />
                </div>

                <select
                  value={menuCategoryFilter}
                  onChange={(e) => setMenuCategoryFilter(e.target.value)}
                  className="bg-[#1F1A17] border border-[#3A312B] text-stone-300 text-xs p-2 rounded-xl outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="coffee">Coffee & Espresso</option>
                  <option value="coldbrew">Cold Brew & Teas</option>
                  <option value="tea">Matcha & Teas</option>
                  <option value="bakery">Bakery & Pastries</option>
                  <option value="breakfast">Breakfast Specials</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setEditingMenuItem(null);
                  setMenuForm({
                    name: '',
                    category: 'coffee',
                    price: '5.50',
                    description: '',
                    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
                    calories: '200',
                  });
                  setIsAddingMenuItem(true);
                }}
                className="bg-gradient-to-r from-[#E65F2B] to-[#D14F1D] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Menu Item</span>
              </button>
            </div>

            {/* Menu Item Add / Edit Modal Form */}
            {isAddingMenuItem && (
              <div className="bg-[#251F1B] border-2 border-[#E65F2B]/60 p-4 sm:p-5 rounded-2xl shadow-2xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#3A312B] pb-2">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-[#E65F2B]" />
                    <span>{editingMenuItem ? `Edit "${editingMenuItem.name}"` : 'Create New Menu Item'}</span>
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddingMenuItem(false);
                      setEditingMenuItem(null);
                    }}
                    className="text-stone-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveMenuItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Item Title *</label>
                    <input
                      type="text"
                      required
                      value={menuForm.name}
                      onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                      placeholder="e.g. Vanilla Bean Oat Latte"
                      className="w-full bg-[#1F1A17] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Category *</label>
                    <select
                      value={menuForm.category}
                      onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value as CategoryId })}
                      className="w-full bg-[#1F1A17] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2 rounded-xl outline-none"
                    >
                      <option value="coffee">Espresso & Coffee</option>
                      <option value="coldbrew">Cold Brew & Teas</option>
                      <option value="tea">Matcha & Teas</option>
                      <option value="bakery">Bakery & Pastries</option>
                      <option value="breakfast">Breakfast Specials</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Price ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                      placeholder="e.g. 6.25"
                      className="w-full bg-[#1F1A17] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      value={menuForm.calories}
                      onChange={(e) => setMenuForm({ ...menuForm, calories: e.target.value })}
                      placeholder="e.g. 210"
                      className="w-full bg-[#1F1A17] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2 rounded-xl outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-stone-300 font-semibold block mb-1">Image URL</label>
                    <input
                      type="url"
                      value={menuForm.image}
                      onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[#1F1A17] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2 rounded-xl outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-stone-300 font-semibold block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={menuForm.description}
                      onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                      placeholder="Describe the flavors, roast, ingredients..."
                      className="w-full bg-[#1F1A17] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2 rounded-xl outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingMenuItem(false);
                        setEditingMenuItem(null);
                      }}
                      className="px-4 py-2 bg-[#2D2521] text-stone-300 font-bold rounded-xl border border-[#3A312B]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#E65F2B] hover:bg-[#d45220] text-white font-extrabold rounded-xl shadow border border-[#E65F2B]"
                    >
                      {editingMenuItem ? 'Update Item' : 'Save & Publish'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Menu Items Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-[#2D2521] border p-3.5 rounded-2xl flex flex-col justify-between space-y-3 transition-all ${
                    item.available !== false ? 'border-[#3A312B]' : 'border-rose-900/60 bg-[#231A17] opacity-80'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-[#3A312B] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-white text-sm truncate">{item.name}</h4>
                        <span className="font-mono font-bold text-[#E65F2B] text-sm shrink-0">${item.price.toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] bg-[#1F1A17] text-[#D4A373] px-2 py-0.5 rounded-md border border-[#3A312B] uppercase tracking-wider inline-block mt-0.5">
                        {item.category}
                      </span>
                      <p className="text-[11px] text-stone-400 line-clamp-2 mt-1">{item.description}</p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-[#3A312B]/80 flex items-center justify-between text-xs">
                    {/* Toggle Availability Switch Button */}
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        item.available !== false
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {item.available !== false ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                      <span>{item.available !== false ? 'Available' : 'Out of Stock'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditMenuItem(item)}
                        className="p-1.5 bg-[#1F1A17] text-stone-300 hover:text-white rounded-lg border border-[#3A312B]"
                        title="Edit Item & Price"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item)}
                        className="p-1.5 bg-[#1F1A17] text-stone-300 hover:text-rose-400 rounded-lg border border-[#3A312B]"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY TRACKER */}
        {activeTab === 'inventory' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Inventory Controls Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#2D2521] p-3 rounded-2xl border border-[#3A312B]">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Filter stock ingredients..."
                  className="w-full bg-[#1F1A17] border border-[#3A312B] focus:border-[#E65F2B] text-white text-xs p-2 pl-9 rounded-xl outline-none"
                />
              </div>

              <button
                onClick={() => setIsAddingIngredient(true)}
                className="bg-gradient-to-r from-[#E65F2B] to-[#D14F1D] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 hover:scale-105 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Ingredient Stock Line</span>
              </button>
            </div>

            {/* Low-stock Summary Banner */}
            {lowStockCount > 0 && (
              <div className="p-3.5 bg-amber-950/60 border border-amber-800 text-amber-200 text-xs rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-extrabold text-amber-100 block">Low Stock Warnings Detected</span>
                    <span className="text-[11px] text-amber-300">
                      {lowStockCount} ingredient{lowStockCount > 1 ? 's are' : ' is'} below minimum threshold level.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Add Ingredient Form */}
            {isAddingIngredient && (
              <div className="bg-[#251F1B] border-2 border-[#E65F2B]/60 p-4 sm:p-5 rounded-2xl shadow-2xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#3A312B] pb-2">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-[#E65F2B]" />
                    <span>Add New Ingredient to Inventory</span>
                  </h3>
                  <button onClick={() => setIsAddingIngredient(false)} className="text-stone-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddIngredient} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Ingredient Name *</label>
                    <input
                      type="text"
                      required
                      value={ingredientForm.name}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                      placeholder="e.g. Organic Almond Milk"
                      className="w-full bg-[#1F1A17] border border-[#3A312B] text-white p-2 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Category</label>
                    <input
                      type="text"
                      value={ingredientForm.category}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, category: e.target.value })}
                      placeholder="e.g. Dairy & Plant"
                      className="w-full bg-[#1F1A17] border border-[#3A312B] text-white p-2 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Current Stock Quantity *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={ingredientForm.quantity}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, quantity: e.target.value })}
                      placeholder="e.g. 15.0"
                      className="w-full bg-[#1F1A17] border border-[#3A312B] text-white p-2 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Unit of Measure *</label>
                    <select
                      value={ingredientForm.unit}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                      className="w-full bg-[#1F1A17] border border-[#3A312B] text-white p-2 rounded-xl outline-none"
                    >
                      <option value="kg">kilograms (kg)</option>
                      <option value="Liters">Liters (L)</option>
                      <option value="Bottles">Bottles</option>
                      <option value="Boxes">Boxes</option>
                      <option value="Bags">Bags</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Min Low Threshold Warning</label>
                    <input
                      type="number"
                      value={ingredientForm.minThreshold}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, minThreshold: e.target.value })}
                      placeholder="e.g. 5"
                      className="w-full bg-[#1F1A17] border border-[#3A312B] text-white p-2 rounded-xl outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingIngredient(false)}
                      className="px-4 py-2 bg-[#2D2521] text-stone-300 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#E65F2B] text-white font-extrabold rounded-xl shadow"
                    >
                      Add Ingredient
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Inventory Responsive Table */}
            <div className="bg-[#2D2521] border border-[#3A312B] rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#15110F] border-b border-[#3A312B] text-stone-400 font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Ingredient</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Stock Level</th>
                      <th className="p-3.5">Min Threshold</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A312B]/60">
                    {filteredInventory.map((item) => {
                      const isLow = item.quantity <= item.minThreshold;
                      return (
                        <tr key={item.id} className="hover:bg-[#352C27] transition-colors">
                          <td className="p-3.5 font-bold text-white flex items-center gap-2">
                            <span>{item.name}</span>
                          </td>
                          <td className="p-3.5 text-stone-400 font-medium">{item.category}</td>
                          <td className="p-3.5 font-mono font-bold text-sm text-white">
                            {item.quantity} <span className="text-xs text-stone-400 font-normal">{item.unit}</span>
                          </td>
                          <td className="p-3.5 font-mono text-stone-400">
                            {item.minThreshold} {item.unit}
                          </td>
                          <td className="p-3.5">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                LOW STOCK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Optimal
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <button
                              onClick={() => handleRestock(item.id, 5)}
                              className="px-2.5 py-1 bg-[#1F1A17] hover:bg-[#E65F2B] hover:text-white text-stone-200 font-bold rounded-lg border border-[#3A312B] transition-colors"
                            >
                              +5 {item.unit}
                            </button>
                            <button
                              onClick={() => handleRestock(item.id, 10)}
                              className="px-2.5 py-1 bg-[#1F1A17] hover:bg-[#E65F2B] hover:text-white text-stone-200 font-bold rounded-lg border border-[#3A312B] transition-colors"
                            >
                              +10 {item.unit}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SALES ANALYTICS */}
        {activeTab === 'analytics' && analytics && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Summary Visual Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Revenue */}
              <div className="bg-[#2D2521] border border-[#3A312B] p-4 rounded-2xl space-y-2 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Total Daily Revenue</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  ${analytics.totalRevenue.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+18.4% from yesterday</span>
                </div>
              </div>

              {/* Card 2: Total Orders */}
              <div className="bg-[#2D2521] border border-[#3A312B] p-4 rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Total Orders</span>
                  <div className="w-8 h-8 rounded-xl bg-[#E65F2B]/20 border border-[#E65F2B]/40 text-[#E65F2B] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  {analytics.totalOrders} <span className="text-xs text-stone-400 font-normal">orders</span>
                </div>
                <div className="text-[11px] text-stone-400 flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-blue-400">
                    <Truck className="w-3 h-3" /> {analytics.deliveryOrdersCount} Del
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-amber-400">
                    <Store className="w-3 h-3" /> {analytics.pickupOrdersCount} Pick
                  </span>
                </div>
              </div>

              {/* Card 3: Avg Order Value */}
              <div className="bg-[#2D2521] border border-[#3A312B] p-4 rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Avg Order Value</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  ${analytics.averageOrderValue.toFixed(2)}
                </div>
                <div className="text-[11px] text-stone-400">Per customer ticket</div>
              </div>

              {/* Card 4: Top Seller Highlight */}
              <div className="bg-[#2D2521] border border-[#3A312B] p-4 rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Top Selling Dish</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-sm font-extrabold text-white truncate">
                  {analytics.topSellingItems[0]?.name || 'Honey Latte'}
                </div>
                <div className="text-[11px] text-[#D4A373] font-mono">
                  {analytics.topSellingItems[0]?.quantitySold || 0} units sold (${analytics.topSellingItems[0]?.revenue.toFixed(2) || '0.00'})
                </div>
              </div>
            </div>

            {/* Top-Selling Dishes Ranking List */}
            <div className="bg-[#2D2521] border border-[#3A312B] p-4 sm:p-5 rounded-2xl space-y-3">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-[#E65F2B]" />
                <span>Top Selling Dishes & Drinks</span>
              </h3>

              <div className="space-y-2.5">
                {analytics.topSellingItems.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl bg-[#1F1A17] border border-[#3A312B]/70">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#3A312B] text-white font-mono font-bold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-[10px] text-stone-400 uppercase">{item.category}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-[#E65F2B] text-xs block">{item.quantitySold} sold</span>
                      <span className="text-[10px] text-stone-400 font-mono">${item.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders Stream */}
            <div className="bg-[#2D2521] border border-[#3A312B] p-4 sm:p-5 rounded-2xl space-y-3">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#E65F2B]" />
                <span>Recent Orders Stream ({analytics.recentOrders.length})</span>
              </h3>

              <div className="space-y-2">
                {analytics.recentOrders.map((order) => (
                  <div key={order.id} className="p-3 bg-[#1F1A17] border border-[#3A312B] rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{order.id}</span>
                        <span className="text-stone-400 font-medium">{order.customerInfo.name}</span>
                        <span className="text-[10px] bg-[#3A312B] text-[#D4A373] px-2 py-0.5 rounded-md uppercase font-bold">
                          {order.orderType}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 block mt-0.5">
                        {order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-emerald-400 text-sm block">${order.total.toFixed(2)}</span>
                      <span className="text-[10px] text-stone-400 capitalize">{order.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Footer */}
        <div className="p-4 bg-[#15110F] border-t border-[#3A312B] flex items-center justify-between text-xs text-stone-400">
          <span>CraveCups Admin v2.4 • Full-Stack Management Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2D2521] hover:bg-[#3A312B] text-white font-bold rounded-xl border border-[#3A312B] transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
