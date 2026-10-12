// Routes
export { profileRoutes } from './routes';

// Hooks
export {
  useProfile,
  useUpdateProfile,
  useUnlinkGoogle,
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from './hooks';

// Components (Shared by other features if needed, e.g. orders)
export { AddressCard, ProfileNavTabs } from './components';

// Types
export type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
  UpdateProfileInput,
  UserProfile,
  User,
} from './types/profile.types';
