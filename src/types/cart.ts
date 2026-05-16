export interface CartItem {
  id: string;
  productId: number;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions: Record<string, number>;
  optionLabels: Record<string, string>;
  urlKey: string;
  typeId: string;
}

export interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  toastMessage: { productName: string; image?: string } | null;
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "id"> }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_DRAWER_OPEN"; payload: boolean }
  | { type: "SHOW_TOAST"; payload: { productName: string; image?: string } }
  | { type: "HIDE_TOAST" }
  | { type: "LOAD_CART"; payload: CartItem[] };
