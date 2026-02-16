const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface SignUpData {
  email: string;
  name: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface WelcomeResponse {
  message: string;
  user: User;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || 'An error occurred',
    );
  }
  
  return data as T;
}

export const authApi = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<AuthResponse>(response);
  },

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<AuthResponse>(response);
  },
};

export const protectedApi = {
  async getWelcome(): Promise<WelcomeResponse> {
    const response = await fetch(`${API_BASE_URL}/protected/welcome`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    return handleResponse<WelcomeResponse>(response);
  },

  async getMe(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/protected/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    
    return handleResponse<User>(response);
  },
};
