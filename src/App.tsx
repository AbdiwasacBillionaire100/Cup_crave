import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, CartItem, CategoryId, Category, Order } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryFilter } from './components/CategoryFilter';
import { SearchBar } from './components/SearchBar';
import { MenuGrid } from './components/MenuGrid';
import { CustomizationModal } from './components/CustomizationModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AiBaristaModal } from './components/AiBaristaModal';
import { Footer } from './components/Footer';
import { MENU_ITEMS as FALLBACK_MENU, CATEGORIES as FALLBACK_CATEGORIES } from './data/menuData';

export default function App() {
  // App States
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Cart & Modals
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cravecups_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAiBaristaOpen, setIsAiBaristaOpen] = useState<boolean>(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState<boolean>(false);

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('cravecups_cart', JSON.stringify(cartItems));
    } catch {
      // Ignore quota errors
    }
  }, [cartItems]);

  // Fetch Categories & Menu Items from Express Backend API
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (isMounted && catData.success && catData.data) {
          setCategories(catData.data);
        }

        // Fetch Menu Items
        const menuRes = await fetch('/api/menu');
        const menuData = await menuRes.json();
        if (isMounted && menuData.success && menuData.data) {
          setMenuItems(menuData.data);
        } else if (isMounted) {
          setMenuItems(FALLBACK_MENU);
        }
      } catch (err) {
        if (isMounted) {
          setMenuItems(FALLBACK_MENU);
        }
      } finally {
        if (isMounted) {
          // Slight delay to showcase clean placeholder transition on load
          setTimeout(() => setIsLoading(false), 300);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute category item counts
  const categoryItemCounts = useMemo(() => {
    const counts: Record<string, number> = { all: menuItems.length };
    menuItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  // Filter menu items by category, search query, and tags
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category Filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // Quick Tag Filter
      if (selectedTag === 'popular' && !item.isPopular) return false;
      if (selectedTag === 'new' && !item.isNew) return false;
      if (selectedTag === 'under6' && item.price >= 6) return false;

      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, selectedTag]);

  // Cart Operations
  const handleAddToCart = (cartItem: CartItem) => {
    setCartItems((prev) => {
      // Check if identical cart item exists
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.menuItem.id === cartItem.menuItem.id &&
          ci.selectedSize === cartItem.selectedSize &&
          ci.selectedMilk === cartItem.selectedMilk &&
          ci.selectedSweetness === cartItem.selectedSweetness &&
          ci.selectedTemp === cartItem.selectedTemp &&
          JSON.stringify(ci.selectedExtras) === JSON.stringify(cartItem.selectedExtras)
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const current = updated[existingIdx];
        const newQty = current.quantity + cartItem.quantity;
        const unitPrice = current.itemTotalPrice / current.quantity;
        updated[existingIdx] = {
          ...current,
          quantity: newQty,
          itemTotalPrice: unitPrice * newQty,
        };
        return updated;
      }

      return [...prev, cartItem];
    });

    setIsCartOpen(true);
  };

  const handleQuickAdd = (item: MenuItem) => {
    const defaultCartItem: CartItem = {
      cartId: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity: 1,
      selectedSize: item.sizes && item.sizes.length > 0 ? item.sizes[0].name : 'Regular',
      selectedMilk: item.milkOptions && item.milkOptions.length > 0 ? item.milkOptions[0] : undefined,
      selectedSweetness: item.sweetnessLevels && item.sweetnessLevels.length > 0 ? item.sweetnessLevels[0] : undefined,
      selectedTemp: item.temperatureOptions ? item.temperatureOptions[0] : undefined,
      selectedExtras: [],
      itemTotalPrice: item.price,
    };

    handleAddToCart(defaultCartItem);
  };

  const handleUpdateCartQuantity = (cartId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((ci) => {
          if (ci.cartId === cartId) {
            const newQty = ci.quantity + delta;
            if (newQty <= 0) return null;
            const unitPrice = ci.itemTotalPrice / ci.quantity;
            return {
              ...ci,
              quantity: newQty,
              itemTotalPrice: unitPrice * newQty,
            };
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleScrollToMenu = () => {
    const el = document.getElementById('menu-grid') || document.getElementById('menu-placeholder-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1A17] text-[#F5EFEB] flex flex-col font-sans selection:bg-[#E65F2B] selection:text-white">
      {/* Sticky Header */}
      <Header
        cartItemCount={cartItems.reduce((sum, ci) => sum + ci.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAiBarista={() => setIsAiBaristaOpen(true)}
        orderType={orderType}
        onToggleOrderType={(type) => setOrderType(type)}
        activeOrder={activeOrder}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        onScrollToMenu={handleScrollToMenu}
        onSearchClick={handleScrollToMenu}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onExploreMenu={handleScrollToMenu}
          onOpenAiBarista={() => setIsAiBaristaOpen(true)}
        />

        {/* Category Filters Sticky Bar */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            handleScrollToMenu();
          }}
          categoryItemCounts={categoryItemCounts}
        />

        {/* Search Bar & Tag Filters */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          resultCount={filteredMenuItems.length}
        />

        {/* Menu Grid / Empty Placeholder Grid */}
        <MenuGrid
          items={filteredMenuItems}
          isLoading={isLoading}
          onSelectItem={(item) => setCustomizingItem(item)}
          onQuickAdd={handleQuickAdd}
          onResetFilters={() => {
            setSelectedCategory('all');
            setSearchQuery('');
            setSelectedTag(null);
          }}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Slide-over Drawers */}
      <CustomizationModal
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        orderType={orderType}
        onToggleOrderType={(type) => setOrderType(type)}
        onOrderSuccess={(newOrder) => {
          setActiveOrder(newOrder);
          setIsOrderTrackerOpen(true);
        }}
      />

      <OrderTrackerModal
        order={activeOrder}
        onClose={() => setIsOrderTrackerOpen(false)}
      />

      <AiBaristaModal
        isOpen={isAiBaristaOpen}
        onClose={() => setIsAiBaristaOpen(false)}
        onSelectRecommendedItem={(item) => setCustomizingItem(item)}
      />
    </div>
  );
}
