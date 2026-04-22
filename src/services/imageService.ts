import * as FileSystem from "expo-file-system/legacy";

const IMAGE_DIR = `${FileSystem.documentDirectory}whereat/images`;

const ensureDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
};

export const saveImageForItem = async (itemId: string, tempUri: string) => {
  await ensureDir();
  const targetUri = `${IMAGE_DIR}/${itemId}.jpg`;
  const existing = await FileSystem.getInfoAsync(targetUri);
  if (existing.exists) {
    await FileSystem.deleteAsync(targetUri, { idempotent: true });
  }
  await FileSystem.copyAsync({ from: tempUri, to: targetUri });
  return targetUri;
};

export const saveRemoteImageForItem = async (itemId: string, remoteUri: string) => {
  await ensureDir();
  const targetUri = `${IMAGE_DIR}/${itemId}.jpg`;
  const existing = await FileSystem.getInfoAsync(targetUri);
  if (existing.exists) {
    await FileSystem.deleteAsync(targetUri, { idempotent: true });
  }
  await FileSystem.downloadAsync(remoteUri, targetUri);
  return targetUri;
};

export const deleteImageForItem = async (imageUri?: string) => {
  if (!imageUri) return;
  await FileSystem.deleteAsync(imageUri, { idempotent: true });
};
