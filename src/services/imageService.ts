import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

const IMAGE_DIR = `${FileSystem.documentDirectory}whereat/images`;
const MAX_IMAGE_WIDTH = 960;
const IMAGE_COMPRESS_QUALITY = 0.62;

const ensureDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
};

const optimizeImageToJpeg = async (sourceUri: string, targetUri: string) => {
  const optimized = await manipulateAsync(
    sourceUri,
    [{ resize: { width: MAX_IMAGE_WIDTH } }],
    { compress: IMAGE_COMPRESS_QUALITY, format: SaveFormat.JPEG }
  );

  const existing = await FileSystem.getInfoAsync(targetUri);
  if (existing.exists) {
    await FileSystem.deleteAsync(targetUri, { idempotent: true });
  }
  await FileSystem.copyAsync({ from: optimized.uri, to: targetUri });
  if (optimized.uri !== sourceUri) {
    await FileSystem.deleteAsync(optimized.uri, { idempotent: true });
  }
  return targetUri;
};

export const saveImageForItem = async (itemId: string, tempUri: string) => {
  await ensureDir();
  const targetUri = `${IMAGE_DIR}/${itemId}.jpg`;
  try {
    return await optimizeImageToJpeg(tempUri, targetUri);
  } catch {
    const existing = await FileSystem.getInfoAsync(targetUri);
    if (existing.exists) {
      await FileSystem.deleteAsync(targetUri, { idempotent: true });
    }
    await FileSystem.copyAsync({ from: tempUri, to: targetUri });
    return targetUri;
  }
};

export const saveRemoteImageForItem = async (itemId: string, remoteUri: string) => {
  await ensureDir();
  const targetUri = `${IMAGE_DIR}/${itemId}.jpg`;
  const tempDownloadUri = `${IMAGE_DIR}/${itemId}.download`;
  try {
    const existing = await FileSystem.getInfoAsync(tempDownloadUri);
    if (existing.exists) {
      await FileSystem.deleteAsync(tempDownloadUri, { idempotent: true });
    }
    await FileSystem.downloadAsync(remoteUri, tempDownloadUri);
    return await optimizeImageToJpeg(tempDownloadUri, targetUri);
  } finally {
    await FileSystem.deleteAsync(tempDownloadUri, { idempotent: true });
  }
};

export const deleteImageForItem = async (imageUri?: string) => {
  if (!imageUri) return;
  await FileSystem.deleteAsync(imageUri, { idempotent: true });
};
