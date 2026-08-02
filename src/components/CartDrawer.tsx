import React, { useState } from 'react';
import { CartItem, CustomerInfo, Order } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, MapPin, Clock, Tag, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  orderType: 'delivery' | 'pickup';
  onToggleOrderType: (type: 'delivery' | 'pickup') => void;
  onOrderSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  orderType,
  onToggleOrderType,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  // Checkout Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [aptUnit, setAptUnit] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [pickupTime, setPickupTime] = useState('ASAP (~10-15 mins)');

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
      setSubmitError('Your cart is empty');
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

    setIsSubmitting(true);

    const fullAddress = orderType === 'delivery' 
      ? `${customerAddress.trim()}${aptUnit.trim() ? `, Apt/Unit ${aptUnit.trim()}` : ''}`
      : undefined;

    const customerInfo: CustomerInfo = {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      address: fullAddress,
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
        onClose();
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#1F1A17] h-full border-l border-[#3A312B] flex flex-col justify-between shadow-2xl relative">
        {/* Drawer Top Header */}
        <div className="p-4 bg-[#15110F] border-b border-[#3A312B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#E65F2B] text-white rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Your Order</h2>
              <span className="text-xs text-stone-400">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in bag
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-full bg-[#2D2521] border border-[#3A312B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Order Mode Toggle Switch */}
          <div className="bg-[#15110F] p-1.5 rounded-2xl border border-[#3A312B] flex gap-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => onToggleOrderType('delivery')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                orderType === 'delivery'
                  ? 'bg-[#E65F2B] text-white shadow-lg shadow-[#E65F2B]/30 border border-[#E65F2B]'
                  : 'bg-[#2D2521] text-stone-400 hover:text-white border border-[#3A312B]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleOrderType('pickup')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                orderType === 'pickup'
                  ? 'bg-[#E65F2B] text-white shadow-lg shadow-[#E65F2B]/30 border border-[#E65F2B]'
                  : 'bg-[#2D2521] text-stone-400 hover:text-white border border-[#3A312B]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Self Pickup</span>
            </button>
          </div>

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto" />
              <p className="text-stone-300 font-bold">Your bag is currently empty</p>
              <p className="text-stone-500 text-xs max-w-xs mx-auto">
                Explore our handcrafted coffee, tea, and bakery menu to add your favorites!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D4A373] uppercase tracking-wider">
                  Bag Items
                </span>
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Clear Bag
                </button>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-[#2D2521] border border-[#3A312B] p-3 rounded-2xl flex items-start gap-3"
                >
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover bg-[#1F1A17]"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-white text-xs truncate">{item.menuItem.name}</h4>
                      <button
                        onClick={() => onRemoveItem(item.cartId)}
                        className="text-stone-500 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Customizations tags summary */}
                    <div className="text-[11px] text-stone-400 space-y-0.5 font-light">
                      <p>
                        Size: <span className="text-stone-200">{item.selectedSize}</span>
                        {item.selectedTemp && ` • ${item.selectedTemp}`}
                      </p>
                      {item.selectedMilk && (
                        <p>Milk: <span className="text-stone-200">{item.selectedMilk}</span></p>
                      )}
                      {item.selectedSweetness && (
                        <p>Sweetness: <span className="text-stone-200">{item.selectedSweetness}</span></p>
                      )}
                      {item.selectedExtras.length > 0 && (
                        <p className="text-[#D4A373]">+ {item.selectedExtras.join(', ')}</p>
                      )}
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center bg-[#15110F] border border-[#3A312B] rounded-xl p-1 shadow-inner">
                        <button
                          onClick={() => onUpdateQuantity(item.cartId, -1)}
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-[#2D2521] hover:bg-[#3A312B] active:bg-[#E65F2B] text-stone-300 hover:text-white font-bold rounded-lg transition-all border border-[#3A312B] active:scale-90"
                          aria-label="Decrease item quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-extrabold text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartId, 1)}
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-[#E65F2B] hover:bg-[#D14F1D] active:bg-[#B83E12] text-white font-bold rounded-lg transition-all shadow-md shadow-[#E65F2B]/20 active:scale-90"
                          aria-label="Increase item quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-stone-400 block font-light">Subtotal</span>
                        <span className="text-sm font-black text-[#E65F2B] font-mono">
                          ${item.itemTotalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delivery & Customer Info Form */}
          {cartItems.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-[#3A312B]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D4A373] uppercase tracking-wider block">
                  {orderType === 'delivery' ? 'Delivery Details & Address' : 'Self Pickup Details'}
                </span>
                <span className="text-[11px] text-stone-400">
                  {orderType === 'delivery' ? 'Est. ~25 mins delivery' : 'Ready at 742 Market St'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-300 block mb-1 font-semibold">Full Name *</label>
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
                    <label className="text-stone-300 block mb-1 font-semibold">Phone Number *</label>
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
                      <label className="text-stone-300 block mb-1 font-semibold">Street Address *</label>
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
                        <label className="text-stone-300 block mb-1">Apt / Unit # (Optional)</label>
                        <input
                          type="text"
                          value={aptUnit}
                          onChange={(e) => setAptUnit(e.target.value)}
                          placeholder="e.g. Apt 4B"
                          className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2.5 rounded-xl outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-stone-300 block mb-1">Gate Code / Notes</label>
                        <input
                          type="text"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="e.g. #4021 / Ring bell"
                          className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2.5 rounded-xl outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-[#D4A373] block mb-1 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Estimated Collection Time *
                      </label>
                      <select
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full bg-[#2D2521] border border-[#D4A373]/50 focus:border-[#E65F2B] text-white p-2.5 rounded-xl outline-none font-medium cursor-pointer"
                      >
                        <option value="ASAP (~10-15 mins)">⚡ ASAP (~10-15 mins)</option>
                        <option value="In 20 minutes">🕒 In 20 minutes</option>
                        <option value="In 30 minutes">🕒 In 30 minutes</option>
                        <option value="In 45 minutes">🕒 In 45 minutes</option>
                        <option value="In 1 hour">🕒 In 1 hour</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-stone-300 block mb-1">Barista Pickup Notes (Optional)</label>
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="e.g. Extra hot, double cupped, holding for pickup"
                        className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2.5 rounded-xl outline-none transition-colors"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Promo Code Box */}
              <div className="space-y-1.5">
                <label className="text-stone-300 text-xs block">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Try 'CRAVE20'"
                    className="flex-1 bg-[#2D2521] border border-[#3A312B] text-white text-xs p-2.5 rounded-xl outline-none uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-[#3A312B] hover:bg-[#D4A373] text-[#D4A373] hover:text-[#1F1A17] font-bold text-xs px-3 py-2.5 rounded-xl transition-all"
                  >
                    Apply
                  </button>
                </div>

                {appliedPromo && (
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Promo code {appliedPromo.code} applied ({appliedPromo.percent}% OFF)!
                  </p>
                )}

                {promoError && (
                  <p className="text-xs text-rose-400 font-medium">{promoError}</p>
                )}
              </div>

              {/* Tip Selection */}
              <div className="space-y-1.5">
                <label className="text-stone-300 text-xs block">Show Love to Your Barista & Driver Tip</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPercent(pct)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        tipPercent === pct
                          ? 'bg-[#E65F2B] text-white border-[#E65F2B]'
                          : 'bg-[#2D2521] border-[#3A312B] text-stone-400'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Calculation Breakdown */}
              <div className="bg-[#15110F] p-3 rounded-2xl border border-[#3A312B] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Promo Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-400">
                  <span>Estimated Tax (8.25%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-stone-400">
                  <span>
                    Delivery Fee {deliveryFee === 0 && subtotal > 25 ? '(Free >$25)' : ''}
                  </span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-stone-400">
                  <span>Barista & Courier Tip</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-[#3A312B] flex justify-between text-white font-bold text-sm">
                  <span>Total Due</span>
                  <span className="text-[#E65F2B]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        {/* Drawer Footer Checkout Button */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-[#15110F] border-t border-[#3A312B]">
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between bg-[#E65F2B] hover:bg-[#D14F1D] disabled:bg-stone-700 text-white font-bold text-sm px-6 py-4 rounded-2xl shadow-xl shadow-[#E65F2B]/30 transition-all transform active:scale-95"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Place Order'}</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-base">${grandTotal.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
