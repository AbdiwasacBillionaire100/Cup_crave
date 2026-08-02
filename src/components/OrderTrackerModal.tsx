import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types';
import { X, CheckCircle2, Clock, Coffee, Bike, Check, Phone, Navigation, ShieldCheck } from 'lucide-react';

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

  const STAGES: { key: OrderStatus; label: string; sub: string; icon: any }[] = [
    { key: 'received', label: 'Order Received', sub: 'Sent to espresso bar', icon: CheckCircle2 },
    { key: 'crafting', label: 'Barista Crafting', sub: currentOrder.baristaName, icon: Coffee },
    {
      key: currentOrder.orderType === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup',
      label: currentOrder.orderType === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup',
      sub: currentOrder.driverName || 'At CraveCups Counter',
      icon: Bike,
    },
    { key: 'delivered', label: 'Order Completed', sub: 'Enjoy your CraveCups!', icon: ShieldCheck },
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1F1A17] border border-[#3A312B] rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#15110F] border-b border-[#3A312B] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E65F2B] animate-ping" />
              <h2 className="text-base font-bold text-white">Live Order Tracker</h2>
            </div>
            <p className="text-xs text-[#D4A373] font-mono">Order #{currentOrder.id}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-full bg-[#2D2521] border border-[#3A312B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tracker Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Estimated Arrival Banner */}
          <div className="bg-gradient-to-r from-[#2D2521] via-[#3A312B] to-[#2D2521] p-4 rounded-2xl border border-[#D4A373]/30 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-[#D4A373] text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-[#E65F2B]" />
              <span>Estimated {currentOrder.orderType === 'delivery' ? 'Delivery' : 'Pickup'} Time</span>
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {currentOrder.status === 'delivered' ? 'Arrived!' : `~ ${currentOrder.estimatedTimeMinutes} Mins`}
            </div>
            <p className="text-xs text-stone-300">
              {currentOrder.status === 'delivered'
                ? 'Your order has been safely delivered.'
                : `Handcrafted fresh by ${currentOrder.baristaName}`}
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-4 px-2">
            <h3 className="text-xs font-bold text-[#D4A373] uppercase tracking-wider">
              Order Status Progress
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#3A312B]">
              {STAGES.map((stage, idx) => {
                const isCompleted = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                const IconComponent = stage.icon;

                return (
                  <div key={stage.key} className="relative flex items-start gap-3 group">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                        isCompleted
                          ? 'bg-[#E65F2B] text-white border-[#E65F2B] shadow-md shadow-[#E65F2B]/30'
                          : 'bg-[#1F1A17] border-[#3A312B] text-stone-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-bold ${
                            isCurrent
                              ? 'text-[#E65F2B]'
                              : isCompleted
                              ? 'text-white'
                              : 'text-stone-500'
                          }`}
                        >
                          {stage.label}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#E65F2B]/20 text-[#E65F2B] px-2 py-0.5 rounded-full font-bold animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{stage.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulated Map Visualizer for Delivery */}
          {currentOrder.orderType === 'delivery' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#D4A373] uppercase tracking-wider flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-[#E65F2B]" />
                  <span>Live Courier Map</span>
                </span>
                <span className="text-stone-400">Destination: {currentOrder.customerInfo.address}</span>
              </div>

              <div className="relative w-full h-40 bg-[#15110F] border border-[#3A312B] rounded-2xl overflow-hidden flex items-center justify-center">
                {/* Decorative Map Pattern Background */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4A373_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Animated Route Line */}
                <div className="absolute w-3/4 h-0.5 bg-gradient-to-r from-[#E65F2B] via-[#D4A373] to-[#E65F2B] top-1/2 left-8" />

                {/* Cafe Pin */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-center">
                  <div className="w-8 h-8 rounded-full bg-[#1F1A17] border border-[#D4A373] flex items-center justify-center text-[#D4A373] mx-auto shadow">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] text-stone-400 font-bold block mt-1">CraveCups Cafe</span>
                </div>

                {/* Moving Driver Marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 flex flex-col items-center"
                  style={{
                    left:
                      currentIndex === 0
                        ? '15%'
                        : currentIndex === 1
                        ? '35%'
                        : currentIndex === 2
                        ? '65%'
                        : '85%',
                  }}
                >
                  <div className="w-9 h-9 rounded-full bg-[#E65F2B] text-white flex items-center justify-center shadow-lg shadow-[#E65F2B]/40 animate-bounce">
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-white font-bold bg-[#1F1A17] px-2 py-0.5 rounded border border-[#3A312B] mt-1 shadow">
                    {currentOrder.driverName || 'Courier'}
                  </span>
                </div>

                {/* Customer Pin */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] text-stone-400 font-bold block mt-1">Delivery Spot</span>
                </div>
              </div>
            </div>
          )}

          {/* Driver / Barista Contact Box */}
          {currentOrder.driverName && (
            <div className="p-3 bg-[#2D2521] border border-[#3A312B] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4A373] text-[#1F1A17] font-bold flex items-center justify-center text-sm">
                  {currentOrder.driverName[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{currentOrder.driverName}</h4>
                  <span className="text-[11px] text-stone-400">Assigned Delivery Specialist</span>
                </div>
              </div>

              <a
                href={`tel:${currentOrder.driverPhone || '5550192834'}`}
                className="p-2.5 bg-[#E65F2B] hover:bg-[#D14F1D] text-white rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shadow"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Courier</span>
              </a>
            </div>
          )}

          {/* Order Item Summary */}
          <div className="space-y-2 pt-2 border-t border-[#3A312B]">
            <span className="text-xs font-bold text-[#D4A373] uppercase tracking-wider block">
              Order Items ({currentOrder.items.length})
            </span>

            <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
              {currentOrder.items.map((item) => (
                <div
                  key={item.cartId}
                  className="flex items-center justify-between text-xs text-stone-300 bg-[#2D2521] p-2 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#E65F2B] font-bold">{item.quantity}x</span>
                    <span className="font-semibold text-white">{item.menuItem.name}</span>
                  </div>
                  <span className="font-mono text-stone-400">${item.itemTotalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center text-sm font-bold text-white">
              <span>Total Paid</span>
              <span className="text-[#E65F2B] font-mono">${currentOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
