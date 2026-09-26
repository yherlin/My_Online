/**
 * Service: Images (Mock Firebase Storage Provider)
 * Prepared for future drop-in replacement with Firebase Storage:
 * - uploadBytes(ref(storage, path), file)
 * - getDownloadURL(ref(storage, path))
 * - deleteObject(ref(storage, path))
 */

import { CloudImage } from '../types';
import { INITIAL_IMAGES, STORAGE_KEYS } from '../data/mockData';

function getStoredImages(): CloudImage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IMAGES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading images from storage', e);
  }
  localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(INITIAL_IMAGES));
  return INITIAL_IMAGES;
}

function saveImages(images: CloudImage[]): void {
  localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
}

export const imageService = {
  /**
   * Fetch all stored cloud images
   */
  async getImages(): Promise<CloudImage[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return getStoredImages();
  },

  /**
   * Simulates uploading an image to Cloud Storage
   */
  async uploadImage(
    file: { name: string; size: number; type: string; base64Url: string },
    meta?: { productId?: string; productName?: string; uploadedBy?: string }
  ): Promise<CloudImage> {
    // Simulate upload delay (e.g., cloud transfer)
    await new Promise((resolve) => setTimeout(resolve, 400));
    const images = getStoredImages();

    // Format file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = Number(sizeInMB) >= 0.1 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;

    const newImage: CloudImage = {
      id: `img-${Date.now()}`,
      name: file.name,
      url: file.base64Url,
      size: sizeStr,
      dimensions: '1920x1080',
      type: file.type || 'image/jpeg',
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: meta?.uploadedBy || 'Usuario Actual',
      productId: meta?.productId,
      productName: meta?.productName,
    };

    const updated = [newImage, ...images];
    saveImages(updated);
    return newImage;
  },

  /**
   * Simulates deleting an image from Cloud Storage
   */
  async deleteImage(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const images = getStoredImages();
    const filtered = images.filter((img) => img.id !== id);
    if (filtered.length === images.length) return false;

    saveImages(filtered);
    return true;
  },
};
