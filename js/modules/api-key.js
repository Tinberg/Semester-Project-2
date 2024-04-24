//-- This module contains functionality to generate a new API key. It's intended for rare use, primarily in setup or maintenance scenarios --//
//Api key is located in --> auth.js
//-- Import --//
import { getToken } from "./auth.js";

//-- Base URL --//
const API_BASE_URL = "https://v2.api.noroff.dev";

async function createApiKey() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/auth/create-api-key`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to create API key");
    }

    const data = await response.json();
    console.log("API Key created successfully:", data.data.key);
    return data.data.key;
  } catch (error) {
    console.error("Error creating API key:", error.message);
  }
}

createApiKey();