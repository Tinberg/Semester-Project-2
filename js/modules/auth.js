//-------- Export --------//
//-- StoreToken is for login.html
export { storeToken };
//-- getToken is for every page for API authentication requests
export { getToken };
//-- Used when user click logg out
export { clearToken };

//API Key
export const apiKey = "8cbb77a9-bf83-4c1a-a541-1e3936c3abd0";


//-------- JWT Token --------//

function storeToken(token) {
  localStorage.setItem("accessToken", token);
}

function getToken() {
  return localStorage.getItem("accessToken");
}

function clearToken() {
  localStorage.removeItem("accessToken");
}

