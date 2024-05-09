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
//-- For fetch create Listing --> Navbar.js
export { createListing }; //--------------------------------------------------------------------- Line: 192
//-- For fetch all listings --> explore.js
export { fetchAllListings }; //--------------------------------------------------------------------- Line: 192
//-- For Search profiles --> explore.js and index.js
export { fetchProfilesSearch }; //--------------------------------------------------------------------- Line: 192
//-- For Search listings --> explore.js and index.js
export { fetchListingsSearch }; //--------------------------------------------------------------------- Line: 192
//-- For specific listing --> listing.js
export { fetchListingById }; //--------------------------------------------------------------------- Line: 192
//-- For bid on listing --> listing.js
export { sendBid }; //--------------------------------------------------------------------- Line: 192
//-- For update profile info --> my-profile.js
export { updateProfileMedia }; //--------------------------------------------------------------------- Line: 192

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
 * fetch all listings by profile including bids,seller and pagination
 * @param {string} userName
 * @param {number} page
 * @param {number} limit
 * @returns {Promise}
 */
async function fetchListingsByProfile(userName, page = 1, limit = 6) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/${userName}/listings?limit=${limit}&page=${page}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch profile listings");
  }

  const result = await response.json();
  return result.data;
}

/**
 * fetch all bids by profile
 * @param {string} userName
 * @returns {Promise}
 */
async function fetchbidsByProfile(userName, page = 1, limit = 6) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/${userName}/bids?limit=${limit}&page=${page}&_listings=true`,
    {
      headers: getHeaders(),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch profile bids");
  }
  const result = await response.json();
  return result.data;
}
/**
 * fetch all wins by profile
 * @param {string} userName
 * @returns {Promise}
 */
async function fetchWinsByProfile(userName, page = 1, limit = 6) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/${userName}/wins?limit=${limit}&page=${page}`,
    {
      headers: getHeaders(),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch profile wins");
  }
  const result = await response.json();
  return result.data;
}
/**
 * Creates a new auction listing.
 * @param {Object} listingData
 * @returns {Promise}
 */
async function createListing(listingData) {
  const response = await fetch(`${API_BASE_URL}/auction/listings`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(listingData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create listing`);
  }

  const result = await response.json();
  return result.data;
}
/**
 * Fetch all auction listings optionally filtered by a category with sorting and pagination.
 * @param {string} categoryTag
 * @param {string} sortOption
 * @param {string} sortOrder
 * @param {number} page
 * @param {number} limit
 * @param {boolean} active
 * @returns {Promise}
 */
async function fetchAllListings(
  categoryTag = "",
  sortOption = "created",
  sortOrder = "desc",
  page = 1,
  limit = 20,
  active = null
) {
  let url = `${API_BASE_URL}/auction/listings?_seller=true&_bids=true&page=${page}&limit=${limit}`;

  if (categoryTag) {
    url += `&_tag=${encodeURIComponent(categoryTag)}`;
  }
  if (sortOption) {
    url += `&sort=${sortOption}&sortOrder=${sortOrder}`;
  }
  if (active !== null) {
    url += `&_active=${active}`;
  }

  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }
  const result = await response.json();
  return result.data;
}
/**
 *
 * @param {string} query
 * @returns
 */
// Function to search for profiles
async function fetchProfilesSearch(query) {
  const response = await fetch(
    `${API_BASE_URL}/auction/profiles/search?q=${encodeURIComponent(query)}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch profiles");
  }

  return response.json();
}
/**
 * Function to search for listings including bids and seller information.
 * @param {string} query
 * @returns {Promise}
 */
async function fetchListingsSearch(query) {
  const response = await fetch(
    `${API_BASE_URL}/auction/listings/search?q=${encodeURIComponent(
      query
    )}&_bids=true&_seller=true`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }

  return response.json();
}

/**
 * Fetches a single auction listing by its ID with optional seller and bids information.
 * @param {string} listingId
 * @returns {Promise}
 */
async function fetchListingById(listingId) {
  const response = await fetch(
    `${API_BASE_URL}/auction/listings/${listingId}?_seller=true&_bids=true`,
    { headers: getHeaders() }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch listing`);
  }
  const result = await response.json();
  return result.data;
}

/**
 * Send a bid for a specific listing.
 * @param {string} listingId
 * @param {number} bidAmount
 * @returns {Promise}
 */
async function sendBid(listingId, bidAmount) {
  const response = await fetch(
    `${API_BASE_URL}/auction/listings/${listingId}/bids`,
    {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({
        amount: bidAmount,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to submit bid");
  }

  const result = await response.json();
  return result.data;
}
/**
 * Updates the profile media of a user.
 * @param {string} userName
 * @param {string} bannerUrl
 * @param {string} avatarUrl
 * @param {boolean} isResetBanner
 * @param {boolean} isResetAvatar
 * @param {string} bioText
 * @returns
 */
async function updateProfileMedia(
  userName,
  bannerUrl,
  avatarUrl,
  isResetBanner,
  isResetAvatar,
  bioText
) {
  const placeholderUrl =
    "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=500&w=1500";
  const bodyData = { bio: bioText };

  if (bannerUrl !== undefined || isResetBanner) {
    bodyData.banner = isResetBanner
      ? {
          url: placeholderUrl,
          alt: "A blurry multi-colored rainbow background",
        }
      : { url: bannerUrl, alt: "Personal Banner" };
  }

  if (avatarUrl !== undefined || isResetAvatar) {
    bodyData.avatar = isResetAvatar
      ? {
          url: placeholderUrl,
          alt: "A blurry multi-colored rainbow background",
        }
      : { url: avatarUrl, alt: "Personal Avatar" };
  }

  const response = await fetch(`${API_BASE_URL}/auction/profiles/${userName}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update profile media`);
  }

  return await response.json();
}
