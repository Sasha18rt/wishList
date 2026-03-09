// types/wishlist.ts
export interface Wish {
  _id: string;
  name: string;
  description: string;
  image_url: string | null;
  image_public_id: string | null;
  product_url: string;
  price: string;
  currency: string | null;
  added_at: string;
  isReserved?: boolean;
  reservedBy?: string;
  deleted?: boolean;
}

export interface Reservation {
  wishlist_id: string;
  wish_id: string;
  user_id: string;
  reserved_at: string;
}

export interface WishlistUser {
  _id: string;
  name: string;
  email: string;
  nickname?: string;
  image?: string | null;
}

export interface WishlistData {
  _id: string;
  title: string;
  description: string;
  theme: string;
  user_id: WishlistUser;
  wishes: Wish[];
  reservations?: Reservation[];
  visibility?: "public" | "private";
  createdAt?: string;
  updatedAt?: string;
}