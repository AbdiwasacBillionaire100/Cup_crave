import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types';
import {
  X,
  Clock,
  Coffee,
  Bike,
  Check,
  Phone,
  Navigation,
  ShieldCheck,
  FileText,
  Sliders,
  Sparkles,
  Store,
  CheckCircle,
} from 'lucide-react';

interface OrderTrackerModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order: initialOrder,
  onClose,
}) => {
  if (!initialOrder) return null;

  const [currentOrder, setCurrentOrder] = useState<Order>(initialOrder);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Poll Express API `/api/orders/:id` every 4 seconds to sync status live
  useEffect(() => {
    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${initialOrder.id}`);
        const data = await response.json();
        if (isMounted && data.success && data.data) {
          setCurrentOrder(data.data);
        }
      } catch (err) {
        // Silent catch during background polling
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [initialOrder.id]);

  // Handler for Admin Status advance buttons (calls Express POST /api/orders/:id/status)
  const handleUpdateStatus = async (targetStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/orders/${currentOrder.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setCurrentOrder(data.data);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isDelivery = currentOrder.orderType === 'delivery';

  const STAGES: { key: OrderStatus; stepNum: number; emoji: string; label: string; sub: string; icon: any }[] = [
    {
      key: 'received',
      stepNum: 1,
      emoji: '🧾',
      label: 'Order Confirmed',
      sub: 'Receipt verified & queued at espresso bar',
      icon: FileText,
    },
    {
      key: 'crafting',
      stepNum: 2,
      emoji: '☕',
      label: 'Brewing Your Order',
      sub: `Handcrafting fresh by ${currentOrder.baristaName}`,
      icon: Coffee,
    },
    {
      key: isDelivery ? 'out_for_delivery' : 'ready_for_pickup',
      stepNum: 3,
      emoji: '🛵',
      label: isDelivery ? 'Out for Delivery' : 'Ready for Pickup',
      sub: isDelivery
        ? `On courier bike with ${currentOrder.driverName || 'Alex'}`
        : 'Fresh & waiting at 742 Market St counter',
      icon: isDelivery ? Bike : Store,
    },
    {
      key: 'delivered',
      stepNum: 4,
      emoji: '🎉',
      label: isDelivery ? 'Order Delivered' : 'Pickup Completed',
      sub: 'Enjoy your artisan CraveCups brew!',
      icon: ShieldCheck,
    },
  ];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 0;
      case 'crafting':
        return 1;
      case 'out_for_delivery':
      case 'ready_for_pickup':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(currentOrder.status);
  const progressPercent = Math.min(100, Math.round(((currentIndex + 1) / STAGES.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#1F1A17] border border-[#3A312B] rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#15110F] border-b border-[#3A312B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E65F2B]/20 border border-[#E65F2B]/40 flex items-center justify-center text-[#E65F2B]">
              <CheckCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Order Confirmed
                </span>
                <span className="text-[10px] bg-[#3A312B] text-[#D4A373] px-2 py-0.5 rounded-full font-mono">
                  #{currentOrder.id}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white">Order Status & Progress</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-full bg-[#2D2521] border border-[#3A312B] transition-colors"
            aria-label="Close Order Tracker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Tracker Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-white">
          {/* Top Success Banner & Time Estimation */}
          <div className="bg-gradient-to-r from-[#2D2521] via-[#3A312B] to-[#2D2521] p-4 sm:p-5 rounded-2xl border border-[#D4A373]/30 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E65F2B]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#D4A373] font-bold uppercase tracking-wider block">
                  {isDelivery ? 'Delivery Destination' : 'Pickup Collection Spot'}
                </span>
                <h3 className="text-sm font-semibold text-stone-200 mt-0.5">
                  {isDelivery
                    ? currentOrder.customerInfo.address
                    : 'CraveCups Espresso Bar — 742 Market St'}
                </h3>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-[#E65F2B] text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. Time</span>
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {currentOrder.status === 'delivered'
                    ? 'Completed!'
                    : `~${currentOrder.estimatedTimeMinutes} Mins`}
                </div>
              </div>
            </div>

            {/* Overall Horizontal Progress Bar */}
            <div className="mt-4 pt-3 border-t border-[#3A312B]/60">
              <div className="flex justify-between items-center text-xs text-stone-300 font-semibold mb-1.5">
                <span>Status Completion</span>
                <span className="font-mono text-[#E65F2B]">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#15110F] rounded-full overflow-hidden border border-[#3A312B]">
                <div
                  className="h-full bg-gradient-to-r from-[#D4A373] via-[#E65F2B] to-emerald-500 rounded-full transition-all duration-700 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Highly Visual Multi-Step Progress Tracker */}
          <div className="space-y-4 bg-[#15110F] p-4 sm:p-5 rounded-2xl border border-[#3A312B]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#D4A373] uppercase tracking-wider flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-[#E65F2B]" />
                Live Order Journey
              </h3>
              <span className="text-[11px] text-stone-400">Step {currentIndex + 1} of 4</span>
            </div>

            {/* Stepper Node List */}
            <div className="relative pl-7 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-1 before:bg-[#2D2521]">
              {/* Animated active vertical fill line */}
              <div
                className="absolute left-3.5 top-3 w-1 bg-gradient-to-b from-[#E65F2B] to-[#D4A373] transition-all duration-700 rounded-full"
                style={{
                  height: `${(currentIndex / (STAGES.length - 1)) * 85}%`,
                }}
              />

              {STAGES.map((stage, idx) => {
                const isCompleted = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                const IconComp = stage.icon;

                return (
                  <div key={stage.key} className="relative flex items-start gap-3.5 group">
                    {/* Circle Node Icon */}
                    <div
                      className={`absolute -left-7 top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                        isCurrent
                          ? 'bg-[#E65F2B] text-white border-white shadow-lg shadow-[#E65F2B]/50 scale-110 z-10'
                          : isCompleted
                          ? 'bg-emerald-600 text-white border-emerald-500 z-10'
                          : 'bg-[#1F1A17] border-[#3A312B] text-stone-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span>{stage.emoji}</span>
                      )}
                    </div>

                    <div
                      className={`flex-1 p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-[#2D2521] border-[#E65F2B]/60 shadow-md shadow-[#E65F2B]/10'
                          : isCompleted
                          ? 'bg-[#1F1A17]/80 border-[#3A312B]/80'
                          : 'bg-[#1F1A17]/40 border-transparent opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#D4A373]">
                            Step {stage.stepNum}.
                          </span>
                          <h4
                            className={`text-sm font-extrabold ${
                              isCurrent
                                ? 'text-white'
                                : isCompleted
                                ? 'text-emerald-400'
                                : 'text-stone-400'
                            }`}
                          >
                            {stage.label}
                          </h4>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#E65F2B] text-white px-2 py-0.5 rounded-full font-bold animate-pulse shadow">
                            In Progress
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-800">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-300 mt-1 flex items-center gap-1.5">
                        <IconComp className="w-3.5 h-3.5 text-[#D4A373] shrink-0" />
                        <span>{stage.sub}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Delivery Map Visualizer */}
          {isDelivery && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#D4A373] uppercase tracking-wider flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-[#E65F2B]" />
                  <span>Live Courier Tracker</span>
                </span>
                <span className="text-stone-400 text-[11px]">
                  Courier: {currentOrder.driverName || 'Alex (Specialist)'}
                </span>
              </div>

              <div className="relative w-full h-36 bg-[#15110F] border border-[#3A312B] rounded-2xl overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4A373_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute w-3/4 h-1 bg-gradient-to-r from-[#E65F2B] via-[#D4A373] to-emerald-500 top-1/2 left-10" />

                {/* Cafe Pin */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-center">
                  <div className="w-8 h-8 rounded-full bg-[#1F1A17] border border-[#D4A373] flex items-center justify-center text-[#D4A373] shadow">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] text-stone-400 font-bold block mt-1">CraveCups</span>
                </div>

                {/* Moving Driver Marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 flex flex-col items-center z-10"
                  style={{
                    left:
                      currentIndex === 0
                        ? '18%'
                        : currentIndex === 1
                        ? '40%'
                        : currentIndex === 2
                        ? '68%'
                        : '88%',
                  }}
                >
                  <div className="w-9 h-9 rounded-full bg-[#E65F2B] text-white flex items-center justify-center shadow-lg shadow-[#E65F2B]/50 animate-bounce border-2 border-white">
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-white font-bold bg-[#1F1A17] px-2 py-0.5 rounded-md border border-[#3A312B] mt-1 shadow whitespace-nowrap">
                    {currentOrder.driverName || 'Courier'}
                  </span>
                </div>

                {/* Customer Pin */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] text-stone-400 font-bold block mt-1">You</span>
                </div>
              </div>
            </div>
          )}

          {/* Order Item Summary */}
          <div className="bg-[#15110F] p-4 rounded-2xl border border-[#3A312B] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#D4A373] uppercase tracking-wider">
                Order Items ({currentOrder.items.length})
              </span>
              <span className="text-stone-400 font-mono text-[11px]">
                Paid via {currentOrder.customerInfo.name || 'Card'}
              </span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {currentOrder.items.map((item) => (
                <div
                  key={item.cartId}
                  className="flex items-center justify-between text-xs text-stone-300 bg-[#2D2521] p-2.5 rounded-xl border border-[#3A312B]/60"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[#E65F2B] font-bold bg-[#15110F] px-2 py-0.5 rounded-md border border-[#3A312B]">
                      {item.quantity}x
                    </span>
                    <div>
                      <span className="font-semibold text-white block">{item.menuItem.name}</span>
                      <span className="text-[10px] text-stone-400">
                        {item.size} • {item.milk}
                        {item.addons.length > 0 ? ` + ${item.addons.join(', ')}` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-white font-bold">
                    ${item.itemTotalPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#3A312B] flex justify-between items-center text-sm font-bold text-white">
              <span>Grand Total</span>
              <span className="text-[#E65F2B] font-mono text-base">${currentOrder.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Interactive Mock Admin Panel (Barista Simulator Controller) */}
          <div className="bg-gradient-to-br from-[#2D2521] to-[#15110F] p-4 rounded-2xl border border-[#D4A373]/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#D4A373]" />
                <h4 className="text-xs font-bold text-[#D4A373] uppercase tracking-wider">
                  🧪 Mock Admin & Barista Simulator
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
                className="text-[11px] text-stone-400 hover:text-white underline font-semibold"
              >
                {isAdminPanelOpen ? 'Hide Testing Controls' : 'Show Testing Controls'}
              </button>
            </div>

            {isAdminPanelOpen && (
              <div className="space-y-2 pt-1 animate-fade-in">
                <p className="text-[11px] text-stone-300">
                  Click any button below to trigger live status updates via the Express backend:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleUpdateStatus('received')}
                    disabled={isUpdatingStatus}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      currentOrder.status === 'received'
                        ? 'bg-[#E65F2B] text-white border-white shadow'
                        : 'bg-[#1F1A17] text-stone-300 border-[#3A312B] hover:border-[#D4A373]'
                    }`}
                  >
                    <span>🧾 1. Confirmed</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('crafting')}
                    disabled={isUpdatingStatus}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      currentOrder.status === 'crafting'
                        ? 'bg-[#E65F2B] text-white border-white shadow'
                        : 'bg-[#1F1A17] text-stone-300 border-[#3A312B] hover:border-[#D4A373]'
                    }`}
                  >
                    <span>☕ 2. Brewing</span>
                  </button>

                  <button
                    onClick={() =>
                      handleUpdateStatus(isDelivery ? 'out_for_delivery' : 'ready_for_pickup')
                    }
                    disabled={isUpdatingStatus}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      currentOrder.status === 'out_for_delivery' ||
                      currentOrder.status === 'ready_for_pickup'
                        ? 'bg-[#E65F2B] text-white border-white shadow'
                        : 'bg-[#1F1A17] text-stone-300 border-[#3A312B] hover:border-[#D4A373]'
                    }`}
                  >
                    <span>🛵 3. {isDelivery ? 'Delivery' : 'Pickup Ready'}</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('delivered')}
                    disabled={isUpdatingStatus}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      currentOrder.status === 'delivered'
                        ? 'bg-emerald-600 text-white border-white shadow'
                        : 'bg-[#1F1A17] text-stone-300 border-[#3A312B] hover:border-[#D4A373]'
                    }`}
                  >
                    <span>🎉 4. Completed</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
