import { create } from 'zustand';

type ViewType = 'decouverte' | 'panier' | 'commandes' | 'dashboard' | 'admin' | 'login' | 'register';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  unit: string;
  supermarketName: string;
  supermarketId: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string; // CLIENT | SUPERMARCHE_ADMIN | SUPER_ADMIN
  supermarcheId?: string | null;
}

interface AppStore {
  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Cart
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Filters
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedCommune: string | null;
  setSelectedCommune: (commune: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Auth
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;

  // Supermarket detail
  selectedSupermarketId: string | null;
  setSelectedSupermarketId: (id: string | null) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Navigation
  currentView: 'decouverte',
  setCurrentView: (view) => set({ currentView: view }),

  // Cart
  cartItems: [],
  addToCart: (item) =>
    set((state) => {
      const existing = state.cartItems.find(
        (ci) => ci.productId === item.productId
      );
      if (existing) {
        return {
          cartItems: state.cartItems.map((ci) =>
            ci.productId === item.productId
              ? { ...ci, quantity: ci.quantity + item.quantity }
              : ci
          ),
        };
      }
      return { cartItems: [...state.cartItems, item] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cartItems: state.cartItems.filter((ci) => ci.productId !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          cartItems: state.cartItems.filter((ci) => ci.productId !== productId),
        };
      }
      return {
        cartItems: state.cartItems.map((ci) =>
          ci.productId === productId ? { ...ci, quantity } : ci
        ),
      };
    }),
  clearCart: () => set({ cartItems: [] }),
  cartTotal: () =>
    get().cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
  cartCount: () =>
    get().cartItems.reduce((sum, item) => sum + item.quantity, 0),

  // Filters
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  selectedCommune: null,
  setSelectedCommune: (commune) => set({ selectedCommune: commune }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Auth
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  isAuthenticated: () => get().currentUser !== null,
  hasRole: (role) => get().currentUser?.role === role,

  // Supermarket detail
  selectedSupermarketId: null,
  setSelectedSupermarketId: (id) => set({ selectedSupermarketId: id }),
}));

export type { ViewType, CartItem, CurrentUser, AppStore };
