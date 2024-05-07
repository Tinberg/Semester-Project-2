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
//-- For time until end on auctions--> utility.js
import { timeUntil } from "../modules/utility.js";
//-- For displaying time since a bid was made--> utility.js
import { timeSince } from "../modules/utility.js";
//-- Infinite scroll, triggering a callback when the user reaches the bottom of the page--> utility.js
import { addInfiniteScroll } from "../modules/utility.js";
//-- For removing error message and element after a duration --> utility.js
import { clearElementAfterDuration } from "../modules/utility.js";
//-- Trim the text for overlay text title and body text for post --> utility.js --//
import { trimText } from "../modules/utility.js";
//-- For map out highest bid on listing --> utility.js --//
import { getHighestBidAmount } from "../modules/utility.js";

//Global state for user Bio text, profile, and pagination
let initialBioText = "";
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

//---------- DOM ----------//
document.addEventListener("DOMContentLoaded", async () => {
  const userName = localStorage.getItem("userName");
  if (userName) {
    try {
      globalUserProfile = await fetchUserProfile(userName);
      displayUserProfile(globalUserProfile);
      displayListings(await fetchListingsByProfile(userName));
      setupInfiniteScroll();
    } catch (error) {
      console.error("Error fetching user profile:", error);
      displayError(
        "We were unable to load all your profile information. Some features may not be available.Please try logging in again."
      );
    }
  } else {
    console.log("No username found in localStorage.");
    displayError("No user information found. Please log in.");
  }
});

//---------- Show user Information ----------//
function displayUserProfile(profile) {
  document.getElementById("userName").textContent = profile.name;
  document.getElementById("userEmail").textContent = profile.email;
  document.getElementById("userBio").textContent = profile.bio || "";

  // banner image
  const bannerImg = document.querySelector(".bannerImg");
  if (profile.banner && profile.banner.url) {
    bannerImg.src = profile.banner.url;
    bannerImg.alt = profile.banner.alt || "Personal profile banner";
    bannerImg.style.display = "";
  } else {
    bannerImg.style.display = "none";
  }

  //profile image
  const profileImg = document.querySelector(".profileImg");
  if (profile.avatar && profile.avatar.url) {
    profileImg.src = profile.avatar.url;
    profileImg.alt = profile.avatar.alt || "Personal profile image";
  } else {
    profileImg.style.display = "none";
  }
}

//---------- Show listings by profile ----------//
function displayListings(listings, append = false) {
  console.log("Displaying Listings:", listings);
  const container = document.getElementById("containerListings");

  if (!append) {
    container.innerHTML = "";
  }

  listings.forEach((listing) => {
    const hasMedia = listing.media && listing.media.length > 0;
    const imageUrl = hasMedia
      ? listing.media[0].url
      : "/images/no-img-listing.jpg";
    const imageAlt = hasMedia ? listing.media[0].alt : "Listing Image";
    const timeLeft = timeUntil(listing.endsAt);

    const endTimeDisplay =
      timeLeft === "Auction ended" ? timeLeft : `Ends in: ${timeLeft}`;
    const buttonClass =
      timeLeft === "Auction ended" ? "btn-warning" : "btn-success";

    const highestBid = getHighestBidAmount(listing);
    const userName = localStorage.getItem("userName");

    // Create a column for the card
    const colDiv = document.createElement("div");
    colDiv.className = "col-lg-4 col-sm-6 mb-4 card-container";
    colDiv.style.cursor = "pointer";

    // Create the card and direct to listing on click
    const cardDiv = document.createElement("div");
    cardDiv.className = "card text-primary";
    cardDiv.onclick = function () {
      window.location.href = `listing.html?id=${listing.id}`;
    };

    // Image container
    const imgContainerDiv = document.createElement("div");
    imgContainerDiv.className =
      "card-img-top-container position-relative w-100";

    // Image element
    const img = document.createElement("img");
    img.className = "card-img-top position-absolute w-100 h-100 top-0 start-0";
    img.src = imageUrl;
    img.alt = imageAlt;

    // Overlay content
    const overlayDiv = document.createElement("div");
    overlayDiv.className =
      "overlay-content position-absolute top-0 start-0 end-0 bottom-0 w-100 h-100 d-flex justify-content-center align-items-center p-2";
    overlayDiv.innerHTML = `
      <div class="text-center text-break">
        <p class="text-light">${trimText(listing.description, 100)}</p>
        <p class="text-light fw-bold  mb-0">Sold by:</p>
        <p class="text-light text-truncate">${userName}</p>
      </div>
    `;

    // Card body
    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body bg-gray-custom";
    cardBodyDiv.innerHTML = `
      <p class="card-title fs-5 text-truncate">${listing.title}</p>
      <p class="card-text">Current Bid: <span class="currentBidListings">$${highestBid.toFixed(
        2
      )}</span></p>
      <p class="card-text fw-light">${endTimeDisplay}</p>
      <div class="btn ${buttonClass} mt-auto w-100 text-primary">View Auction</div>
    `;

    imgContainerDiv.appendChild(img);
    imgContainerDiv.appendChild(overlayDiv);
    cardDiv.appendChild(imgContainerDiv);
    cardDiv.appendChild(cardBodyDiv);
    colDiv.appendChild(cardDiv);
    container.appendChild(colDiv);
  });
}

//---------- Show Bids by profile  ----------//
function displayBids(bids, append = false) {
  console.log("Displaying bids:", bids);
  const container = document.getElementById("containerBidding");

  if (!append) {
    container.innerHTML = "";
  }

  bids.forEach((bid) => {
    if (!bid.listing) {
      console.error("No listing data available for this bid:", bid);
      return;
    }

    const bidTimeSince = timeSince(new Date(bid.created));
    const imageUrl =
      bid.listing.media && bid.listing.media.length > 0
        ? bid.listing.media[0].url
        : "/images/no-img-listing.jpg";
    const imageAlt =
      bid.listing.media && bid.listing.media.length > 0
        ? bid.listing.media[0].alt
        : "Listing Image";
    const listingDescription =
      bid.listing.description || "No description available";

    const timeLeft = timeUntil(bid.listing.endsAt);
    const endTimeDisplay =
      timeLeft === "Auction ended" ? timeLeft : `Ends in: ${timeLeft}`;
    const buttonClass =
      timeLeft === "Auction ended" ? "btn-warning" : "btn-success";

    // Create a column for the card
    const colDiv = document.createElement("div");
    colDiv.className = "col-lg-4 col-sm-6 mb-4 card-container";
    colDiv.style.cursor = "pointer";

    // Create the card and redirect on click
    const cardDiv = document.createElement("div");
    cardDiv.className = "card text-primary";
    cardDiv.onclick = function () {
      window.location.href = `listing.html?id=${bid.listing.id}`;
    };

    // Image container
    const imgContainerDiv = document.createElement("div");
    imgContainerDiv.className =
      "card-img-top-container position-relative w-100";

    // Image element
    const img = document.createElement("img");
    img.className = "card-img-top position-absolute w-100 h-100 top-0 start-0";
    img.src = imageUrl;
    img.alt = imageAlt;

    // Bid date overlay
    const bidDateOverlay = document.createElement("div");
    bidDateOverlay.className =
      "bidDate position-absolute end-0 top-0 bottom-0 text-white text-center d-flex align-items-center justify-content-center p-3";
    bidDateOverlay.textContent = `Bid placed: ${bidTimeSince}`;

    // Hover overlay
    const hoverOverlay = document.createElement("div");
    hoverOverlay.className =
      "overlay-content position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center";
    hoverOverlay.innerHTML = `<div>
          <p class="text-white">${trimText(listingDescription, 100)}</p>
      </div>`;

    imgContainerDiv.appendChild(img);
    imgContainerDiv.appendChild(bidDateOverlay);
    imgContainerDiv.appendChild(hoverOverlay);

    // Card body
    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body bg-gray-custom";
    cardBodyDiv.innerHTML = `
          <p class="card-title fs-5 text-truncate">${bid.listing.title}</p>
          <p class="card-text">Your Bid: <span class="currentBidBidding">$${bid.amount.toFixed(
            2
          )}</span></p>
          <p class="card-text">${endTimeDisplay}</p>
          <div class="btn ${buttonClass} mt-auto w-100 text-primary">View Auction</div>
      `;

    cardDiv.appendChild(imgContainerDiv);
    cardDiv.appendChild(cardBodyDiv);
    colDiv.appendChild(cardDiv);
    container.appendChild(colDiv);
  });
}

//---------- Show wins by profile  ----------//
function displayWins(wins, append = false) {
  console.log("Displaying wins:", wins);
  const container = document.getElementById("containerWon");

  if (!append) {
    container.innerHTML = "";
  }

  wins.forEach((win) => {
    const imageUrl =
      win.media && win.media.length > 0
        ? win.media[0].url
        : "/images/no-img-listing.jpg";
    const imageAlt =
      win.media && win.media.length > 0
        ? win.media[0].alt
        : "No image available";
    const listingDescription = win.description || "No description available";
    const timeSinceEnd = timeSince(new Date(win.endsAt));
    const buttonClass = "btn-warning";

    // Create a column for the card
    const colDiv = document.createElement("div");
    colDiv.className = "col-lg-4 col-sm-6 mb-4 card-container";
    colDiv.style.cursor = "pointer";

    // Create the card and redirect
    const cardDiv = document.createElement("div");
    cardDiv.className = "card text-primary";
    cardDiv.onclick = function () {
      window.location.href = `listing.html?id=${win.id}`;
    };

    // Image container
    const imgContainerDiv = document.createElement("div");
    imgContainerDiv.className =
      "card-img-top-container position-relative w-100";

    // Image element
    const img = document.createElement("img");
    img.className = "card-img-top position-absolute w-100 h-100 top-0 start-0";
    img.src = imageUrl;
    img.alt = imageAlt;

    // Crown icon overlay
    const wonIconDiv = document.createElement("div");
    wonIconDiv.className =
      "wonIcon position-absolute end-0 top-0 bottom-0 text-white text-center d-flex align-items-center justify-content-center p-3";
    wonIconDiv.innerHTML = '<i class="fa-solid fa-crown fa-2x"></i>';

    // Description overlay
    const descriptionOverlay = document.createElement("div");
    descriptionOverlay.className =
      "overlay-content position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center";
    descriptionOverlay.style.display = "none";
    descriptionOverlay.innerHTML = `<div class="text-white text-center">${trimText(
      listingDescription,
      100
    )}</div>`;

    // Card body
    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body bg-gray-custom";
    cardBodyDiv.innerHTML = `
        <p class="card-title fs-5 text-truncate">${win.title}</p>
        <p class="card-text">Bids Received: <span class="currentBidWon">${win._count.bids}</span></p>
        <p class="card-text">Auction ended: ${timeSinceEnd}</p>
        <div class="btn ${buttonClass} mt-auto w-100 text-primary">View Auction</div>
    `;

    imgContainerDiv.appendChild(img);
    imgContainerDiv.appendChild(wonIconDiv);
    imgContainerDiv.appendChild(descriptionOverlay);
    cardDiv.appendChild(imgContainerDiv);
    cardDiv.appendChild(cardBodyDiv);
    colDiv.appendChild(cardDiv);
    container.appendChild(colDiv);
  });
}

//---------- InfiniteScroll Setup   ----------//
function setupInfiniteScroll() {
  setupListingsInfiniteScroll();
  setupBidsInfiniteScroll();
  setupWinsInfiniteScroll();
}
//-- Listing
function setupListingsInfiniteScroll() {
  addInfiniteScroll(async () => {
    if (
      !document.getElementById("listing").classList.contains("active") ||
      !globalFilter.listingsHasMore
    ) {
      return;
    }
    globalFilter.listingsPage++;
    fetchListingsByProfile(
      localStorage.getItem("userName"),
      globalFilter.listingsPage,
      globalFilter.limit
    )
      .then((listings) => {
        if (listings.length > 0) {
          displayListings(listings, true);
        } else {
          globalFilter.listingsHasMore = false;
        }
      })
      .catch((error) => {
        console.error("Failed to fetch listings:", error);
        const errorMessageElement = document.getElementById("listing");
        errorMessageElement.classList.add("text-danger", "text-center", "mt-3");
        errorMessageElement.textContent =
          "Failed to load more listings. Please try again later.";
        clearElementAfterDuration(errorMessageElement, 7000);
      });
  });
}
//-- Bids
function setupBidsInfiniteScroll() {
  addInfiniteScroll(async () => {
    if (
      !document.getElementById("bidding").classList.contains("active") ||
      !globalFilter.bidsHasMore
    ) {
      return;
    }
    globalFilter.bidsPage++;
    fetchbidsByProfile(
      localStorage.getItem("userName"),
      globalFilter.bidsPage,
      globalFilter.limit
    )
      .then((bids) => {
        if (bids.length > 0) {
          displayBids(bids, true);
        } else {
          globalFilter.bidsHasMore = false;
        }
      })
      .catch((error) => {
        console.error("Failed to fetch bids:", error);
        const errorMessageElement = document.getElementById("bidding");
        errorMessageElement.classList.add("text-danger", "text-center", "mt-3");
        errorMessageElement.textContent =
          "Failed to load more bids. Please try again later.";
        clearElementAfterDuration(errorMessageElement, 7000);
      });
  });
}
//-- Wins
function setupWinsInfiniteScroll() {
  addInfiniteScroll(async () => {
    if (
      !document.getElementById("won").classList.contains("active") ||
      !globalFilter.winsHasMore
    ) {
      return;
    }
    globalFilter.winsPage++;
    fetchWinsByProfile(
      localStorage.getItem("userName"),
      globalFilter.winsPage,
      globalFilter.limit
    )
      .then((wins) => {
        if (wins.length > 0) {
          displayWins(wins, true);
        } else {
          globalFilter.winsHasMore = false;
        }
      })
      .catch((error) => {
        console.error("Failed to fetch wins:", error);
        const errorMessageElement = document.getElementById("won");
        errorMessageElement.classList.add("text-danger", "text-center", "mt-3");
        errorMessageElement.textContent =
          "Failed to load more wins. Please try again later.";
        clearElementAfterDuration(errorMessageElement, 7000);
      });
  });
}

//---------- Event Handlers for Tab Changes ---------//
// Keep these event listeners for loading initial data on tab show
const biddingTab = document.getElementById("bidding-tab");
const wonTab = document.getElementById("won-tab");

biddingTab.addEventListener("show.bs.tab", async (e) => {
  if (!globalFilter.bidsFetched) {
    try {
      const bids = await fetchbidsByProfile(localStorage.getItem("userName"));
      displayBids(bids);
      globalFilter.bidsFetched = true;
    } catch (error) {
      console.error("Error fetching bids:", error);
      displayError("Failed to load bidding data. Please try again.");
      clearElementAfterDuration(
        document.querySelector(".user-info-error"),
        7000
      );
    }
  }
});

wonTab.addEventListener("show.bs.tab", async (e) => {
  if (!globalFilter.winsFetched) {
    try {
      const wins = await fetchWinsByProfile(localStorage.getItem("userName"));
      displayWins(wins);
      globalFilter.winsFetched = true;
    } catch (error) {
      console.error("Error fetching wins:", error);
      displayError("Failed to load wins data. Please try again.");
      clearElementAfterDuration(
        document.querySelector(".user-info-error"),
        7000
      );
    }
  }
});

//---------- Error Function ----------//
function displayError(message) {
  const errorMessageElement = document.querySelector(".user-info-error");
  errorMessageElement.innerText = message;
}
