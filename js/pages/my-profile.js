//---------- Import Styles from profiles.scss ----------/
import "../../scss/profiles.scss";

//---------- Import js from modules ----------/
import { checkAuthAndRedirect } from "../modules/auth.js";
checkAuthAndRedirect();
//-- Api for fetch spesific user info --> api.js
import { fetchUserProfile } from "../modules/api.js";
//-- Api for fetch all listings by a profile --> api.js
import { fetchListingsByProfile } from "../modules/api.js";
//-- Api for fetch all bids by a profile --> api.js
import { fetchbidsByProfile } from "../modules/api.js";
//-- Api for fetch all wins by a profile --> api.js
import { fetchWinsByProfile } from "../modules/api.js";

//-- Infinite scroll, triggering a callback when the user reaches the bottom of the page
import { addInfiniteScroll } from "../modules/utility.js";
//-- Trim the text for overlay text title and body text for post --> utility.js --//
import { trimText } from "../modules/utility.js";



//Global state for user Bio text, profile, and pagination
let initialBioText = "";
let globalUserProfile = null;
let globalFilter = {
  page: 1,
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
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  } else {
    console.log("No username found in localStorage.");
    window.location.href = "/html/login.html";
  }
});
// for loading wins and bids.
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
      //Make error message here
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
      //make error message here
    }
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
function displayListings(listings) {
  console.log("Displaying Listings:", listings);
  const container = document.getElementById("containerListings");
  container.innerHTML = "";

  listings.forEach((listing) => {
    const hasMedia = listing.media && listing.media.length > 0;
    const imageUrl = hasMedia ? listing.media[0].url : '/images/no-img-listing.jpg';
    const imageAlt = hasMedia ? listing.media[0].alt : 'Listing Image'; 

    const html = `
      <div class="col-lg-4 col-sm-6 mb-4">
        <div class="card text-primary">
          <div class="card-img-top-container position-relative w-100">
            <img src="${imageUrl}" alt="${imageAlt}" class="card-img-top position-absolute w-100 h-100 top-0 start-0"/>
          </div>
          <div class="card-body bg-gray-custom">
            <p class="card-title fs-5 text-truncate">${listing.title}</p>
            <p class="card-text">Current Bid: <span class="currentBidListings">${listing._count.bids || 'No bids yet'}</span></p>
            <p class="card-text fw-light">Ends in: <span class="endTimeListings">${new Date(listing.endsAt).toLocaleString()}</span></p>
            <a href="#" class="btn btn-success mt-auto w-100 text-primary">To Auction</a>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += html;
  });
}

//---------- show bids by profile ----------//
function displayBids(bids) {
  console.log("Displaying bids:", bids);
  const container = document.getElementById("containerBidding");
  container.innerHTML = "";
  bids.forEach((bid) => {
    const html = `
        <div class="col-lg-4 col-sm-6 mb-4">
          <div class="card text-primary">
            <div class="card-img-top-container position-relative w-100">
              <img src="${bid.bidder.avatar.url}" alt="${
      bid.bidder.avatar.alt
    }" class="card-img-top position-absolute w-100 h-100 top-0 start-0"/>
              <div class="bidDate position-absolute end-0 top-0 bottom-0 text-white text-center d-flex align-items-center justify-content-center p-3">
                ${new Date(bid.created).toLocaleDateString()}
              </div>
            </div>
            <div class="card-body bg-gray-custom">
              <p class="card-title fs-5 text-truncate">${bid.bidder.name}</p>
              <p class="card-text">Current Bid: <span class="currentBidBidding">${
                bid.amount
              }</span></p>
              <a href="#" class="btn btn-success mt-auto w-100 text-primary">To Auction</a>
            </div>
          </div>
        </div>
      `;
    container.innerHTML += html;
  });
}
//---------- Show wins by profile  ----------//
function displayWins(wins) {
  console.log("Displaying wins:", wins);
  const container = document.getElementById("containerWon");
  container.innerHTML = "";
  wins.forEach((win) => {
    const html = `
        <div class="col-lg-4 col-sm-6 mb-4">
          <div class="card text-primary">
            <div class="card-img-top-container position-relative w-100">
              <img src="${win.media[0].url}" alt="${
      win.media[0].alt
    }" class="card-img-top position-absolute w-100 h-100 top-0 start-0"/>
              <div class="wonIcon position-absolute end-0 top-0 bottom-0 text-white text-center d-flex align-items-center justify-content-center p-3">
                <i class="fa-solid fa-crown fa-2x"></i>
              </div>
            </div>
            <div class="card-body bg-gray-custom">
              <p class="card-title fs-5 text-truncate">${win.title}</p>
              <p class="card-text">Final Bid: <span class="currentBidWon">${
                win._count.bids
              }</span></p>
              <p class="card-text fw-light">Auction Ended: <span class="endTimeWon">${new Date(
                win.endsAt
              ).toLocaleString()}</span></p>
              <a href="#" class="btn btn-success mt-auto w-100 text-primary">View Auction</a>
            </div>
          </div>
        </div>
      `;
    container.innerHTML += html;
  });
}
