//--------------------   Import For Navbar -------------------- //
//-- Get token for authentication requests
import { getToken } from "./auth.js";
//-- ClearToken to logout (localstorage remove userName and accesToken)
import { clearToken } from "./auth.js";
//-- Api for logged in user --> api.js
import { fetchUserProfile } from "./api.js";
//-- Create new listing  --> api.js
import { createListing } from "./api.js";

//--------------------   Export For Navbar  -------------------- //
//-- Initializes the navbar dynamically based on user authentication status
export { initUserNavbar }; //------------------------------------------------------------------- Line: 19
//-- Create New listing
export { setupNewListingForm }; //-------------------------------------------------------------- Line: 106

//--------------------  Navbar Layout --------------------//
//-- Initializes the navbar based on user authentication status, fetches user profile data, or shows login options if not authenticated.
async function initUserNavbar() {
  const userName = localStorage.getItem("userName");
  const jwtToken = getToken();

  if (!userName || !jwtToken) {
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

//-- Returns HTML content for navigation when the user is not logged in, show sign up and log in options.
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
          <a href="#" class="dropdown-toggle text-light d-flex text-decoration-none" id="navbarDropDown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <div class="me-3">
              <p class="text-light m-0">${profileData.name}</p>
              <p class="text-light m-0">$${profileData.credits}</p>
            </div>
            <img src="${profileData.avatar.url || "/images/image.png"}" alt="${
    profileData.avatar.alt || "Personal Avatar"
  }" class="navProfile rounded-circle">
          </a>
          <ul class="dropdown-menu mt-3 p-2 shadow" aria-labelledby="navbarDropDown">
            <li><a class="dropdown-item p-3" href="/html/my-profile.html"><i class="fas fa-user-circle"></i> Go to Profile</a></li>
            <li><a class="dropdown-item p-3" role="button"  aria-current="page"data-bs-toggle="modal"data-bs-target="#newListingModal"><i class="fas fa-plus-circle"></i> Create New Listings</a></li>
            <li class="dropdown-divider"></li>
            <li><a class="dropdown-item p-3" href="#" id="logoutButton"><i class="fas fa-sign-out-alt"></i> Log Out</a></li>
          </ul>
        </div>
      `;
  //-- to select logout and init logout function
  document
    .getElementById("logoutButton")
    .addEventListener("click", function (event) {
      event.preventDefault();
      logout();
    });
}

//--Loading indicator in the navbar while user data is being fetched.
function showLoadingIndicator() {
  const navRightSection = document.getElementById("navRightSection");
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

//-- Function to handle the form submission for new listings
function setupNewListingForm() {
  const form = document.getElementById("newListingForm");
  if (!form) return;

  //-- Removes existing event listeners
  form.removeEventListener("submit", handleFormSubmit);
  form.addEventListener("submit", handleFormSubmit);

  //-- Event listener for existing image URL input changes
  document.querySelectorAll(".imageUrl").forEach((input) => {
    input.removeEventListener("input", updateImagePreview);
    input.addEventListener("input", updateImagePreview);
  });

  //-- Event listeners for live feedback for existing elements
  const titleInput = document.getElementById("listingTitle");
  titleInput.removeEventListener("input", updateTitleFeedback);
  titleInput.addEventListener("input", updateTitleFeedback);

  const descriptionInput = document.getElementById("listingDescription");
  descriptionInput.removeEventListener("input", updateDescriptionFeedback);
  descriptionInput.addEventListener("input", updateDescriptionFeedback);

  //-- updates the image alt text feedbacks
  updateImageFeedbacks();
}

//-- Event handler for form submission
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const title = document.getElementById("listingTitle").value;
  const description = document.getElementById("listingDescription").value;
  const endsAt = document.getElementById("endsAt").value;
  const category = document.getElementById("categorySelect").value;
  const errorFeedback = document.getElementById("listingErrorFeedback");

  const tags = category !== "Choose a category" ? [category] : [];

  const imageElements = document.querySelectorAll(".image-group");
  const media = [];
  imageElements.forEach((group) => {
    const url = group.querySelector(".imageUrl").value;
    const alt = group.querySelector(".imageAlt").value;
    if (url) {
      media.push({ url, alt });
    }
  });

  const listingData = {
    title,
    description,
    tags,
    media,
    endsAt: new Date(endsAt).toISOString(),
  };

  try {
    form.querySelector("button[type='submit']").disabled = true;

    const result = await createListing(listingData);
    console.log("Listing created:", result);
    form.reset();
    updateFeedbacks();
    window.location.href = `${window.location.origin}/html/my-profile.html`;
  } catch (error) {
    console.error("Failed to create listing:", error);
    errorFeedback.textContent =
      "Failed to create Listing. Include a title and ensure it, along with description, are under 280 characters. If adding an image, descriptions should be under 120 characters and URLs must start with 'http://' or 'https://'. Adjust and retry.";
    errorFeedback.style.display = "block";
  } finally {
    form.querySelector("button[type='submit']").disabled = false;
  }
}

//-- Function to update feedback for inputs dynamically
function updateFeedbacks() {
  updateTitleFeedback();
  updateDescriptionFeedback();
  updateImageFeedbacks();
}

//-- Title Feedback
function updateTitleFeedback() {
  const title = document.getElementById("listingTitle").value;
  const feedback = document.getElementById("titleFeedback");
  feedback.textContent = `${title.length}/280 characters`;
  feedback.classList.toggle("text-danger", title.length > 280);
}

//-- Description Feedback
function updateDescriptionFeedback() {
  const description = document.getElementById("listingDescription").value;
  const feedback = document.getElementById("descriptionFeedback");
  feedback.textContent = `${description.length}/280 characters`;
  feedback.classList.toggle("text-danger", description.length > 280);
}

//-- Image Feedback
function updateImageFeedbacks() {
  const imageGroups = document.querySelectorAll(".image-group");
  imageGroups.forEach((group) => {
    const altText = group.querySelector(".imageAlt").value;
    const feedback = group.querySelector(".imageFeedback");
    feedback.textContent = `${altText.length}/120 characters`;
    feedback.classList.toggle("text-danger", altText.length > 120);

    //-- Event listener for image URL input changes
    const imageUrlInput = group.querySelector(".imageUrl");
    imageUrlInput.removeEventListener("input", updateImagePreview);
    imageUrlInput.addEventListener("input", updateImagePreview);

    //-- Event listener for image alt text changes
    const imageAltInput = group.querySelector(".imageAlt");
    imageAltInput.removeEventListener("input", updateImageFeedbacks);
    imageAltInput.addEventListener("input", updateImageFeedbacks);
  });
}

//-- Image URL input change event
function updateImagePreview(event) {
  const input = event.target;
  const url = input.value;
  const img = input.closest(".image-group").querySelector(".img-preview");

  if (url) {
    img.src = url;
    img.classList.remove("d-none");
  } else {
    img.classList.add("d-none");
  }
}

//-- Adds a new image input field to the form (modal)
function addImageFields() {
  const imagesContainer = document.getElementById("imagesContainer");
  const newImageGroup = document.createElement("div");
  newImageGroup.classList.add("image-group", "position-relative");

  newImageGroup.innerHTML = `
    <div class="d-flex justify-content-center position-relative">
      <div class="img-icon bg-primary d-inline-flex justify-content-center align-items-center mb-2 rounded position-relative">
        <i class="fas fa-image fa-3x text-white"></i>
        <img src="" class="img-preview position-absolute img-thumbnail  w-100 h-100 d-none img-cover" />
      </div>
      <button type="button" class="btn-close position-absolute top-0 end-0 mt-1 me-1" aria-label="Remove"></button>
    </div>
    <div class="form-text">Recommended aspect ratio: 1:1</div>
    <input type="text" class="form-control mt-2 mx-auto imageUrl" placeholder="Image URL to an uploaded image">
    <input type="text" class="form-control mt-2 mx-auto imageAlt" placeholder="Enter image description">
    <div class="feedback form-text imageFeedback">0/120 characters</div>
  `;
  imagesContainer.appendChild(newImageGroup);

  //-- Event listener for the new image URL input
  const imageUrlInput = newImageGroup.querySelector(".imageUrl");
  imageUrlInput.removeEventListener("input", updateImagePreview);
  imageUrlInput.addEventListener("input", updateImagePreview);
  //-- Event listener for the new image alt text input
  const imageAltInput = newImageGroup.querySelector(".imageAlt");
  imageAltInput.removeEventListener("input", updateImageFeedbacks);
  imageAltInput.addEventListener("input", updateImageFeedbacks);
  //-- Event listener for the remove button
  newImageGroup
    .querySelector(".btn-close")
    .addEventListener("click", function () {
      newImageGroup.remove();
    });
  updateImageFeedbacks();
}

//-- Event listeners for live feedback
const titleInput = document.getElementById("listingTitle");
titleInput.removeEventListener("input", updateTitleFeedback);
titleInput.addEventListener("input", updateTitleFeedback);

const descriptionInput = document.getElementById("listingDescription");
descriptionInput.removeEventListener("input", updateDescriptionFeedback);
descriptionInput.addEventListener("input", updateDescriptionFeedback);

const addImageButton = document.getElementById("addImage");
addImageButton.removeEventListener("click", addImageFields);
addImageButton.addEventListener("click", addImageFields);

setupNewListingForm();

//--------------------  Logout Function --------------------//
function logout() {
  if (confirm("Are you sure you want to log out?")) {
    clearToken();
    window.location.href = "/index.html";
  } else {
    console.log("Logout canceled.");
  }
}
