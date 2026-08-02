import React, { useState } from 'react';
import { MenuItem, CartItem } from '../types';
import { X, Plus, Minus, Check, Sparkles, Coffee, Flame } from 'lucide-react';

interface CustomizationModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(
    item.sizes && item.sizes.length > 0 ? item.sizes[0].name : 'Regular'
  );
  const [selectedTemp, setSelectedTemp] = useState(
    item.temperatureOptions && item.temperatureOptions.length > 0
      ? item.temperatureOptions[0]
      : 'Hot'
  );
  const [selectedMilk, setSelectedMilk] = useState(
    item.milkOptions && item.milkOptions.length > 0 ? item.milkOptions[0] : undefined
  );
  const [selectedSweetness, setSelectedSweetness] = useState(
    item.sweetnessLevels && item.sweetnessLevels.length > 0 ? item.sweetnessLevels[0] : undefined
  );
  const [selectedSpice, setSelectedSpice] = useState(
    item.spiceLevels && item.spiceLevels.length > 0 ? item.spiceLevels[0] : undefined
  );
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Calculate size offset
  const currentSizeObj = item.sizes?.find((s) => s.name === selectedSize);
  const sizeOffset = currentSizeObj ? currentSizeObj.priceOffset : 0;

  // Calculate extras cost
  const extrasCost = selectedExtras.reduce((sum, extraName) => {
    const extraObj = item.extras?.find((e) => e.name === extraName);
    return sum + (extraObj ? extraObj.price : 0);
  }, 0);

  const unitPrice = item.price + sizeOffset + extrasCost;
  const totalPrice = unitPrice * quantity;

  const toggleExtra = (extraName: string) => {
    if (selectedExtras.includes(extraName)) {
      setSelectedExtras(selectedExtras.filter((e) => e !== extraName));
    } else {
      setSelectedExtras([...selectedExtras, extraName]);
    }
  };

  const handleAdd = () => {
    const cartItem: CartItem = {
      cartId: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity,
      selectedSize,
      selectedMilk,
      selectedSweetness,
      selectedTemp: item.temperatureOptions ? selectedTemp : undefined,
      selectedSpice,
      selectedExtras,
      itemTotalPrice: totalPrice,
      specialInstructions: specialInstructions.trim() || undefined,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1F1A17] border border-[#3A312B] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header Image */}
        <div className="relative h-48 w-full overflow-hidden bg-[#2D2521]">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F1A17] via-transparent to-transparent opacity-90" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-[#1F1A17]/80 hover:bg-[#1F1A17] text-stone-300 hover:text-white p-2 rounded-full border border-[#3A312B] transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[10px] text-[#D4A373] font-bold uppercase tracking-wider">
              {item.category.toUpperCase()}
            </span>
            <h2 className="text-xl font-bold text-white leading-tight">{item.name}</h2>
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Description */}
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">{item.description}</p>

          {/* Temperature Choice (Hot / Iced) */}
          {item.temperatureOptions && item.temperatureOptions.length > 1 && (
            <div className="space-y-2">
              <label className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-[#E65F2B]" />
                <span>Temperature</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {item.temperatureOptions.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setSelectedTemp(temp)}
                    className={`py-2.5 px-3 rounded-2xl font-semibold text-xs border transition-all ${
                      selectedTemp === temp
                        ? 'bg-[#E65F2B] text-white border-[#E65F2B] shadow-md'
                        : 'bg-[#2D2521] border-[#3A312B] text-stone-300 hover:text-white'
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Choice */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Select Size</span>
                <span className="text-stone-400 font-normal lowercase">Required</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {item.sizes.map((size) => {
                  const isSelected = selectedSize === size.name;
                  return (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-[#E65F2B] text-white border-[#E65F2B] shadow-md'
                          : 'bg-[#2D2521] border-[#3A312B] text-stone-300 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs">{size.name}</div>
                      {size.priceOffset > 0 && (
                        <div className="text-[10px] opacity-80">+${size.priceOffset.toFixed(2)}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Milk Options */}
          {item.milkOptions && item.milkOptions.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Milk Option</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {item.milkOptions.map((milk) => {
                  const isSelected = selectedMilk === milk;
                  return (
                    <button
                      key={milk}
                      onClick={() => setSelectedMilk(milk)}
                      className={`p-2.5 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-[#2D2521] border-[#D4A373] text-[#D4A373]'
                          : 'bg-[#2D2521] border-[#3A312B] text-stone-400 hover:text-white'
                      }`}
                    >
                      <span>{milk}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D4A373]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sweetness Levels */}
          {item.sweetnessLevels && item.sweetnessLevels.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold text-white text-xs uppercase tracking-wider">
                Sweetness Level
              </label>
              <div className="flex flex-wrap gap-2">
                {item.sweetnessLevels.map((sweet) => {
                  const isSelected = selectedSweetness === sweet;
                  return (
                    <button
                      key={sweet}
                      onClick={() => setSelectedSweetness(sweet)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#E65F2B]/20 border-[#E65F2B] text-[#E65F2B]'
                          : 'bg-[#2D2521] border-[#3A312B] text-stone-400'
                      }`}
                    >
                      {sweet}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spice Level Choice */}
          {item.spiceLevels && item.spiceLevels.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Spice & Heat Preference</span>
              </label>
              <div className="flex flex-col gap-2">
                {item.spiceLevels.map((spice) => {
                  const isSelected = selectedSpice === spice;
                  return (
                    <button
                      key={spice}
                      onClick={() => setSelectedSpice(spice)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-[#E65F2B]/20 border-[#E65F2B] text-white shadow-sm'
                          : 'bg-[#2D2521] border-[#3A312B] text-stone-300 hover:text-white'
                      }`}
                    >
                      <span>{spice}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#E65F2B]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extras & Toppings */}
          {item.extras && item.extras.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Add Toppings & Shots</span>
                <span className="text-[#D4A373] text-[11px] font-normal">Optional</span>
              </label>
              <div className="space-y-2">
                {item.extras.map((extra) => {
                  const isChecked = selectedExtras.includes(extra.name);
                  return (
                    <button
                      key={extra.name}
                      onClick={() => toggleExtra(extra.name)}
                      className={`w-full p-3 rounded-2xl border text-xs font-medium flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-[#2D2521] border-[#E65F2B] text-white'
                          : 'bg-[#2D2521] border-[#3A312B] text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? 'bg-[#E65F2B] border-[#E65F2B] text-white'
                              : 'border-stone-500'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{extra.name}</span>
                      </div>
                      <span className="text-[#D4A373] font-mono">+${extra.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <label className="font-bold text-white text-xs uppercase tracking-wider">
              Special Instructions
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra hot, light ice, allergy notes..."
              className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white text-xs rounded-xl p-3 outline-none"
            />
          </div>
        </div>

        {/* Modal Bottom Bar: Quantity & Add Button */}
        <div className="p-4 border-t border-[#3A312B] bg-[#1A1513] flex items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center bg-[#2D2521] border border-[#3A312B] rounded-2xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-stone-400 hover:text-white transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-white font-mono text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-stone-400 hover:text-white transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Bag Button */}
          <button
            onClick={handleAdd}
            className="flex-1 flex items-center justify-between bg-[#E65F2B] hover:bg-[#D14F1D] text-white font-bold text-sm px-5 py-3.5 rounded-2xl shadow-xl shadow-[#E65F2B]/30 transition-all transform active:scale-95"
          >
            <span>Add to Bag</span>
            <span className="font-mono text-base">${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
