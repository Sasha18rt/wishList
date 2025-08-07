// types/wishlist.ts
export interface Wish {
  _id: string;
  name: string;
  description?: string;
  image_url?: string;
  product_url?: string;
  price?: string;
  added_at: string; // або Date, якщо конвертуєш
  isReserved?: boolean;
  reservedBy?: string;
  deleted?: boolean; // ← зробили НЕОБОВ’ЯЗКОВИМ
}

export interface Reservation {
  wishlist_id: string;
  wish_id: string;
  user_id: string;
  reserved_at: string;
}

export interface WishlistData {
  _id: string;
  title: string;
  theme: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    nickname: string;
    image?: string;
  };
  wishes: Wish[];
  reservations?: Reservation[];
  visibility?: string;
  created_at?: string;
}
