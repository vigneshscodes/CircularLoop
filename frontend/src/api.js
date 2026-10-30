import axios from "axios";
const api=axios.create({baseURL:(import.meta.env.VITE_API_URL||"http://localhost:5000").replace(/\/$/,"")+"/api",timeout:20000});
api.interceptors.response.use(r=>r.data,e=>Promise.reject(new Error(e.response?.data?.message||e.message||"Request failed")));
export default api;
