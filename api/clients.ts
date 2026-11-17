import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Thin clients for each area of the DummyJSON API, the API-testing equivalent of page objects.
 * They return the raw APIResponse so tests can assert on status codes and headers,
 * as well as parse the body against a schema.
 */

export interface LoginRequest {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface CartItemRequest {
  id: number;
  quantity: number;
}

export class AuthClient {
  constructor (private readonly request: APIRequestContext) {}

  login (credentials: LoginRequest): Promise<APIResponse> {
    return this.request.post('/auth/login', { data: credentials });
  }

  currentUser (accessToken?: string): Promise<APIResponse> {
    const headers: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    return this.request.get('/auth/me', { headers });
  }
}

export class ProductsClient {
  constructor (private readonly request: APIRequestContext) {}

  get (id: number): Promise<APIResponse> {
    return this.request.get(`/products/${id}`);
  }

  list (params: { limit?: number; skip?: number; select?: string[] } = {}): Promise<APIResponse> {
    return this.request.get('/products', { params: toQuery(params) });
  }

  search (query: string, params: { limit?: number } = {}): Promise<APIResponse> {
    return this.request.get('/products/search', { params: { q: query, ...toQuery(params) } });
  }

  byCategory (category: string): Promise<APIResponse> {
    return this.request.get(`/products/category/${encodeURIComponent(category)}`, { params: { limit: 0 } });
  }

  add (product: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('/products/add', { data: product });
  }

  update (id: number, changes: Record<string, unknown>): Promise<APIResponse> {
    return this.request.put(`/products/${id}`, { data: changes });
  }

  delete (id: number): Promise<APIResponse> {
    return this.request.delete(`/products/${id}`);
  }
}

export class CartsClient {
  constructor (private readonly request: APIRequestContext) {}

  get (id: number): Promise<APIResponse> {
    return this.request.get(`/carts/${id}`);
  }

  add (userId: number, products: CartItemRequest[]): Promise<APIResponse> {
    return this.request.post('/carts/add', { data: { userId, products } });
  }

  update (id: number, products: CartItemRequest[], merge = true): Promise<APIResponse> {
    return this.request.put(`/carts/${id}`, { data: { merge, products } });
  }

  delete (id: number): Promise<APIResponse> {
    return this.request.delete(`/carts/${id}`);
  }
}

const toQuery = ({ select, ...rest }: { limit?: number; skip?: number; select?: string[] }): Record<string, string | number> => {
  const query: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      query[key] = value;
    }
  }
  if (select) {
    query.select = select.join(',');
  }
  return query;
};
