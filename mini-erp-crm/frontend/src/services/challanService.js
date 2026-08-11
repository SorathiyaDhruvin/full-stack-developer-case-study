import api from "./api";

export const createChallan = async (challanData) => {
  const response = await api.post("/challans", challanData);
  return response.data;
};

export const getChallans = async () => {
  const response = await api.get("/challans");
  return response.data;
};

export const getChallan = async (id) => {
  const response = await api.get(`/challans/${id}`);
  return response.data;
};

export const updateChallanStatus = async (id, status) => {
  const response = await api.put(`/challans/${id}/status`, { status });
  return response.data;
};
