// API Response Types - These match the frontend interface expectations

export interface File {
  id: string;
  name: string;
  filetype: string;
  filename: string;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  mass: number;
  slicing_status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Color {
  id: string;
  name: string;
  hex_code: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  file_id: string;
  quality: 'good' | 'better' | 'best';
  quantity: number;
  color: string;
  created_at: string;
  updated_at: string;
}