import api from "./api";
import type { Product } from "../types";

export async function getProducts() {
  const response = await api.get<{ success: boolean; data: Product[] }>(
    "/products"
  );
  return response.data;
}

export async function getProductById(id: number) {
  const response = await api.get<{ success: boolean; data: Product }>(
    `/products/${id}`
  );
  return response.data;
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}) {
  const response = await api.post<{ success: boolean; data: Product }>(
    "/products",
    data
  );
  return response.data;
}

export async function updateProduct(
  id: number,
  data: { name?: string; description?: string; price?: number; imageUrl?: string }
) {
  const response = await api.put<{ success: boolean; data: Product }>(
    `/products/${id}`,
    data
  );
  return response.data;
}

export async function deleteProduct(id: number) {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/products/${id}`
  );
  return response.data;
}
