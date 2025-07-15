import axios from "axios";

const api = axios.create({baseURL:
  import.meta.env.VITE_API_URL
})

api.interceptors.request.use(async config => {
  const user = await firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;