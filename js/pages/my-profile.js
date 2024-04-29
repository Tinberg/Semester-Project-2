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
//-- for time until end on auctions--> utility.js
import { timeUntil } from "../modules/utility.js";
//-- Infinite scroll, triggering a callback when the user reaches the bottom of the page--> utility.js
import { addInfiniteScroll } from "../modules/utility.js";
//-- For removing error message and element after a duration --> utility.js
import { clearElementAfterDuration } from "../modules/utility.js";
//-- Trim the text for overlay text title and body text for post --> utility.js --//
import { trimText } from "../modules/utility.js";

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

    const html = `
      <div class="col-lg-4 col-sm-6 mb-4">
        <div class="card text-primary">
          <div class="card-img-top-container position-relative w-100">
            <img src="${imageUrl}" alt="${imageAlt}" class="card-img-top position-absolute w-100 h-100 top-0 start-0"/>
          </div>
          <div class="card-body bg-gray-custom">
            <p class="card-title fs-5 text-truncate">${listing.title}</p>
            <p class="card-text">Current Bid: <span class="currentBidListings">${
              listing._count.bids || "No bids yet"
            }</span></p>
            <p class="card-text fw-light">${endTimeDisplay}</p>
            <a href="#" class="btn btn-success mt-auto w-100 text-primary">To Auction</a>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += html;
  });
}

//---------- show bids by profile ----------//
// function displayBids(bids) {
//   console.log("Displaying bids:", bids);
//   const container = document.getElementById("containerBidding");
//   container.innerHTML = "";
//   bids.forEach((bid) => {
//     const html = `
//         <div class="col-lg-4 col-sm-6 mb-4">
//           <div class="card text-primary">
//             <div class="card-img-top-container position-relative w-100">
//               <img src="${bid.bidder.avatar.url}" alt="${
//       bid.bidder.avatar.alt
//     }" class="card-img-top position-absolute w-100 h-100 top-0 start-0"/>
//               <div class="bidDate position-absolute end-0 top-0 bottom-0 text-white text-center d-flex align-items-center justify-content-center p-3">
//                 ${new Date(bid.created).toLocaleDateString()}
//               </div>
//             </div>
//             <div class="card-body bg-gray-custom">
//               <p class="card-title fs-5 text-truncate">${bid.bidder.name}</p>
//               <p class="card-text">Current Bid: <span class="currentBidBidding">${
//                 bid.amount
//               }</span></p>
//               <a href="#" class="btn btn-success mt-auto w-100 text-primary">To Auction</a>
//             </div>
//           </div>
//         </div>
//       `;
//     container.innerHTML += html;
//   });
// }
function displayBids(bids) {
  console.log("Displaying bids:", bids);
  const container = document.getElementById("containerBidding");
  container.innerHTML = "";

  bids.forEach((bid) => {
    // Use timeSince function to calculate how long ago the bid was placed
    const bidTimeSince = timeSince(new Date(bid.created));
    const listingTitle = bid._listing ? bid._listing.title : "No title available";
    
    const html = `
        <div class="col-lg-4 col-sm-6 mb-4">
          <div class="card text-primary">
            <div class="card-img-top-container position-relative w-100">
              <img src="${bid.bidder.avatar.url}" alt="${bid.bidder.avatar.alt}" class="card-img-top position-absolute w-100 h-100 top-0 start-0"/>
              <div class="bidDate position-absolute end-0 top-0 bottom-0 text-white text-center d-flex align-items-center justify-content-center p-3">
                Bid placed: ${bidTimeSince}
              </div>
            </div>
            <div class="card-body bg-gray-custom">
              <p class="card-title fs-5 text-truncate">${listingTitle}</p>
              <p class="card-text">Current Bid: <span class="currentBidBidding">$${bid.amount}</span></p>
              <a href="#" class="btn btn-success mt-auto w-100 text-primary">To Auction</a>
            </div>
          </div>
        </div>
      `;
    container.innerHTML += html;
  });
}
//--move to utility for use on bid history on specific listing
// Time since function to display time in a human-readable format since the bid was placed
function timeSince(date) {
  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;
  if (secondsPast < 60) { // less than a minute
    return `${parseInt(secondsPast)}s ago`;
  }
  if (secondsPast < 3600) { // less than an hour
    return `${parseInt(secondsPast / 60)}m ago`;
  }
  if (secondsPast <= 86400) { // less than a day
    return `${parseInt(secondsPast / 3600)}h ago`;
  }
  if (secondsPast > 86400) { // more than a day
    day = date.getDate();
    month = date.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
    year = date.getFullYear() == now.getFullYear() ? "" : " " + date.getFullYear();
    return `${day} ${month}${year}`;
  }
}

//---------- Show wins by profile  ----------//
function displayWins(wins) {
  console.log("Displaying wins:", wins);
  const container = document.getElementById("containerWon");
  container.innerHTML = "";
  wins.forEach((win) => {
    const timeLeft = timeUntil(win.endsAt);
    const endTimeDisplay =
      timeLeft === "Auction ended" ? timeLeft : `Auction Ended: ${timeLeft}`;
    const html = `
      <div class="col-lg-4 col-sm-6 mb-4">
        <div class="card text-primary">
          <div class="card-img-top-container position-relative w-100">
            <img src="${win.media[0].url}" alt="${win.media[0].alt}" class="card-img-top position-absolute w-100 h-100 top-0 start-0"/>
            <div class="wonIcon position-absolute end-0 top-0 bottom-0 text-white text-center d-flex align-items-center justify-content-center p-3">
              <i class="fa-solid fa-crown fa-2x"></i>
            </div>
          </div>
          <div class="card-body bg-gray-custom">
            <p class="card-title fs-5 text-truncate">${win.title}</p>
            <p class="card-text">Final Bid: <span class="currentBidWon">${win._count.bids}</span></p>
            <p class="card-text fw-light">${endTimeDisplay}</p>
            <a href="#" class="btn btn-success mt-auto w-100 text-primary">View Auction</a>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += html;
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
var biddingTab = document.getElementById("bidding-tab");
var wonTab = document.getElementById("won-tab");

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



