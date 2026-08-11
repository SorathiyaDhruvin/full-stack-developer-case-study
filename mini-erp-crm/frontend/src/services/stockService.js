import api from "./api";

export const createStockMovement = async (movementData) => {
  const response = await api.post("/stock", movementData);
  return response.data;
};

export const getStockMovements = async () => {
  const response = await api.get("/stock");
  return response.data;
};

export const getProductStockMovements = async (productId) => {
  const response = await api.get(`/stock/product/${productId}`);
  return response.data;
};
