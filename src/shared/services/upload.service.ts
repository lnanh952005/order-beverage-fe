import { httpClient } from '@/shared/api/http-client';

export interface UploadResponse {
  url: string;
  publicId?: string;
}

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post<UploadResponse>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.url;
  },
};
