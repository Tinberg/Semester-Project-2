//-------------------- Import Styles from global and bootstrap JS ---------- ----------/
import "../scss/global.scss";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

//--------------------   Import For Navbar Section 1 -------------------- //
//-- Api for logged in user --> api.js
import { fetchUserProfile } from "./modules/api.js";
//-- Get token for authentication requests
import { getToken } from "./modules/auth.js";

//--------------------  DOM --------------------//
document.addEventListener("DOMContentLoaded", initUserNavbar);

//--------------------  NAVBAR SECTION 1 --------------------//
//-- Initializes the navbar based on user authentication status, fetches user profile data, or shows login options if not authenticated.
async function initUserNavbar() {
  const userName = localStorage.getItem("userName");
  const jwtToken = getToken();

  if (!userName || !jwtToken) {
    console.error("Authentication data missing");
    setNavContent(navbarForNotLoggedInUser());
    return;
  }
  showLoadingIndicator();
  try {
    const profileData = await fetchUserProfile(userName);
    if (profileData) {
      updateNavbarForLoggedInUser(profileData);
    } else {
      console.error("No profile data received");
      setNavContent(navbarForNotLoggedInUser());
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    setNavContent(navbarForNotLoggedInUser());
  }
}

//-- Functions for initUserNavbar --//
//-- Function to set the inner HTML of the navigation right section and make it visible.
function setNavContent(html) {
  const navRightSection = document.getElementById("navRightSection");
  navRightSection.innerHTML = html;
  navRightSection.style.display = "flex";
}
//-- Returns HTML content for navigation when the user is not logged in, offering sign up and log in options.
function navbarForNotLoggedInUser() {
  return `
      <a class="btn align-items-center text-light" href="/html/register.html">Sign Up</a>
      <p class="text-light mb-0 me-3">or</p>
      <a class="btn btn-secondary text-primary px-4" href="/html/login.html">Log In</a>
    `;
}

//-- Updates the navbar with user-specific information such as name, credits, and avatar after successful data retrieval in initUserNavbar function.
function updateNavbarForLoggedInUser(profileData) {
  const navRightSection = document.getElementById("navRightSection");
  navRightSection.innerHTML = `
      <div class="d-flex align-items-center dropdown">
        <a href="#" class="dropdown-toggle text-light d-flex" id="navbarDropDown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          <div class="me-3">
            <p class="text-light m-0">${profileData.name}</p>
            <p class="text-light m-0">$${profileData.credits}</p>
          </div>
          <img src="${profileData.avatar.url || "/images/image.png"}" alt="${
    profileData.avatar.alt || "Personal Avatar"
  }" class="navProfile rounded-circle">
        </a>
        <ul class="dropdown-menu mt-3 p-2" aria-labelledby="navbarDropDown">
          <li><a class="dropdown-item p-3" href="/profile.html"><i class="fas fa-user-circle"></i> Go to Profile</a></li>
          <li><a class="dropdown-item p-3" href="/create-listing.html"><i class="fas fa-plus-circle"></i> Create New Listings</a></li>
          <li><a class="dropdown-item p-3" href="#" onclick="handleLogout()"><i class="fas fa-sign-out-alt"></i> Log Out</a></li>
        </ul>
      </div>
    `;
}

//--Loading indicator in the navbar while user data is being fetched.
function showLoadingIndicator() {
  navRightSection.innerHTML = `
    <div class="d-flex align-items-center justify-content-center" aria-live="polite" aria-busy="true">
      <div class="spinner-border text-light" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <p class="text-light mb-0 ms-3">Loading...</p>
    </div>
  `;
}

//--------------------  ...... SECTION 2 --------------------//
