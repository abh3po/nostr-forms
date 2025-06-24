import axios from "axios";
import { appConfig } from "../config";

const instance = axios.create({
  baseURL: appConfig.apiBaseUrl,
  withCredentials: true,
});

export default instance;
