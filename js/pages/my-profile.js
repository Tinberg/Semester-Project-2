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

    const html = `
      <div class="col-lg-4 col-sm-6 mb-4">
        <div class="card text-primary">
          <div class="card-img-top-container position-relative w-100">
            <img src="${imageUrl}" alt="${imageAlt}" class="card-img-top position-absolute w-100 h-100 top-0 start-0"/>
          </div>
          <div class="card-body bg-gray-custom">
            <p class="card-title fs-5 text-truncate">${listing.title}</p>
            <p class="card-text">Current Bid: <span class="currentBidListings">$ $ ${highestBid.toFixed(
              2
            )}
              
            </span></p>
            <p class="card-text fw-light">${endTimeDisplay}</p>
            <div class="btn ${buttonClass} mt-auto w-100 text-primary">View Auction</div>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += html;
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
    const imageUrl = "/images/no-img-listing.jpg";
    const imageAlt = "Listing Image";
    //-- No api endpoint for _listing for Media, could this be smt Noroff could add to the api?
    if (bid.listing.media && bid.listing.media.length > 0) {
      imageUrl = bid.listing.media[0].url;
      imageAlt = bid.listing.media[0].alt;
    } else {
      console.log("No media available for this listing:", bid.listing);
    }

    // Calculate time until auction ends
    const timeLeft = timeUntil(bid.listing.endsAt);
    const endTimeDisplay =
      timeLeft === "Auction ended" ? timeLeft : `Ends in: ${timeLeft}`;
    const buttonClass =
      timeLeft === "Auction ended" ? "btn-warning" : "btn-success";

    const html = `
      <div class="col-lg-4 col-sm-6 mb-4">
        <div class="card text-primary">
          <div class="card-img-top-container position-relative w-100">
            <img src="${imageUrl}" alt="${imageAlt}" class="card-img-top position-absolute w-100 h-100 top-0 start-0"/>
            <div class="bidDate position-absolute end-0 top-0 bottom-0 text-white text-center d-flex align-items-center justify-content-center p-3">
              Bid placed: ${bidTimeSince}
            </div>
          </div>
          <div class="card-body bg-gray-custom">
            <p class="card-title fs-5 text-truncate">${bid.listing.title}</p>
            <p class="card-text">Your Bid: <span class="currentBidBidding">$${bid.amount.toFixed(
              2
            )}</span></p>
            <p class="card-text">${endTimeDisplay}</p>
            <div class="btn ${buttonClass} mt-auto w-100 text-primary">View Auction</div>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", html);
  });
}

//---------- Show wins by profile  ----------//
function displayWins(wins) {
  console.log("Displaying wins with bids check:", wins.map(win => ({ title: win.title, bids: win.bids })));

  const container = document.getElementById("containerWon");
  container.innerHTML = "";

  wins.forEach((win) => {
    const imageUrl =
      win.media && win.media.length > 0
        ? win.media[0].url
        : "/images/no-img-listing.jpg";
    const imageAlt =
      win.media && win.media.length > 0
        ? win.media[0].alt
        : "No image available";
    const description = win.description || "No description provided.";
    const timeLeft = timeUntil(win.endsAt);
    const endTimeDisplay =
      timeLeft === "Auction ended"
        ? "Auction Ended"
        : `Auction Ended: ${timeLeft}`;
    const buttonClass = "btn-warning"; 

    const html = `
      <div class="col-lg-4 col-sm-6 mb-4">
        <div class="card text-primary">
          <div class="card-img-top-container position-relative w-100">
            <img src="${imageUrl}" alt="${imageAlt}" class="card-img-top position-absolute w-100 h-100 top-0 start-0"/>
            <div class="wonIcon position-absolute end-0 top-0 bottom-0 text-white text-center d-flex align-items-center justify-content-center p-3">
              <i class="fa-solid fa-crown fa-2x"></i>
            </div>
          </div>
          <div class="card-body bg-gray-custom">
            <p class="card-title fs-5 text-truncate">${win.title}</p>
            <p class="card-text">${description}</p>
            <p class="card-text">Bid won: <span class="currentBidWon">${win._count.bids}</span></p>
            <p class="card-text fw-light">${endTimeDisplay}</p>
            <div class="btn ${buttonClass} mt-auto w-100 text-primary">View Auction</div>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", html);
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
