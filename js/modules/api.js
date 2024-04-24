//------ Import --------/

//-- Import the JWT to to confirm user is logged in --> auth.js --//
import { getToken } from "./auth.js";
//-- Import the API key to access API--> auth.js --//
import { apiKey } from "./auth.js";

//------ Export --------/
//-- For fetch register user --> register.js
export { registerUser }; //------------------------------------------------------------------- Line: 67
//-- For fetch login user --> login.js
export { loginUser }; //---------------------------------------------------------------------- Line: 82
//-- For fetch spesific user info --> my-profile.js
export { fetchUserProfile }; //--------------------------------------------------------------- Line: 104
//-- For fetching all listing by a profile --> my-profile.js and profile.js
export { fetchListingsByProfile }; //--------------------------------------------------------- Line: 104
//-- For fetching all wins by a profile --> my-profile.js and profile.js
export { fetchbidsByProfile }; //--------------------------------------------------------- Line: 104
//-- For fetching all wins by a profile --> my-profile.js and profile.js
export { fetchWinsByProfile }; //--------------------------------------------------------- Line: 104

//---------- Utility ----------//
//-- This is the Base URL --//
const API_BASE_URL = "https://v2.api.noroff.dev";

// Headers and content-type for "Get", "Post", "Put", and "Delete" requests getHeaders(false) will exclude the ContentType
function getHeaders(includeContentType = true) {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
    "X-Noroff-API-Key": apiKey,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

//---------- API Calls ----------//
/**
 * register user profile
 * @param {Object} userData
 * @returns {Promise}
 */
async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response;
}
/**
 * login user profile
 * @param {string} email
 * @param {string} password
 * @returns {Promise}
 */
async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const result = await response.json();
  return result.data;
}
/**
 * fetch users profile information
 * @param {string} userName
 * @returns {Promise}
 */
async function fetchUserProfile(userName) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/${userName}?_listings=true&_wins=true`,
    {
      headers: getHeaders(),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch profile information");
  }
  const result = await response.json();
  return result.data;
}
/**
 * fetch all listings by profile
 * @param {string} userName
 * @returns {Promise}
 */
async function fetchListingsByProfile(userName) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/${userName}/listings`,
    {
      headers: getHeaders(),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch profile information");
  }
  const result = await response.json();
  return result.data;
}
/**
 * fetch all bids by profile
 * @param {string} userName
 * @returns {Promise}
 */
async function fetchbidsByProfile(userName) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/${userName}/bids`,
    {
      headers: getHeaders(),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch profile information");
  }
  const result = await response.json();
  return result.data;
}
/**
 * fetch all wins by profile
 * @param {string} userName
 * @returns {Promise}
 */
async function fetchWinsByProfile(userName) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/${userName}/wins`,
    {
      headers: getHeaders(),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch profile information");
  }
  const result = await response.json();
  return result.data;
}
