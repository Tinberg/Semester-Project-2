//-------- Export --------//
//-- StoreToken is for login.html
export { storeToken };
//-- getToken is for every page for API authentication requests
export { getToken };
//-- Used when user click logg out
export { clearToken };

//API Key
export const apiKey = "1ea7c8e6-fe0d-4a5e-8704-a8958935f873";


//-------- JWT Token --------//

function storeToken(token) {
  localStorage.setItem("accessToken", token);
}

function getToken() {
  return localStorage.getItem("accessToken");
}

function clearToken() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userName");
}

