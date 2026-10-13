import { create } from 'zustand';
import type { FulfillmentType, PaymentMethod } from '../types/orders.types';

export interface CheckoutDraftState {
  fulfillmentType: FulfillmentType;
  addressId?: number;
  paymentMethod: PaymentMethod;
  voucherCode: string;
  note: string;
  setFulfillmentType: (type: FulfillmentType) => void;
  setAddressId: (id?: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setVoucherCode: (code: string) => void;
  setNote: (note: string) => void;
  resetDraft: () => void;
}

export const useCheckoutStore = create<CheckoutDraftState>((set) => ({
  fulfillmentType: 'delivery',
  addressId: undefined,
  paymentMethod: 'cod',
  voucherCode: '',
  note: '',

  setFulfillmentType: (fulfillmentType) => set({ fulfillmentType }),
  setAddressId: (addressId) => set({ addressId }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setVoucherCode: (voucherCode) => set({ voucherCode }),
  setNote: (note) => set({ note }),
  resetDraft: () =>
    set({
      fulfillmentType: 'delivery',
      addressId: undefined,
      paymentMethod: 'cod',
      voucherCode: '',
      note: '',
    }),
}));
