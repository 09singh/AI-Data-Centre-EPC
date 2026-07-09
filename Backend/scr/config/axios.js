import axios from "axios";

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || "http://localhost:8000/api/v1",
  timeout: 120000, // 2 minutes (AI operations can take time)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
aiClient.interceptors.request.use(
  (config) => {
    console.log(
      `[AI REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
aiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "[AI ERROR]",
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default aiClient;