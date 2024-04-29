//--------------------   Import For Navbar -------------------- //
//-- Get token for authentication requests
import { getToken } from "./auth.js";
//-- Api for logged in user --> api.js
import { fetchUserProfile } from "./api.js";
//-- Create new listing  --> api.js
import { createListing } from "./api.js";

//--------------------   Export For Navbar  -------------------- //
//-- Initializes the navbar dynamically based on user authentication status
export { initUserNavbar }; //-- Line: 11-86
//-- Create New listing //-- Line: 89-
export { setupNewListingForm };

//--------------------  Navbar Layout --------------------//
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
            <li><a class="dropdown-item p-3" href="/html/my-profile.html"><i class="fas fa-user-circle"></i> Go to Profile</a></li>
            <li><a class="dropdown-item p-3"  aria-current="page"data-bs-toggle="modal"data-bs-target="#newListingModal"><i class="fas fa-plus-circle"></i> Create New Listings</a></li>
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

//--------------------  Navbar Create New Listing --------------------//

// Function to handle the form submission for new listings
function setupNewListingForm() {
  const form = document.getElementById("newListingForm");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("listingTitle").value;
    const description = document.getElementById("listingDescription").value;
    const imageUrl = document.getElementById("listingImage").value;
    const imageAlt = document.getElementById("altText").value;
    const endsAt = document.getElementById("endsAt").value;
    const category = document.getElementById("categorySelect").value;
    const errorFeedback = document.getElementById("listingErrorFeedback");

    const tags = category !== "Choose a category" ? [category] : [];

    const listingData = {
      title,
      description,
      tags,
      media: imageUrl ? [{ url: imageUrl, alt: imageAlt }] : [],
      endsAt: new Date(endsAt).toISOString(),
    };

    try {
      const result = await createListing(listingData);
      console.log("Listing created:", result);
      form.reset();
      updateFeedbacks();
      window.location.href = "my-profile.html";
    } catch (error) {
      console.error("Failed to create listing:", error);
      errorFeedback.textContent =
        "Failed to create Listing. Include a title and ensure it, along with description, are under 280 characters. If adding an image, descriptions should be under 120 characters and URLs must start with 'http://' or 'https://'. Adjust and retry.";
      errorFeedback.style.display = "block";
    }
  });
}

// Function to update feedback for inputs dynamically
function updateFeedbacks() {
  updateTitleFeedback();
  updateDescriptionFeedback();
  updateAltTextFeedback();
}

function updateTitleFeedback() {
  const title = document.getElementById("listingTitle").value;
  const feedback = document.getElementById("titleFeedback");
  feedback.textContent = `${title.length}/280 characters`;
  feedback.classList.toggle("text-danger", title.length > 280);
}

function updateDescriptionFeedback() {
  const description = document.getElementById("listingDescription").value;
  const feedback = document.getElementById("descriptionFeedback");
  feedback.textContent = `${description.length}/280 characters`;
  feedback.classList.toggle("text-danger", description.length > 280);
}

function updateAltTextFeedback() {
  const altText = document.getElementById("altText").value;
  const feedback = document.getElementById("altTextFeedback");
  feedback.textContent = `${altText.length}/120 characters`;
  feedback.classList.toggle("text-danger", altText.length > 120);
}

// Event listeners for live feedback
document
  .getElementById("listingTitle")
  .addEventListener("input", updateTitleFeedback);
document
  .getElementById("listingDescription")
  .addEventListener("input", updateDescriptionFeedback);
document
  .getElementById("altText")
  .addEventListener("input", updateAltTextFeedback);
