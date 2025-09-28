import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000", // backend Flask
  withCredentials: true,            // envia cookies automaticamente
});
