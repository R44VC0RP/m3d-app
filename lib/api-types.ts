// File API Types
export interface FileGetRequest {
  id?: string;
}

export interface FileGetResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    filetype: string;
    filename: string;
    dimensionX: number;
    dimensionY: number;
    dimensionZ: number;
    mass: number;
    slicing_status: string;
    metadata?: any;
    price: number;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
  } | Array<{
    id: string;
    name: string;
    filetype: string;
    filename: string;
    dimensionX: number;
    dimensionY: number;
    dimensionZ: number;
    mass: number;
    slicing_status: string;
    metadata?: any;
    price: number;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
  }>;
  error?: string;
}

export interface FilePostRequest {
  name: string;
  filetype: string;
  filename: string;
  dimensionX: number;
  dimensionY: number;
  dimensionZ: number;
  mass: number;
  slicing_status?: string;
  metadata?: any;
  price?: number;
  images?: string[];
}

export interface FilePostResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    filetype: string;
    filename: string;
    dimensionX: number;
    dimensionY: number;
    dimensionZ: number;
    mass: number;
    slicing_status: string;
    metadata?: any;
    price: number;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
}

export interface FileDeleteRequest {
  id: string;
}

export interface FileDeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Color API Types
export interface ColorGetRequest {
  id?: string;
}

export interface ColorGetResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    hexCode: string;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | Array<{
    id: string;
    name: string;
    hexCode: string;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  error?: string;
}

export interface ColorPostRequest {
  name: string;
  hexCode: string;
  available?: boolean;
}

export interface ColorPostResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    hexCode: string;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
}

export interface ColorDeleteRequest {
  id: string;
}

export interface ColorDeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Cart API Types
export interface CartGetRequest {
  sessionId: string;
}

export interface CartGetResponse {
  success: boolean;
  data?: {
    id: string;
    sessionId: string;
    items: Array<{
      id: string;
      fileId: string;
      file: {
        id: string;
        name: string;
        filetype: string;
        filename: string;
        dimensionX: number;
        dimensionY: number;
        dimensionZ: number;
        mass: number;
        slicing_status: string;
        metadata?: any;
        price: number;
        images: string[];
      };
      quantity: number;
      quality: string;
      colorId?: string | null;
      color?: {
        id: string;
        name: string;
        hexCode: string;
        available: boolean;
      } | null;
      addons: Array<{
        id: string;
        addon: {
          id: string;
          name: string;
          description?: string | null;
          price: number;
          type: string;
        };
      }>;
    }>;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
}

export interface CartPostRequest {
  sessionId: string;
  fileId: string;
  quantity?: number;
  quality?: string;
  colorId?: string;
  addonIds?: string[];
}

export interface CartPostResponse {
  success: boolean;
  data?: {
    id: string;
    cartId: string;
    fileId: string;
    quantity: number;
    quality: string;
    colorId?: string | null;
    addons: Array<{
      id: string;
      addonId: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
}

export interface CartDeleteRequest {
  sessionId: string;
  itemId?: string;
}

export interface CartDeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface CartPutRequest {
  sessionId: string;
  itemId: string;
  quantity?: number;
  quality?: string;
  colorId?: string;
  addonIds?: string[];
}

export interface CartPutResponse {
  success: boolean;
  data?: {
    id: string;
    cartId: string;
    fileId: string;
    quantity: number;
    quality: string;
    colorId?: string | null;
    addons: Array<{
      id: string;
      addonId: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
}

// Addon API Types
export interface AddonGetRequest {
  id?: string;
}

export interface AddonGetResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    type: string;
    createdAt: Date;
    updatedAt: Date;
  } | Array<{
    id: string;
    name: string;
    description?: string | null;
    price: number;
    type: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  error?: string;
}

export interface AddonPostRequest {
  name: string;
  description?: string;
  price?: number;
  type: string;
}

export interface AddonPostResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    type: string;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
}

export interface AddonDeleteRequest {
  id: string;
}

export interface AddonDeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}