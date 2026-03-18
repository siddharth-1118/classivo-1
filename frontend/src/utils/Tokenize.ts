import { getAuthToken } from "./authStorage";
export const token = () => getAuthToken() || "";
