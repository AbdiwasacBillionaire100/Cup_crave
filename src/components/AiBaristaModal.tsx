import React, { useState } from 'react';
import { MenuItem } from '../types';
import { Sparkles, X, Coffee, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface AiBaristaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecommendedItem: (item: MenuItem) => void;
}

export const AiBaristaModal: React.FC<AiBaristaModalProps> = ({
  isOpen,
  onClose,
  onSelectRecommendedItem,
}) => {
  if (!isOpen) return null;

  const [mood, setMood] = useState('Energetic & Morning Boost');
  const [preference, setPreference] = useState('Creamy & Sweet Latte');
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [dietary, setDietary] = useState('Oat Milk / Dairy-Free');

  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    item: MenuItem;
    headline: string;
    reasoning: string;
  } | null>(null);

  const MOODS = [
    'Energetic & Morning Boost',
    'Cozy & Relaxing Afternoon',
    'Sweet Treat Craving',
    'Focus & Work Mode',
  ];

  const PREFERENCES = [
    'Creamy & Sweet Latte',
    'Bold & Dark Espresso',
    'Cold & Refreshing Nitro',
    'Matcha / Herbal Tea',
    'Flaky Bakery & Pastry',
  ];

  const handleConsultBarista = async () => {
    setIsLoading(true);
    setRecommendation(null);

    try {
      const response = await fetch('/api/ai-barista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, preference, timeOfDay, dietary }),
      });

      const data = await response.json();
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
      }
    } catch (err) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1F1A17] border border-[#3A312B] rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 bg-[#15110F] border-b border-[#3A312B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#2D2521] border border-[#D4A373]/40 text-[#D4A373] rounded-xl">
              <Sparkles className="w-5 h-5 text-[#E65F2B]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ask CraveCups AI Barista</h2>
              <p className="text-xs text-[#D4A373]">Custom drink matching tailored to your vibe</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-full bg-[#2D2521] border border-[#3A312B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {!recommendation ? (
            <>
              {/* Mood Selection */}
              <div className="space-y-2">
                <label className="font-bold text-white text-xs uppercase tracking-wider block">
                  What's your current vibe?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                        mood === m
                          ? 'bg-[#E65F2B] text-white border-[#E65F2B]'
                          : 'bg-[#2D2521] border-[#3A312B] text-stone-300 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flavor Preference */}
              <div className="space-y-2">
                <label className="font-bold text-white text-xs uppercase tracking-wider block">
                  Flavor or Drink Style Preference
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREFERENCES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPreference(p)}
                      className={`px-3 py-2 rounded-xl border font-medium transition-all ${
                        preference === p
                          ? 'bg-[#2D2521] border-[#D4A373] text-[#D4A373]'
                          : 'bg-[#2D2521] border-[#3A312B] text-stone-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary / Milk preference */}
              <div className="space-y-1.5">
                <label className="font-bold text-white text-xs uppercase tracking-wider block">
                  Milk or Dietary Request
                </label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="e.g. Oat Milk, Sugar Free, Extra Espresso..."
                  className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-3 rounded-xl outline-none"
                />
              </div>

              {/* Consult Button */}
              <button
                onClick={handleConsultBarista}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#E65F2B] hover:bg-[#D14F1D] disabled:bg-stone-700 text-white font-bold text-sm py-3.5 rounded-2xl shadow-xl shadow-[#E65F2B]/30 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Barista is thinking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Get Barista Match</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Recommendation Result View */
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1 bg-[#D4A373]/20 text-[#D4A373] px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border border-[#D4A373]/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E65F2B]" />
                  <span>Master Barista Choice</span>
                </span>
                <h3 className="text-lg font-bold text-white">{recommendation.headline}</h3>
              </div>

              {/* Recommended Menu Item Card */}
              <div className="bg-[#2D2521] border border-[#D4A373]/50 rounded-2xl overflow-hidden p-3 flex gap-3">
                <img
                  src={recommendation.item.image}
                  alt={recommendation.item.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-xl object-cover bg-[#1F1A17]"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{recommendation.item.name}</h4>
                    <p className="text-stone-400 text-[11px] line-clamp-2 mt-0.5">
                      {recommendation.item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#E65F2B] font-bold text-sm">
                      ${recommendation.item.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        onSelectRecommendedItem(recommendation.item);
                        onClose();
                      }}
                      className="bg-[#E65F2B] hover:bg-[#D14F1D] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow"
                    >
                      <span>Order This Item</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Barista Reasoning Box */}
              <div className="bg-[#15110F] p-3.5 rounded-2xl border border-[#3A312B] space-y-1 text-stone-300 italic leading-relaxed">
                <p className="text-stone-400 text-[11px] not-italic font-bold">Barista Note:</p>
                <p>"{recommendation.reasoning}"</p>
              </div>

              {/* Reset Recommendation Button */}
              <button
                onClick={() => setRecommendation(null)}
                className="w-full text-center text-stone-400 hover:text-white py-2 font-semibold transition-colors"
              >
                Try Different Vibe Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
