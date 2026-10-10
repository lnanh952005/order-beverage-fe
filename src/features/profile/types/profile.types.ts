export interface Address {
  id: number;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}
