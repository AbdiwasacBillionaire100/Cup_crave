import React, { useState, useEffect } from 'react';
import { CartItem, CustomerInfo, Order, OrderType, User } from '../types';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Clock,
  Tag,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Utensils,
} from 'lucide-react';

interface DesktopCartSidebarProps {
  cartItems: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  orderType: OrderType;
  onToggleOrderType: (type: OrderType) => void;
  onOrderSuccess: (order: Order) => void;
  currentUser?: User | null;
}

export const DesktopCartSidebar: React.FC<DesktopCartSidebarProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  orderType,
  onToggleOrderType,
  onOrderSuccess,
  currentUser,
}) => {
  // Checkout Form States
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [aptUnit, setAptUnit] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [pickupTime, setPickupTime] = useState('ASAP (~10-15 mins)');

  // Auto-fill when user signs in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setCustomerName(currentUser.name);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Tipping
  const [tipPercent, setTipPercent] = useState<number>(15);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.itemTotalPrice, 0);
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.percent) / 100 : 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = taxableSubtotal * 0.0825; // 8.25% sales tax
  const deliveryFee = orderType === 'delivery' ? (subtotal > 25 ? 0 : 2.99) : 0;
  const tipAmount = (taxableSubtotal * tipPercent) / 100;
  const grandTotal = taxableSubtotal + tax + deliveryFee + tipAmount;

  // Apply Promo
  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (code === 'CRAVE20') {
      setAppliedPromo({ code: 'CRAVE20', percent: 20 });
      setPromoCodeInput('');
    } else if (code === 'WELCOME10') {
      setAppliedPromo({ code: 'WELCOME10', percent: 10 });
      setPromoCodeInput('');
    } else {
      setPromoError('Invalid code. Try "CRAVE20" for 20% off!');
    }
  };

  // Handle Submit Order to Express API
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (cartItems.length === 0) {
      setSubmitError('Your bag is currently empty');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError('Please enter your name and phone number');
      return;
    }

    if (orderType === 'delivery' && !customerAddress.trim()) {
      setSubmitError('Please provide a delivery address');
      return;
    }

    if (orderType === 'table' && !tableNumber.trim()) {
      setSubmitError('Please enter your Table Number');
      return;
    }

    setIsSubmitting(true);

    const fullAddress =
      orderType === 'delivery'
        ? `${customerAddress.trim()}${aptUnit.trim() ? `, Apt/Unit ${aptUnit.trim()}` : ''}`
        : undefined;

    const customerInfo: CustomerInfo = {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      address: fullAddress,
      tableNumber: orderType === 'table' ? tableNumber.trim() : undefined,
      deliveryNotes: deliveryNotes.trim() || undefined,
      pickupTime: orderType === 'pickup' ? pickupTime : undefined,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          orderType,
          customerInfo,
          subtotal,
          tax,
          deliveryFee,
          tip: tipAmount,
          discount: discountAmount,
          promoCode: appliedPromo?.code,
          total: grandTotal,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        onClearCart();
        onOrderSuccess(data.data);
      } else {
        setSubmitError(data.error || 'Failed to place order');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Server network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#1F1A17] border border-[#3A312B] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-7rem)]">
      {/* Sidebar Header */}
      <div className="p-4 bg-[#15110F] border-b border-[#3A312B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#E65F2B] text-white rounded-xl shadow-md shadow-[#E65F2B]/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>Your Shopping Bag</span>
            </h2>
            <span className="text-xs text-[#D4A373]">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} selected
            </span>
          </div>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors bg-[#2D2521] px-2.5 py-1 rounded-lg border border-[#3A312B]"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 3-Way Order Mode Toggle Switch: Delivery | Table Service | Takeaway */}
        <div className="bg-[#15110F] p-1.5 rounded-2xl border border-[#3A312B] grid grid-cols-3 gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => onToggleOrderType('delivery')}
            className={`py-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all ${
              orderType === 'delivery'
                ? 'bg-[#E65F2B] text-white shadow-lg shadow-[#E65F2B]/30 border border-[#E65F2B]'
                : 'bg-[#2D2521] text-stone-400 hover:text-white border border-[#3A312B]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleOrderType('table')}
            className={`py-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all ${
              orderType === 'table'
                ? 'bg-[#E65F2B] text-white shadow-lg shadow-[#E65F2B]/30 border border-[#E65F2B]'
                : 'bg-[#2D2521] text-stone-400 hover:text-white border border-[#3A312B]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>Table Service</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleOrderType('pickup')}
            className={`py-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all ${
              orderType === 'pickup'
                ? 'bg-[#E65F2B] text-white shadow-lg shadow-[#E65F2B]/30 border border-[#E65F2B]'
                : 'bg-[#2D2521] text-stone-400 hover:text-white border border-[#3A312B]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </button>
        </div>

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#2D2521] border border-[#3A312B] flex items-center justify-center mx-auto text-stone-500">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <p className="text-stone-300 font-bold text-sm">Your bag is currently empty</p>
            <p className="text-stone-500 text-xs max-w-xs mx-auto">
              Click 'Add to Bag' on any coffee, specialty tea, or baked item to build your order!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#D4A373] uppercase tracking-wider block">
              Items in Bag ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </span>

            {cartItems.map((item) => (
              <div
                key={item.cartId}
                className="bg-[#2D2521] border border-[#3A312B] p-3 rounded-2xl flex items-start gap-3 transition-all hover:border-[#D4A373]/40"
              >
                <img
                  src={item.menuItem.image}
                  alt={item.menuItem.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover bg-[#1F1A17] shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-white text-xs truncate">{item.menuItem.name}</h4>
                    <button
                      onClick={() => onRemoveItem(item.cartId)}
                      className="text-stone-500 hover:text-rose-400 p-0.5 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] text-stone-400 space-y-0.5 font-light">
                    <p>
                      Size: <span className="text-stone-200">{item.selectedSize}</span>
                      {item.selectedTemp && ` • ${item.selectedTemp}`}
                    </p>
                    {item.selectedMilk && (
                      <p>
                        Milk: <span className="text-stone-200">{item.selectedMilk}</span>
                      </p>
                    )}
                    {item.selectedSweetness && (
                      <p>
                        Sweetness: <span className="text-stone-200">{item.selectedSweetness}</span>
                      </p>
                    )}
                    {item.selectedExtras.length > 0 && (
                      <p className="text-[#D4A373]">+ {item.selectedExtras.join(', ')}</p>
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-1.5">
                    <div className="flex items-center bg-[#15110F] border border-[#3A312B] rounded-xl p-1 shadow-inner">
                      <button
                        onClick={() => onUpdateQuantity(item.cartId, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-[#2D2521] hover:bg-[#3A312B] active:bg-[#E65F2B] text-stone-300 hover:text-white font-bold rounded-lg transition-all border border-[#3A312B] active:scale-90"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-extrabold text-white font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartId, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-[#E65F2B] hover:bg-[#D14F1D] active:bg-[#B83E12] text-white font-bold rounded-lg transition-all shadow-md shadow-[#E65F2B]/20 active:scale-90"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block font-light">Subtotal</span>
                      <span className="text-xs font-black text-[#E65F2B] font-mono">
                        ${item.itemTotalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customer Checkout Form */}
        {cartItems.length > 0 && (
          <form onSubmit={handleCheckout} className="space-y-4 pt-3 border-t border-[#3A312B]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4A373] uppercase tracking-wider block">
                {orderType === 'delivery'
                  ? 'Delivery Details'
                  : orderType === 'table'
                  ? 'Table Service Details'
                  : 'Takeaway Details'}
              </span>
              <span className="text-[10px] text-stone-400">
                {orderType === 'delivery'
                  ? 'Est. ~25 mins'
                  : orderType === 'table'
                  ? 'Brought directly to table'
                  : 'Ready at 742 Market St'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 block mb-1 font-semibold">Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2.5 rounded-xl outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-stone-300 block mb-1 font-semibold">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. (555) 234-5678"
                    className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2.5 rounded-xl outline-none transition-colors"
                  />
                </div>
              </div>

              {orderType === 'delivery' ? (
                <>
                  <div>
                    <label className="text-stone-300 block mb-1 font-semibold">Address *</label>
                    <input
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace"
                      className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2.5 rounded-xl outline-none transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-stone-300 block mb-1">Apt / Unit</label>
                      <input
                        type="text"
                        value={aptUnit}
                        onChange={(e) => setAptUnit(e.target.value)}
                        placeholder="e.g. Apt 4B"
                        className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-stone-300 block mb-1">Gate / Notes</label>
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="e.g. Leave at door"
                        className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : orderType === 'table' ? (
                <>
                  <div>
                    <label className="text-amber-400 block mb-1 font-extrabold flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5" />
                      Table Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g. Table 4 or Patio 12"
                      className="w-full bg-[#2D2521] border border-amber-500/50 focus:border-[#E65F2B] text-white p-2 rounded-xl outline-none font-bold placeholder:font-normal"
                    />
                  </div>
                  <div>
                    <label className="text-stone-300 block mb-1">Table Notes for Server</label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. High chair needed, extra napkins"
                      className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2 rounded-xl outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[#D4A373] block mb-1 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Collection Time *
                    </label>
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-[#2D2521] border border-[#D4A373]/50 focus:border-[#E65F2B] text-white p-2 rounded-xl outline-none font-medium cursor-pointer"
                    >
                      <option value="ASAP (~10-15 mins)">⚡ ASAP (~10-15 mins)</option>
                      <option value="In 20 minutes">🕒 In 20 minutes</option>
                      <option value="In 30 minutes">🕒 In 30 minutes</option>
                      <option value="In 45 minutes">🕒 In 45 minutes</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Promo Code Box */}
            <div className="space-y-1.5">
              <label className="text-stone-300 block text-xs font-semibold">Promo Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder='Try "CRAVE20"'
                    className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white text-xs p-2.5 rounded-xl outline-none font-mono uppercase"
                  />
                  <Tag className="w-3.5 h-3.5 text-stone-500 absolute right-3 top-3" />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="bg-[#3A312B] hover:bg-[#D4A373] text-[#D4A373] hover:text-[#1F1A17] font-bold text-xs px-3.5 py-2.5 rounded-xl border border-[#D4A373]/30 transition-all"
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/50 p-2 rounded-lg border border-emerald-800">
                  <Sparkles className="w-3 h-3" />
                  Promo {appliedPromo.code} applied! ({appliedPromo.percent}% off)
                </div>
              )}
              {promoError && (
                <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {promoError}
                </div>
              )}
            </div>

            {/* Tip Selection */}
            <div className="space-y-1.5">
              <label className="text-stone-300 block text-xs font-semibold">
                Add Barista Tip
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 15, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipPercent(pct)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-xl transition-all border ${
                      tipPercent === pct
                        ? 'bg-[#E65F2B] text-white border-[#E65F2B] shadow'
                        : 'bg-[#2D2521] text-stone-400 hover:text-white border-[#3A312B]'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Price Calculations Summary */}
            <div className="bg-[#15110F] p-3 rounded-xl border border-[#3A312B] space-y-1.5 text-xs text-stone-300 font-mono">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Sales Tax (8.25%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {orderType === 'delivery'
                    ? deliveryFee === 0
                      ? 'FREE'
                      : `$${deliveryFee.toFixed(2)}`
                    : 'N/A (Pickup)'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Barista Tip ({tipPercent}%)</span>
                <span>${tipAmount.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-[#3A312B] flex justify-between font-bold text-white text-sm">
                <span>Grand Total</span>
                <span className="text-[#E65F2B] font-mono text-base">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {submitError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Roasted Orange Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-between bg-[#E65F2B] hover:bg-[#D14F1D] disabled:bg-stone-700 text-white font-bold text-sm px-5 py-3.5 rounded-2xl shadow-xl shadow-[#E65F2B]/30 transition-all transform active:scale-95 cursor-pointer"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Place Order'}</span>
              <div className="flex items-center gap-1 font-mono text-base">
                <span>${grandTotal.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </form>
        )}
      </div>

      {/* Footer Security Note */}
      <div className="p-3 bg-[#15110F] border-t border-[#3A312B] text-center text-[10px] text-stone-500 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Secure express checkout powered by CraveCups Engine</span>
      </div>
    </div>
  );
};
