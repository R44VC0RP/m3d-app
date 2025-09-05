// Mandarin3D API Slicing Service Client Library

export interface SliceRequest {
  file_url?: string;
  callback_url: string;
  file_id?: string;
  file_name?: string; // Optional filename for URLs that don't contain filenames
  max_dimensions?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface SliceFormData {
  model_file: File;
  callback_url: string;
  file_id?: string;
  max_x?: number;
  max_y?: number;
  max_z?: number;
}

export interface SliceResponse {
  message: string;
  file_id: string;
  status: 'processing';
  original_format: string;
}

export interface SuccessCallback {
  file_id: string;
  status: 'success';
  mass_grams: number;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  processing_time: number;
  slicer_time: number;
  timestamp: number;
}

export interface ErrorCallback {
  file_id: string;
  status: 'error';
  error: string;
  dimensions?: {
    x: number;
    y: number;
    z: number;
  };
  processing_time: number;
  timestamp: number;
}

export type CallbackPayload = SuccessCallback | ErrorCallback;

export class Mandarin3DApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.MANDARIN3D_API_URL || 'https://m3d-api.sevalla.app') {
    console.log('Mandarin3D API URL:', baseUrl);
    this.baseUrl = baseUrl;
  }

  /**
   * Submit a 3D file for slicing via URL
   */
  async sliceFromUrl(request: SliceRequest): Promise<SliceResponse> {
    // For local development with self-signed certificates
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    };

    // If using Node.js 18+ and connecting to a local/dev server with self-signed cert
    if (this.baseUrl.includes('.local') || this.baseUrl.includes('localhost')) {
      // Note: In production, you should properly handle certificates
      if (typeof process !== 'undefined' && process.env.NODE_TLS_REJECT_UNAUTHORIZED !== undefined) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }
    }

    const response = await fetch(`${this.baseUrl}/api/slice`, fetchOptions);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails;
      
      try {
        errorDetails = await response.json();
        errorMessage = errorDetails.error || errorDetails.message || errorMessage;
      } catch (e) {
        // If response body is not JSON, try to get text
        try {
          const text = await response.text();
          if (text) errorMessage = `${errorMessage} - ${text}`;
        } catch (e2) {
          // Ignore if we can't read the body
        }
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).response = errorDetails;
      throw error;
    }

    return response.json();
  }

  /**
   * Submit a 3D file for slicing via file upload
   */
  async sliceFromFile(data: SliceFormData): Promise<SliceResponse> {
    const formData = new FormData();
    formData.append('model_file', data.model_file);
    formData.append('callback_url', data.callback_url);

    if (data.file_id) {
      formData.append('file_id', data.file_id);
    }

    if (data.max_x !== undefined) {
      formData.append('max_x', data.max_x.toString());
    }

    if (data.max_y !== undefined) {
      formData.append('max_y', data.max_y.toString());
    }

    if (data.max_z !== undefined) {
      formData.append('max_z', data.max_z.toString());
    }

    const response = await fetch(`${this.baseUrl}/api/slice`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Helper method to validate callback payload
   */
  static isSuccessCallback(payload: CallbackPayload): payload is SuccessCallback {
    return payload.status === 'success';
  }

  /**
   * Helper method to validate callback payload
   */
  static isErrorCallback(payload: CallbackPayload): payload is ErrorCallback {
    return payload.status === 'error';
  }
}

export default Mandarin3DApiClient;
