//---------- Import Styles from profiles.scss ----------/
import "../../scss/profiles.scss";

//---------- Import js from modules ----------/

//-- Api for fetch spesific user info --> api.js
import { fetchUserProfile } from "../modules/api.js";
//-- Api for fetch all listings by a profile --> api.js
import { fetchListingsByProfile } from "../modules/api.js";
//-- Api for fetch all bids by a profile --> api.js
import { fetchbidsByProfile } from "../modules/api.js";
//-- Api for fetch all wins by a profile --> api.js
import { fetchWinsByProfile } from "../modules/api.js";
//-- For edit profile media --> api.js
import { updateProfileMedia } from "../modules/api.js";
//-- For time until end on auctions--> utility.js
import { timeUntil } from "../modules/utility.js";
//-- For displaying time since a bid was made--> utility.js
import { timeSince } from "../modules/utility.js";
//-- Infinite scroll, triggering a callback when the user reaches the bottom of the page--> utility.js
import { addInfiniteScroll } from "../modules/utility.js";
//-- For removing error message and element after a duration --> utility.js
import { clearElementAfterDuration } from "../modules/utility.js";
//-- Trim the text for overlay text title and body text for post --> utility.js
import { trimText } from "../modules/utility.js";
//-- For map out highest bid on listing --> utility.js
import { getHighestBidAmount } from "../modules/utility.js";

//Global state for user Bio text, profile, and pagination
let globalUserProfile = null;
let globalFilter = {
  listingsPage: 1,
  listingsHasMore: true,
  bidsPage: 1,
  bidsHasMore: true,
  winsPage: 1,
  winsHasMore: true,
  limit: 6,
  bidsFetched: false,
  winsFetched: false,
};

//---------- Initializes user profile interface: Determines profile type (self or other), fetches and displays profile data and listings, and sets up infinite scroll for bids and wins ----------//
document.addEventListener("DOMContentLoaded", async () => {
  const isMyProfile = window.location.pathname.includes("my-profile");
  const userName = isMyProfile
    ? localStorage.getItem("userName")
    : new URLSearchParams(window.location.search).get("userName");

  const loaderInfo = document.getElementById("loaderInfo");
  loaderInfo.style.display = "block";

  if (userName) {
    try {
      globalUserProfile = await fetchUserProfile(userName);
      displayUserProfile(globalUserProfile);
      if (isMyProfile) {
        populateProfileForm(globalUserProfile);
      }
      displayListings(await fetchListingsByProfile(userName));
      setupInfiniteScroll(userName);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      displayError(
        "We were unable to load all your profile information. Some features may not be available. Please try logging in again."
      );
    } finally {
      loaderInfo.style.display = "none";
      document.getElementById("loaderTabs").style.display = "none";
    }
  } else {
    displayError("No user information found. Please log in.");
    loaderInfo.style.display = "none";
    document.getElementById("loaderTabs").style.display = "none";
  }

  if (isMyProfile) {
    setupProfileUpdate();
  }
});

//---------- Function to setup profile update (only for my-profile) ----------//
function setupProfileUpdate() {
  document
    .getElementById("editProfileForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const userName = localStorage.getItem("userName");
      const errorFeedback = document.getElementById("profileEditError");

      //-- Fetch current form values
      const bioText = document.getElementById("bioInput").value.trim();
      const resetBanner = document.getElementById(
        "resetBannerCheckbox"
      ).checked;
      const resetAvatar = document.getElementById(
        "resetAvatarCheckbox"
      ).checked;
      const bannerUrl = resetBanner
        ? undefined
        : document.getElementById("bannerImageInput").value || undefined;
      const avatarUrl = resetAvatar
        ? undefined
        : document.getElementById("profileImageInput").value || undefined;

      try {
        await updateProfileMedia(
          userName,
          bannerUrl,
          avatarUrl,
          resetBanner,
          resetAvatar,
          bioText
        );
        window.location.reload();
        clearProfileFormInputs();
        bootstrap.Modal.getInstance(
          document.getElementById("editProfileModal")
        ).hide();
      } catch (error) {
        console.error("Error updating profile media:", error);
        errorFeedback.textContent =
          "Failed to update profile media. Please check your inputs and try again.";
        errorFeedback.style.display = "block";
      }
    });

  document
    .getElementById("bioInput")
    .addEventListener("input", updateBioCharacterCount);
}

//-- Function to update Bio Character Count (edit Profile)
function updateBioCharacterCount() {
  const bioInput = document.getElementById("bioInput");
  const bioFeedback = document.getElementById("bio-text");
  const maxCharacters = 160;
  const currentLength = bioInput.value.length;

  bioFeedback.textContent = `${currentLength}/${maxCharacters} characters`;

  bioFeedback.classList.toggle("text-danger", currentLength > maxCharacters);
}

//-- Function to populate the edit profile form with the current info (Edit Profile)
function populateProfileForm(userData) {
  const { avatar, banner, bio } = userData;

  //-- Get form elements
  const profileImageInput = document.getElementById("profileImageInput");
  const bannerImageInput = document.getElementById("bannerImageInput");
  const bioInput = document.getElementById("bioInput");
  const resetAvatarCheckbox = document.getElementById("resetAvatarCheckbox");
  const resetBannerCheckbox = document.getElementById("resetBannerCheckbox");
  //-- Clear the inputs
  profileImageInput.value = "";
  bannerImageInput.value = "";
  //-- Set the bio value
  bioInput.value = bio || "";
  //-- Update checkbox state based on API response
  resetAvatarCheckbox.checked = !avatar?.url;
  resetBannerCheckbox.checked = !banner?.url;

  updateBioCharacterCount();
}

function clearProfileFormInputs() {
  //-- Clear the input fields and reset checkboxes after saving (Edit profile)
  document.getElementById("profileImageInput").value = "";
  document.getElementById("bannerImageInput").value = "";
  document.getElementById("resetAvatarCheckbox").checked = false;
  document.getElementById("resetBannerCheckbox").checked = false;
}

//---------- Function to display user profile ----------//
function displayUserProfile(profile) {
  document.getElementById("userName").textContent = profile.name;
  document.getElementById("userEmail").textContent = profile.email;
  document.getElementById("userBio").textContent = profile.bio || "";

  //-- banner image
  const bannerImg = document.querySelector(".bannerImg");
  if (profile.banner && profile.banner.url) {
    bannerImg.src = profile.banner.url;
    bannerImg.alt = profile.banner.alt || "Personal profile banner";
    bannerImg.style.display = "";
    bannerImg.setAttribute("role", "img");
    bannerImg.setAttribute(
      "aria-label",
      profile.banner.alt || "Personal profile banner"
    );
  } else {
    bannerImg.style.display = "none";
  }

  //-- profile image
  const profileImg = document.querySelector(".profileImg");
  if (profile.avatar && profile.avatar.url) {
    profileImg.src = profile.avatar.url;
    profileImg.alt = profile.avatar.alt || "Personal profile image";
    profileImg.setAttribute("role", "img");
    profileImg.setAttribute(
      "aria-label",
      profile.avatar.alt || "Personal profile image"
    );
  } else {
    profileImg.style.display = "none";
  }
}

//---------- Helper Functions for displayListings, displayBids and displayWins ----------//
function createImageContainer(imageUrl, imageAlt, overlays = []) {
  const imgContainerDiv = document.createElement("div");
  imgContainerDiv.className = "card-img-top-container position-relative w-100";

  const img = document.createElement("img");
  img.className = "card-img-top position-absolute w-100 h-100 top-0 start-0";
  img.src = imageUrl;
  img.alt = imageAlt;
  img.setAttribute("role", "img");
  img.setAttribute("aria-label", imageAlt);
  imgContainerDiv.appendChild(img);

  overlays.forEach((overlay) => {
    imgContainerDiv.appendChild(overlay);
  });

  return imgContainerDiv;
}
//-- Create an overlay div with specific styles and content
function createOverlay(className, innerHTML, display = "flex") {
  const overlayDiv = document.createElement("div");
  overlayDiv.className = className;
  overlayDiv.innerHTML = innerHTML;
  overlayDiv.style.display = display;
  return overlayDiv;
}
//-- Create a card element 
function createCard(
  container,
  imageUrl,
  imageAlt,
  overlays,
  cardBodyHTML,
  listingId
) {
  const colDiv = document.createElement("div");
  colDiv.className = "col-lg-4 col-sm-6 mb-4 card-container";
  colDiv.style.cursor = "pointer";

  const cardDiv = document.createElement("div");
  cardDiv.className = "card text-primary";
  cardDiv.onclick = () => {
    window.location.href = `listing.html?id=${listingId}`;
  };

  const imgContainerDiv = createImageContainer(imageUrl, imageAlt, overlays);
  const cardBodyDiv = document.createElement("div");
  cardBodyDiv.className = "card-body bg-gray-custom";
  cardBodyDiv.innerHTML = cardBodyHTML;

  cardDiv.appendChild(imgContainerDiv);
  cardDiv.appendChild(cardBodyDiv);
  colDiv.appendChild(cardDiv);
  container.appendChild(colDiv);
}

//---------- Display auction listings in tab ----------//
function displayListings(listings, append = false) {
  const container = document.getElementById("containerListings");
  if (!append) container.innerHTML = "";

  if (listings.length === 0) {
    container.innerHTML = "<p class='text-center '>No listings yet.</p>";
    return;
  }

  listings.forEach((listing) => {
    const imageUrl =
      listing.media && listing.media.length > 0
        ? listing.media[0].url
        : "/images/no-img-listing.jpg";
    const imageAlt =
      listing.media && listing.media.length > 0
        ? listing.media[0].alt
        : "Listing Image";

    const overlayHTML = `
          <div class="text-center text-break">
              <p class="text-light">${trimText(listing.description, 100)}</p>
              <p class="text-light fw-bold mb-0">Sold by:</p>
              <p class="text-light text-truncate">${listing.seller.name}</p>
          </div>
      `;
    const descriptionOverlay = createOverlay(
      "overlay-content position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center",
      overlayHTML,
      "none"
    );

    const endTimeDisplay =
      timeUntil(listing.endsAt) === "Auction ended"
        ? "Auction ended"
        : `Ends in: ${timeUntil(listing.endsAt)}`;
    const buttonClass =
      timeUntil(listing.endsAt) === "Auction ended"
        ? "btn-warning"
        : "btn-success";
    const cardBodyHTML = `
          <p class="card-title fs-5 text-truncate">${listing.title}</p>
          <p class="card-text">Current Bid: <span class="currentBidListings">$${getHighestBidAmount(
            listing
          ).toFixed(2)}</span></p>
          <p class="card-text fw-light">${endTimeDisplay}</p>
          <div class="btn ${buttonClass} mt-auto w-100 text-primary">View Auction</div>
      `;
    //-- CreateCard Function and adding DescriptionOverlay
    createCard(
      container,
      imageUrl,
      imageAlt,
      [descriptionOverlay],
      cardBodyHTML,
      listing.id
    );
  });
}

//---------- Display bidding history in tab ----------//
function displayBids(bids, append = false) {
  const container = document.getElementById("containerBidding");
  if (!append) container.innerHTML = "";

  if (bids.length === 0) {
    container.innerHTML = "<p class='text-center'>No bids yet.</p>";
    return;
  }

  bids.forEach((bid) => {
    if (!bid.listing) {
      console.error("No listing data available for this bid:", bid);
      return;
    }
    //-- No listing media in the bidsByProfile, this could be added to the API :) (Maybe Seller as well)
    const imageUrl =
      bid.listing.media && bid.listing.media.length > 0
        ? bid.listing.media[0].url
        : "/images/no-img-listing.jpg";
    const imageAlt =
      bid.listing.media && bid.listing.media.length > 0
        ? bid.listing.media[0].alt
        : "Listing Image";

    const bidTimeSinceOverlay = createOverlay(
      "bidDate position-absolute end-0 top-0 bottom-0 text-white text-center d-flex align-items-center justify-content-center p-3",
      `Bid placed: ${timeSince(new Date(bid.created))}`
    );
    bidTimeSinceOverlay.setAttribute("role", "note");
    bidTimeSinceOverlay.setAttribute("aria-label", `Bid placed: ${timeSince(new Date(bid.created))}`);

    const descriptionOverlay = createOverlay(
      "overlay-content position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center",
      `<div class="text-white text-center">${trimText(
        bid.listing.description || "No description available",
        100
      )}</div>`,
      "none"
    );

    const endTimeDisplay =
      timeUntil(bid.listing.endsAt) === "Auction ended"
        ? "Auction ended"
        : `Ends in: ${timeUntil(bid.listing.endsAt)}`;
    const buttonClass =
      timeUntil(bid.listing.endsAt) === "Auction ended"
        ? "btn-warning"
        : "btn-success";

    //-- Check if the page is profile.html with a userName in the URL
    const isProfilePage = window.location.pathname.includes("profile.html");
    const userNameParam = new URLSearchParams(window.location.search).get(
      "userName"
    );
    const bidLabel =
      isProfilePage && userNameParam ? `${userNameParam} Bid` : "Your Bid";

    const cardBodyHTML = `
            <p class="card-title fs-5 text-truncate">${bid.listing.title}</p>
            <p class="card-text text-truncate">${bidLabel}: <span class="currentBidBidding">$${bid.amount.toFixed(
      2
    )}</span></p>
            <p class="card-text">${endTimeDisplay}</p>
            <div class="btn ${buttonClass} mt-auto w-100 text-primary">View Auction</div>
        `;

    //-- CreateCard Function and adding DescriptionOverlay and bidTimeSinceOverlay
    createCard(
      container,
      imageUrl,
      imageAlt,
      [bidTimeSinceOverlay, descriptionOverlay],
      cardBodyHTML,
      bid.listing.id
    );
  });
}

//---------- Display Auction won in tab ----------//
function displayWins(wins, append = false) {
  const container = document.getElementById("containerWon");
  if (!append) container.innerHTML = "";

  if (wins.length === 0) {
    container.innerHTML = "<p class='text-center '>No wins yet.</p>";
    return;
  }

  wins.forEach((win) => {
    const imageUrl =
      win.media && win.media.length > 0
        ? win.media[0].url
        : "/images/no-img-listing.jpg";
    const imageAlt =
      win.media && win.media.length > 0
        ? win.media[0].alt
        : "Listing Image";

    const wonIconOverlay = createOverlay(
      "wonIcon position-absolute end-0 top-0 bottom-0 text-white text-center d-flex align-items-center justify-content-center p-3",
      '<i class="fa-solid fa-crown fa-2x"></i>'
    );

    const descriptionOverlay = createOverlay(
      "overlay-content position-absolute w-100 h-100 top-0 start-0 d-flex flex-column align-items-center justify-content-center",
      `<div class="text-center text-break">
        <p class="text-light">${trimText(
          win.description || "No description available",
          100
        )}</p>
        <p class="text-light fw-bold mb-0">Sold by:</p>
        <p class="text-light text-truncate">${win.seller.name}</p>
      </div>`,
      "none"
    );

    const timeSinceEnd = `Auction ended: ${timeSince(new Date(win.endsAt))}`;
    const cardBodyHTML = `
            <p class="card-title fs-5 text-truncate">${win.title}</p>
            <p class="card-text">Bids Received: <span class="currentBidWon">${win._count.bids}</span></p>
            <p class="card-text">${timeSinceEnd}</p>
            <div class="btn btn-warning mt-auto w-100 text-primary">View Auction</div>
        `;
    //-- CreateCard Function and adding DescriptionOverlay and wonIconOverlay
    createCard(
      container,
      imageUrl,
      imageAlt,
      [wonIconOverlay, descriptionOverlay],
      cardBodyHTML,
      win.id
    );
  });
}

//---------- InfiniteScroll Setup ----------//
function setupInfiniteScroll(userName) {
  setupListingsInfiniteScroll(userName);
  setupBidsInfiniteScroll(userName);
  setupWinsInfiniteScroll(userName);
}

//-- Listing Infinite Scroll
function setupListingsInfiniteScroll(userName) {
  addInfiniteScroll(async () => {
    if (
      !document.getElementById("listing").classList.contains("active") ||
      !globalFilter.listingsHasMore
    ) {
      return;
    }
    globalFilter.listingsPage++;
    try {
      const listings = await fetchListingsByProfile(
        userName,
        globalFilter.listingsPage,
        globalFilter.limit
      );
      if (listings.length > 0) {
        displayListings(listings, true);
      } else {
        globalFilter.listingsHasMore = false;
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      const errorMessageElement = document.getElementById("listing");
      errorMessageElement.classList.add("text-danger", "text-center", "mt-3");
      errorMessageElement.textContent =
        "Failed to load more listings. Please try again later.";
      clearElementAfterDuration(errorMessageElement, 7000);
    }
  });
}

//--Bids Infinite Scroll
function setupBidsInfiniteScroll(userName) {
  addInfiniteScroll(async () => {
    if (
      !document.getElementById("bidding").classList.contains("active") ||
      !globalFilter.bidsHasMore
    ) {
      return;
    }
    globalFilter.bidsPage++;
    try {
      const bids = await fetchbidsByProfile(
        userName,
        globalFilter.bidsPage,
        globalFilter.limit
      );
      if (bids.length > 0) {
        displayBids(bids, true);
      } else {
        globalFilter.bidsHasMore = false;
      }
    } catch (error) {
      console.error("Failed to fetch bids:", error);
      const errorMessageElement = document.getElementById("bidding");
      errorMessageElement.classList.add("text-danger", "text-center", "mt-3");
      errorMessageElement.textContent =
        "Failed to load more bids. Please try again later.";
      clearElementAfterDuration(errorMessageElement, 7000);
    }
  });
}

//-- Wins Infinite Scroll
function setupWinsInfiniteScroll(userName) {
  addInfiniteScroll(async () => {
    if (
      !document.getElementById("won").classList.contains("active") ||
      !globalFilter.winsHasMore
    ) {
      return;
    }
    globalFilter.winsPage++;
    try {
      const wins = await fetchWinsByProfile(
        userName,
        globalFilter.winsPage,
        globalFilter.limit
      );
      if (wins.length > 0) {
        displayWins(wins, true);
      } else {
        globalFilter.winsHasMore = false;
      }
    } catch (error) {
      console.error("Failed to fetch wins:", error);
      const errorMessageElement = document.getElementById("won");
      errorMessageElement.classList.add("text-danger", "text-center", "mt-3");
      errorMessageElement.textContent =
        "Failed to load more wins. Please try again later.";
      clearElementAfterDuration(errorMessageElement, 7000);
    }
  });
}

//---------- Event Handlers for Tab Changes ----------//
const biddingTab = document.getElementById("bidding-tab");
const wonTab = document.getElementById("won-tab");
const tabLoader = document.getElementById("loaderTabs");

//-- Bidding Tab
biddingTab.addEventListener("show.bs.tab", async (e) => {
  const isMyProfile = window.location.pathname.includes("my-profile");
  const userName = isMyProfile
    ? localStorage.getItem("userName")
    : new URLSearchParams(window.location.search).get("userName");

  if (!globalFilter.bidsFetched) {
    tabLoader.style.display = "block";
    try {
      const bids = await fetchbidsByProfile(userName);
      displayBids(bids);
      globalFilter.bidsFetched = true;
    } catch (error) {
      console.error("Error fetching bids:", error);
      displayError("Failed to load bidding data. Please try again.");
      clearElementAfterDuration(
        document.querySelector(".user-info-error"),
        7000
      );
    } finally {
      tabLoader.style.display = "none";
    }
  }
});
//--Won Tab
wonTab.addEventListener("show.bs.tab", async (e) => {
  const isMyProfile = window.location.pathname.includes("my-profile");
  const userName = isMyProfile
    ? localStorage.getItem("userName")
    : new URLSearchParams(window.location.search).get("userName");

  if (!globalFilter.winsFetched) {
    tabLoader.style.display = "block";
    try {
      const wins = await fetchWinsByProfile(userName);
      displayWins(wins);
      globalFilter.winsFetched = true;
    } catch (error) {
      console.error("Error fetching wins:", error);
      displayError("Failed to load wins data. Please try again.");
      clearElementAfterDuration(
        document.querySelector(".user-info-error"),
        7000
      );
    } finally {
      tabLoader.style.display = "none";
    }
  }
});

//---------- Error Message Function ----------//
function displayError(message) {
  const errorMessageElement = document.querySelector(".user-info-error");
  errorMessageElement.innerText = message;
}
