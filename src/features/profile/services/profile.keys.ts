export const profileKeys = {
  all: ['profile'] as const,
  user: () => [...profileKeys.all, 'user'] as const,
  addresses: () => [...profileKeys.all, 'addresses'] as const,
};
