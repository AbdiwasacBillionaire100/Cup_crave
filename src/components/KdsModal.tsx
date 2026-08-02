import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus } from '../types';
import {
  X,
  ChefHat,
  RefreshCw,
  Volume2,
  VolumeX,
  Search,
  Flame,
  Clock,
  CheckCircle2,
  Utensils,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Filter,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface KdsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KdsModal: React.FC<KdsModalProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'active' | 'received' | 'crafting' | 'ready' | 'delivered'>('active');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'table' | 'pickup' | 'delivery'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(3);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  // Track previous pending order count for audio alert
  const prevReceivedCountRef = useRef<number>(0);

  // Audio Chime Generator using Web Audio API
  const playNewOrderChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.12); // E6

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio permission restriction fallback
    }
  };

  const fetchOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const newOrders: Order[] = data.data;
        
        // Count received orders
        const currentReceivedCount = newOrders.filter(o => o.status === 'received').length;
        if (soundEnabled && currentReceivedCount > prevReceivedCountRef.current && prevReceivedCountRef.current !== 0) {
          playNewOrderChime();
        }
        prevReceivedCountRef.current = currentReceivedCount;

        setOrders(newOrders);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch KDS orders:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Initial fetch and auto-refresh timer
  useEffect(() => {
    if (!isOpen) return;

    fetchOrders(false);

    if (refreshIntervalSec > 0) {
      const timer = setInterval(() => {
        fetchOrders(true);
      }, refreshIntervalSec * 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, refreshIntervalSec]);

  if (!isOpen) return null;

  // Single-tap Advance Status Handler
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic UI Update
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to advance order status:', err);
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Status Filter Logic
  const filteredOrders = orders.filter((o) => {
    // Status Filter
    if (statusFilter === 'active') {
      if (o.status === 'delivered') return false;
    } else if (statusFilter === 'received') {
      if (o.status !== 'received') return false;
    } else if (statusFilter === 'crafting') {
      if (o.status !== 'crafting') return false;
    } else if (statusFilter === 'ready') {
      if (o.status !== 'ready_for_pickup' && o.status !== 'out_for_delivery') return false;
    } else if (statusFilter === 'delivered') {
      if (o.status !== 'delivered') return false;
    }

    // Order Type Filter
    if (orderTypeFilter !== 'all' && o.orderType !== orderTypeFilter) {
      return false;
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesId = o.id.toLowerCase().includes(q);
      const matchesCustomer = o.customerInfo?.name?.toLowerCase().includes(q) || false;
      const matchesTable = o.customerInfo?.tableNumber?.toLowerCase().includes(q) || false;
      const matchesItem = o.items.some((i) => i.name.toLowerCase().includes(q));
      return matchesId || matchesCustomer || matchesTable || matchesItem;
    }

    return true;
  });

  // Calculate Status Counts
  const receivedCount = orders.filter((o) => o.status === 'received').length;
  const craftingCount = orders.filter((o) => o.status === 'crafting').length;
  const readyCount = orders.filter((o) => o.status === 'ready_for_pickup' || o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const activeTotalCount = receivedCount + craftingCount + readyCount;

  // Helper to format minutes elapsed since creation
  const getElapsedMinutes = (dateStr: string) => {
    const elapsedMs = new Date().getTime() - new Date(dateStr).getTime();
    const mins = Math.floor(elapsedMs / 60000);
    return mins < 1 ? 'Just now' : `${mins}m ago`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#15110F] border border-[#3A312B] rounded-3xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* KDS Header & Live Sync Bar */}
        <div className="bg-[#1F1A17] border-b border-[#3A312B] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-[#E65F2B] p-0.5 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <div className="w-full h-full bg-[#1F1A17] rounded-[14px] flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Kitchen Display System
                </h2>
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                  /staff/kds
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE QUEUE
                </span>
              </div>
              <p className="text-stone-400 text-xs hidden xs:block">
                Real-time order ticket display & 1-tap cook progress control for floor staff
              </p>
            </div>
          </div>

          {/* Controls: Audio Toggle, Refresh Speed & Manual Sync */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playNewOrderChime();
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                soundEnabled
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-[#2D2521] border-[#3A312B] text-stone-400 hover:text-white'
              }`}
              title={soundEnabled ? 'New Order Chime Alert ENABLED' : 'Sound Alerts MUTED'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>

            {/* Refresh Interval Selector */}
            <div className="hidden sm:flex items-center bg-[#2D2521] border border-[#3A312B] rounded-xl p-1 text-xs text-stone-300">
              <span className="px-2 text-stone-400 font-mono">Sync:</span>
              {[3, 5, 10].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setRefreshIntervalSec(sec)}
                  className={`px-2 py-1 rounded-lg font-mono font-bold transition-all ${
                    refreshIntervalSec === sec
                      ? 'bg-[#E65F2B] text-white shadow-sm'
                      : 'hover:text-white text-stone-400'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchOrders(false)}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-[#2D2521] border border-[#3A312B] hover:border-[#D4A373] text-stone-200 hover:text-white transition-all active:scale-95 disabled:opacity-50"
              title="Manual Sync Orders"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-[#2D2521] border border-[#3A312B] text-stone-400 hover:text-white hover:bg-rose-900/30 hover:border-rose-500/50 transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Filter Tabs & Order Type Switcher */}
        <div className="bg-[#1F1A17]/80 border-b border-[#3A312B] p-2.5 px-4 flex flex-wrap items-center justify-between gap-3">
          {/* Main Queue Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setStatusFilter('active')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === 'active'
                  ? 'bg-[#E65F2B] text-white border-[#E65F2B] shadow-md shadow-[#E65F2B]/20'
                  : 'bg-[#2D2521] text-stone-300 border-[#3A312B] hover:text-white'
              }`}
            >
              <span>Active Kitchen Queue</span>
              <span className="bg-black/30 px-2 py-0.5 rounded-full font-mono text-[11px]">
                {activeTotalCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('received')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === 'received'
                  ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20 font-extrabold'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Pending</span>
              <span className="bg-black/30 px-2 py-0.5 rounded-full font-mono text-[11px]">
                {receivedCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('crafting')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === 'crafting'
                  ? 'bg-sky-500 text-black border-sky-500 shadow-md shadow-sky-500/20 font-extrabold'
                  : 'bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Preparing</span>
              <span className="bg-black/30 px-2 py-0.5 rounded-full font-mono text-[11px]">
                {craftingCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('ready')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === 'ready'
                  ? 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20 font-extrabold'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready for Service</span>
              <span className="bg-black/30 px-2 py-0.5 rounded-full font-mono text-[11px]">
                {readyCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('delivered')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === 'delivered'
                  ? 'bg-stone-700 text-white border-stone-600'
                  : 'bg-[#2D2521] text-stone-400 border-[#3A312B] hover:text-stone-200'
              }`}
            >
              <span>History</span>
              <span className="bg-black/30 px-2 py-0.5 rounded-full font-mono text-[11px]">
                {deliveredCount}
              </span>
            </button>
          </div>

          {/* Secondary Filters: Order Type & Search */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Order Type Pill Filter */}
            <div className="flex items-center bg-[#2D2521] border border-[#3A312B] rounded-xl p-1 text-xs">
              <button
                onClick={() => setOrderTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  orderTypeFilter === 'all' ? 'bg-[#E65F2B] text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setOrderTypeFilter('table')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-semibold transition-all ${
                  orderTypeFilter === 'table' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400 hover:text-amber-300'
                }`}
                title="Table Service Orders Only"
              >
                <Utensils className="w-3 h-3" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setOrderTypeFilter('pickup')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-semibold transition-all ${
                  orderTypeFilter === 'pickup' ? 'bg-[#E65F2B] text-white' : 'text-stone-400 hover:text-white'
                }`}
                title="Takeaway Orders Only"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Takeaway</span>
              </button>
              <button
                onClick={() => setOrderTypeFilter('delivery')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-semibold transition-all ${
                  orderTypeFilter === 'delivery' ? 'bg-sky-500 text-black font-bold' : 'text-stone-400 hover:text-white'
                }`}
                title="Delivery Orders Only"
              >
                <MapPin className="w-3 h-3" />
                <span>Delivery</span>
              </button>
            </div>

            {/* Quick Filter Search Box */}
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket # or table..."
                className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white text-xs pl-8 pr-3 py-1.5 rounded-xl outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-stone-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* KDS Main Grid View of Order Cards */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#120E0C]">
          {isLoading && orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-3" />
              <p className="text-white font-bold text-base">Loading Kitchen Queue...</p>
              <p className="text-stone-400 text-xs">Syncing real-time orders from Express server</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-stone-400 border-2 border-dashed border-[#3A312B] rounded-3xl my-4">
              <ChefHat className="w-12 h-12 text-stone-600 mb-3" />
              <h3 className="text-white font-extrabold text-lg">No Orders in this View</h3>
              <p className="text-xs text-stone-400 max-w-sm mt-1">
                {statusFilter === 'received'
                  ? 'No pending orders waiting for kitchen preparation right now.'
                  : statusFilter === 'crafting'
                  ? 'No orders currently being crafted in the kitchen.'
                  : statusFilter === 'ready'
                  ? 'No orders awaiting server delivery or customer pickup.'
                  : 'All kitchen tickets match clean status filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredOrders.map((order) => {
                const isUpdating = isUpdatingId === order.id;

                // Determine Color Themes per Status
                let cardBorderClass = 'border-amber-500/60 bg-[#1F1A17] shadow-amber-900/10';
                let headerBannerClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                let statusLabel = 'RECEIVED / PENDING';

                if (order.status === 'crafting') {
                  cardBorderClass = 'border-sky-500/60 bg-[#1F1A17] shadow-sky-900/10';
                  headerBannerClass = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                  statusLabel = 'PREPARING / CRAFTING';
                } else if (order.status === 'ready_for_pickup' || order.status === 'out_for_delivery') {
                  cardBorderClass = 'border-emerald-500/60 bg-[#1F1A17] shadow-emerald-900/10';
                  headerBannerClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                  statusLabel = order.status === 'out_for_delivery' ? 'OUT FOR DELIVERY' : 'READY FOR PICKUP';
                } else if (order.status === 'delivered') {
                  cardBorderClass = 'border-stone-800 bg-[#1A1614] opacity-75';
                  headerBannerClass = 'bg-stone-800 text-stone-400 border-stone-700';
                  statusLabel = 'COMPLETED';
                }

                // Check time elapsed warning (>10m is long wait)
                const elapsedMins = Math.floor(
                  (new Date().getTime() - new Date(order.createdAt).getTime()) / 60000
                );
                const isUrgent = order.status !== 'delivered' && elapsedMins >= 10;

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden shadow-lg ${cardBorderClass} ${
                      isUrgent ? 'ring-2 ring-rose-500/80 animate-pulse' : ''
                    }`}
                  >
                    {/* Top Ticket Header Banner */}
                    <div>
                      <div className={`p-3 border-b flex items-center justify-between ${headerBannerClass}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-extrabold text-white">
                            #{order.id.slice(-6)}
                          </span>
                          {/* Order Type Badge */}
                          {order.orderType === 'table' ? (
                            <span className="bg-amber-500 text-black font-extrabold text-xs px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                              <Utensils className="w-3 h-3" />
                              <span>Table {order.customerInfo.tableNumber || '?'}</span>
                            </span>
                          ) : order.orderType === 'delivery' ? (
                            <span className="bg-sky-500 text-black font-extrabold text-xs px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                              <MapPin className="w-3 h-3" />
                              <span>Delivery</span>
                            </span>
                          ) : (
                            <span className="bg-[#E65F2B] text-white font-extrabold text-xs px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                              <ShoppingBag className="w-3 h-3" />
                              <span>Takeaway</span>
                            </span>
                          )}
                        </div>

                        {/* Time Elapsed Badge */}
                        <div
                          className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                            isUrgent ? 'bg-rose-500 text-white font-extrabold animate-bounce' : 'bg-black/40 text-stone-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{getElapsedMinutes(order.createdAt)}</span>
                        </div>
                      </div>

                      {/* Customer Info Line */}
                      <div className="bg-[#15110F] px-3.5 py-2 border-b border-[#3A312B] flex items-center justify-between text-xs">
                        <div className="font-bold text-white truncate max-w-[170px]">
                          👤 {order.customerInfo.name}
                        </div>
                        <div className="text-stone-400 font-mono text-[11px]">
                          📞 {order.customerInfo.phone}
                        </div>
                      </div>

                      {/* Ticket Item List (Large & Clear for Kitchen) */}
                      <div className="p-3.5 space-y-3 max-h-[320px] overflow-y-auto divide-y divide-[#2D2521]">
                        {order.items.map((item, idx) => (
                          <div key={idx} className={`${idx > 0 ? 'pt-2.5' : ''} space-y-1`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#E65F2B] text-white font-mono font-black text-sm px-2 py-0.5 rounded-lg shadow-sm">
                                  {item.quantity}x
                                </span>
                                <span className="font-extrabold text-white text-sm sm:text-base leading-snug">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-xs font-mono font-bold text-[#D4A373]">
                                ${item.itemTotalPrice.toFixed(2)}
                              </span>
                            </div>

                            {/* Options Breakdown Pills */}
                            <div className="pl-8 text-xs space-y-0.5 text-stone-300">
                              {item.selectedSize && (
                                <div className="font-medium text-stone-300">
                                  • Size: <span className="font-bold text-white">{item.selectedSize.name}</span>
                                </div>
                              )}
                              {item.selectedTemp && (
                                <div className="font-medium text-stone-300">
                                  • Temp: <span className="font-bold text-sky-300">{item.selectedTemp}</span>
                                </div>
                              )}
                              {item.selectedMilk && (
                                <div className="font-medium text-stone-300">
                                  • Milk: <span className="font-bold text-amber-200">{item.selectedMilk}</span>
                                </div>
                              )}
                              {item.selectedSweetness && (
                                <div className="font-medium text-stone-300">
                                  • Sweetness: <span className="font-bold text-stone-200">{item.selectedSweetness}</span>
                                </div>
                              )}
                              {item.selectedSpice && (
                                <div className="font-extrabold text-amber-400 flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-amber-500" />
                                  <span>Spice: {item.selectedSpice}</span>
                                </div>
                              )}
                              {item.selectedExtras.length > 0 && (
                                <div className="text-amber-300/90 font-medium">
                                  + {item.selectedExtras.join(', ')}
                                </div>
                              )}
                              {item.specialInstructions && (
                                <div className="mt-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 p-1.5 rounded-lg text-xs font-bold flex items-start gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                  <span>Note: "{item.specialInstructions}"</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Table Notes / Customer Special Notes */}
                        {order.customerInfo.deliveryNotes && (
                          <div className="pt-2">
                            <div className="bg-[#2D2521] border border-[#3A312B] text-stone-300 p-2 rounded-xl text-xs">
                              <span className="font-bold text-amber-400 block">Server / Delivery Note:</span>
                              <p className="italic text-white">"{order.customerInfo.deliveryNotes}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer: 1-Tap Status Advancement Buttons */}
                    <div className="p-3 bg-[#15110F] border-t border-[#3A312B] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                        <span>Status: <strong className="text-white">{statusLabel}</strong></span>
                        <span>Total: <strong className="text-emerald-400">${order.total.toFixed(2)}</strong></span>
                      </div>

                      {/* 1-Tap Status Progression Button */}
                      {order.status === 'received' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'crafting')}
                          disabled={isUpdating}
                          className="w-full py-3 bg-gradient-to-r from-amber-500 to-[#E65F2B] hover:from-amber-400 hover:to-[#f06e3a] active:scale-98 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          ) : (
                            <>
                              <ChefHat className="w-4 h-4" />
                              <span>⚡ Start Preparing Order</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}

                      {order.status === 'crafting' && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              order.id,
                              order.orderType === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup'
                            )
                          }
                          disabled={isUpdating}
                          className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-98 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>✅ Mark as Ready for Service</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}

                      {(order.status === 'ready_for_pickup' || order.status === 'out_for_delivery') && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          disabled={isUpdating}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>🎉 Mark Completed & Delivered</span>
                            </>
                          )}
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'crafting')}
                          disabled={isUpdating}
                          className="w-full py-2 bg-[#2D2521] hover:bg-[#3A312B] text-stone-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-[#3A312B]"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                          <span>Reopen / Move Back to Preparing</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* KDS Footer Stats Bar */}
        <div className="bg-[#1F1A17] border-t border-[#3A312B] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-stone-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Pending: <strong className="text-white">{receivedCount}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Preparing: <strong className="text-white">{craftingCount}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Ready: <strong className="text-white">{readyCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-stone-400">
            <span>Last Synced: {lastRefreshedAt.toLocaleTimeString()}</span>
            <span>•</span>
            <span>Interval: {refreshIntervalSec}s</span>
          </div>
        </div>

      </div>
    </div>
  );
};
