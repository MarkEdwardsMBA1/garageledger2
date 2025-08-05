import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase/config';
import { authService } from './AuthService';
import * as FileSystem from 'expo-file-system';

/**
 * Image Upload Service
 * Handles uploading images to Firebase Storage and managing vehicle photos
 */
export class ImageUploadService {
  private readonly STORAGE_PATH = 'vehicle-photos';

  /**
   * Upload vehicle photo to Firebase Storage
   * @param imageUri - Local image URI from device
   * @param vehicleId - Vehicle ID for organizing photos
   * @returns Firebase Storage download URL
   */
  async uploadVehiclePhoto(imageUri: string, vehicleId: string): Promise<string> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to upload photos');
      }
      

      // Convert image URI to blob using FileSystem for better React Native compatibility
      console.log('Fetching image data from:', imageUri);
      
      let blob: Blob;
      
      if (imageUri.startsWith('file://') || imageUri.startsWith('content://') || imageUri.startsWith('ph://')) {
        // Use FileSystem for local URIs (more reliable in React Native)
        try {
          // Add timeout to file operations
          const fileInfoPromise = FileSystem.getInfoAsync(imageUri);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('File operation timeout')), 10000)
          );
          
          const fileInfo = await Promise.race([fileInfoPromise, timeoutPromise]) as FileSystem.FileInfo;
          
          if (!fileInfo.exists) {
            throw new Error('Image file not found on device');
          }
          
          console.log('File exists, size:', fileInfo.size, 'bytes');
          
          // Read file as base64 with timeout
          const readPromise = FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const readTimeoutPromise = new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('File read timeout')), 15000)
          );
          
          const base64 = await Promise.race([readPromise, readTimeoutPromise]);
          
          // Convert base64 to blob
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: 'image/jpeg' });
          
          console.log('Created blob from FileSystem, size:', blob.size, 'bytes');
        } catch (fsError) {
          console.warn('FileSystem approach failed:', fsError.message);
          
          // If file doesn't exist, don't try fetch - it will also fail
          if (fsError.message?.includes('not found') || fsError.message?.includes('does not exist')) {
            throw new Error('Image file not found on device');
          }
          
          // For other FileSystem errors, try fetch as fallback
          console.log('Falling back to fetch method');
          try {
            const response = await fetch(imageUri);
            if (!response.ok) {
              throw new Error(`Failed to fetch image data: ${response.status} ${response.statusText}`);
            }
            blob = await response.blob();
          } catch (fetchError: any) {
            // If fetch also fails with network error, it's likely a file access issue
            if (fetchError.message?.includes('Network request failed')) {
              throw new Error('Image file not accessible or missing from device');
            }
            throw fetchError;
          }
        }
      } else {
        // Use fetch for HTTP URLs
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image data: ${response.status} ${response.statusText}`);
        }
        blob = await response.blob();
      }
      
      console.log('Final blob size:', blob.size, 'bytes, type:', blob.type);

      // Create storage reference with user ID and vehicle ID for organization
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
      const storagePath = `${this.STORAGE_PATH}/${currentUser.uid}/${vehicleId}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      console.log('Uploading to Firebase Storage path:', storagePath);
      console.log('User authenticated:', !!currentUser, 'UID:', currentUser.uid);
      
      // Upload image with metadata
      const metadata = {
        contentType: blob.type || 'image/jpeg',
        customMetadata: {
          userId: currentUser.uid,
          vehicleId: vehicleId,
          uploadedAt: new Date().toISOString()
        }
      };
      
      const uploadResult = await uploadBytes(storageRef, blob, metadata);
      console.log('Upload successful, getting download URL...');
      
      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Image uploaded successfully:', downloadURL);
      
      return downloadURL;
    } catch (error: any) {
      console.error('Failed to upload vehicle photo:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('Permission denied: Please check Firebase Storage security rules');
      } else if (error.code === 'storage/unknown') {
        throw new Error('Storage error: Please check your internet connection and try again');
      } else if (error.message?.includes('Network request failed')) {
        throw new Error('Image file not accessible - may have been cleaned up by system');
      } else if (error.message?.includes('not found') || error.message?.includes('not accessible') || error.message?.includes('missing from device')) {
        throw new Error('Image file not found on device');
      } else if (error.message?.includes('File operation timeout') || error.message?.includes('File read timeout')) {
        throw new Error('File operation timed out - file may be too large or corrupted');
      } else {
        throw new Error(`Image upload failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Delete vehicle photo from Firebase Storage
   * @param photoUrl - Firebase Storage download URL
   */
  async deleteVehiclePhoto(photoUrl: string): Promise<void> {
    try {
      if (!photoUrl || !photoUrl.includes('firebase')) {
        // Skip deletion for non-Firebase URLs (local URIs)
        return;
      }

      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to delete photos');
      }

      // Extract storage path from download URL
      const url = new URL(photoUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
      if (!pathMatch) {
        throw new Error('Invalid Firebase Storage URL');
      }

      const storagePath = decodeURIComponent(pathMatch[1]);
      const storageRef = ref(storage, storagePath);

      // Verify the photo belongs to the current user
      if (!storagePath.includes(`/${currentUser.uid}/`)) {
        throw new Error('Unauthorized: Cannot delete another user\'s photo');
      }

      await deleteObject(storageRef);
      console.log('Photo deleted from Firebase Storage:', storagePath);
    } catch (error) {
      console.error('Failed to delete vehicle photo:', error);
      // Don't throw error for deletion failures to avoid blocking other operations
    }
  }

  /**
   * Check if a URL is a Firebase Storage URL
   * @param url - URL to check
   * @returns true if it's a Firebase Storage URL
   */
  isFirebaseStorageUrl(url: string): boolean {
    return url.includes('firebasestorage.googleapis.com') || url.includes('firebase');
  }

  /**
   * Migrate local URI to Firebase Storage
   * Used for existing vehicles with local photo URIs
   * @param localUri - Local device URI
   * @param vehicleId - Vehicle ID
   * @returns Firebase Storage download URL or null if migration fails
   */
  async migrateLocalPhotoToFirebase(localUri: string, vehicleId: string): Promise<string | null> {
    try {
      // Skip if already a Firebase URL
      if (this.isFirebaseStorageUrl(localUri)) {
        return localUri;
      }

      // Skip if local URI is invalid or missing
      if (!localUri || (!localUri.startsWith('file://') && !localUri.startsWith('content://') && !localUri.startsWith('ph://'))) {
        console.log('Skipping migration for invalid URI format:', localUri);
        return null;
      }

      // Check if file exists before attempting upload
      try {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (!fileInfo.exists) {
          console.log('Local photo file no longer exists, cannot migrate:', localUri);
          return null; // File was cleaned up by system, migration not possible
        }
      } catch (fileCheckError) {
        console.log('Cannot access local photo file for migration:', localUri);
        return null;
      }

      // Try to upload the local photo
      console.log('Attempting to migrate photo:', localUri);
      return await this.uploadVehiclePhoto(localUri, vehicleId);
    } catch (error: any) {
      console.warn('Failed to migrate local photo to Firebase:', error.message);
      
      // Don't throw errors for migration - it's a background operation
      // Just return null and let the caller handle it gracefully
      return null;
    }
  }
}

// Singleton service instance
export const imageUploadService = new ImageUploadService();