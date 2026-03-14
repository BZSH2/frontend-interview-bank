const USER_KEY_STORAGE_KEY = 'frontend-interview-bank:user-key';

export function getOrCreateUserKey() {
  const cached = uni.getStorageSync(USER_KEY_STORAGE_KEY);
  if (typeof cached === 'string' && cached) {
    return cached;
  }

  const generated = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  uni.setStorageSync(USER_KEY_STORAGE_KEY, generated);
  return generated;
}
