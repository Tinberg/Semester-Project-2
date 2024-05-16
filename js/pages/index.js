//---------- Import Styles from index.scss ----------/
import "../../scss/index.scss";

//---------- Import js from modules ----------/
//-- Api for fetch All Listings --> api.js
import { fetchAllListings } from "../modules/api.js";
//-- for searchbar --> searchbar.js
import { initializeSearch } from "../modules/searchbar.js";
//-- for utility functions --> utility.js
import { timeUntil } from "../modules/utility.js";
//-- for description on overlay hover--> utility.js
import { trimText } from "../modules/utility.js";
//-- for map out the highest bid amount--> utility.js
import { getHighestBidAmount } from "../modules/utility.js";

//-- Search function and display listing ending soon and newst
document.addEventListener("DOMContentLoaded", () => {
  initializeSearch(
    "searchForm",
    "searchInput",
    "profiles",
    "listings",
    "searchResultsModal"
  );
  displayEndingSoonListings();
  displayNewestListings();
});

//---------- Helper function to create listing card for last chance and new arrivals ----------//
function createListingCard(listing, cardType) {
  const colDiv = document.createElement("div");
  colDiv.className = "col-md-4 mb-4 card-container";

  const cardLink = document.createElement("a");
  cardLink.href = `/html/listing.html?id=${listing.id}`;
  cardLink.className = "text-decoration-none";
  cardLink.style.color = "inherit";

  const cardDiv = document.createElement("div");
  cardDiv.className = "card text-primary";

  //-- Image container
  const imgContainerDiv = document.createElement("div");
  imgContainerDiv.className = "card-img-top-container position-relative w-100";
  const img = document.createElement("img");
  img.src = listing.media.length
    ? listing.media[0].url
    : "images/no-img-listing.jpg";
  img.alt = listing.media.length ? listing.media[0].alt : "Listing Image";
  img.className = "card-img-top position-absolute w-100 h-100 top-0 start-0";
  imgContainerDiv.appendChild(img);
  cardDiv.appendChild(imgContainerDiv);

  //-- Overlay content visible on hover
  const overlayDiv = document.createElement("div");
  overlayDiv.className =
    "overlay-content position-absolute top-0 start-0 end-0 bottom-0 w-100 h-100 d-flex justify-content-center align-items-center p-2";
  const trimmedDescription = trimText(listing.description, 70);
  const sellerName = listing.seller ? listing.seller.name : "Unknown Seller";
  overlayDiv.innerHTML = `
      <div class="text-center text-break">
        <p class="text-light">${trimmedDescription}</p>
        <p class="text-light fw-bold mb-0">Sold by:</p>
        <p class="text-light text-truncate">${sellerName}</p>
      </div>
    `;
  imgContainerDiv.appendChild(overlayDiv);

  //-- Card body content
  const cardBodyDiv = document.createElement("div");
  cardBodyDiv.className = "card-body bg-gray-custom";
  const titleP = document.createElement("p");
  titleP.className = "card-title fs-5 text-truncate";
  titleP.textContent = listing.title;
  cardBodyDiv.appendChild(titleP);

  //-- Current bid amount
  const highestBidAmount = getHighestBidAmount(listing);
  const currentBidP = document.createElement("p");
  currentBidP.className = "card-text";
  currentBidP.innerHTML = `Current Bid: <span class="currentBid${cardType}">$${highestBidAmount.toFixed(
    2
  )}</span>`;
  cardBodyDiv.appendChild(currentBidP);

  //-- Auction end time
  const endTimeP = document.createElement("p");
  endTimeP.className = "card-text fw-light";
  const auctionIsActive = new Date(listing.endsAt) > new Date();
  endTimeP.innerHTML = auctionIsActive
    ? `Ends in: <span class="endTime${cardType}">${timeUntil(
        listing.endsAt
      )}</span>`
    : "Auction ended";
  cardBodyDiv.appendChild(endTimeP);

  //-- Bid BTN
  const bidButton = document.createElement("div");
  bidButton.className = `btn ${
    auctionIsActive ? "btn-success" : "btn-warning"
  } mt-auto w-100 text-primary`;
  bidButton.textContent = auctionIsActive ? "Bid Now" : "Auction Ended";
  cardBodyDiv.appendChild(bidButton);

  cardDiv.appendChild(cardBodyDiv);
  cardLink.appendChild(cardDiv);
  colDiv.appendChild(cardLink);

  return colDiv;
}

//---------- Function to display listings that are ending soon ----------//
async function displayEndingSoonListings() {
  const container = document.querySelector(".row.ending-soon");
  const loader = document.getElementById("loaderLastChance");
  showLoader(loader);
  try {
    const listings = await fetchAllListings("", "endsAt", "asc", 1, 3, true);
    hideLoader(loader);

    listings.forEach((listing) => {
      const card = createListingCard(listing, "Last");
      container.appendChild(card);
    });
  } catch (error) {
    handleError(error, container);
  }
}

//---------- Function to display the newest listings ----------//
async function displayNewestListings() {
  const container = document.querySelector(".row.newest-listings");
  const loader = document.getElementById("loaderNewArrivals");
  showLoader(loader);
  try {
    const listings = await fetchAllListings("", "created", "desc", 1, 3, true);
    hideLoader(loader);

    listings.forEach((listing) => {
      const card = createListingCard(listing, "New");
      container.appendChild(card);
    });
  } catch (error) {
    handleError(error, container);
  }
}

//--------- Loading and Error Functions ----------//
//-- Handle errors during fetching and displaying listings
function handleError(error, container) {
  console.error("Error loading listings:", error);
  container.innerHTML =
    "<p class='text-danger'>Failed to load listings. Please try again later.</p>";
}

//-- Show the loader (spinner) in the container
function showLoader(loader) {
  loader.style.display = "block";
}
//-- Hide the loader (spinner) in the container
function hideLoader(loader) {
  loader.style.display = "none";
}
