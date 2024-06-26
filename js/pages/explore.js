//---------- Import Styles from explore.scss ----------/
import "../../scss/explore.scss";

//---------- Import js from modules ----------/
//-- Api for fetch All Listings --> api.js
import { fetchAllListings } from "../modules/api.js";
//-- for searchbar --> searchbar.js
import { initializeSearch } from "../modules/searchbar.js";
//-- for time until end on auctions--> utility.js
import { timeUntil } from "../modules/utility.js";
//-- for description on overlay hover--> utility.js
import { trimText } from "../modules/utility.js";
//-- for infinite scroll--> utility.js
import { addInfiniteScroll } from "../modules/utility.js";
//-- for map out the highest bid amount--> utility.js
import { getHighestBidAmount } from "../modules/utility.js";

//---------- Global state for user category, sorting, pagination, and loading state ----------//
let globalFilter = {
  categoryTag: "",
  sortOption: "created",
  sortOrder: "desc",
  page: 1,
  limit: 20,
  allListingsFetched: false,
  active: null,
  isLoading: false,
  infiniteScrollInitialized: false,
};

//---------- Event listeners and initial setup ----------//
document.addEventListener("DOMContentLoaded", function () {
  //-- Read query parameters (set right category from index.html)
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  //-- Set the category filter and check the corresponding radio button (if clicked from index.html)
  if (category) {
    globalFilter.categoryTag = category;
    const categoryRadio = document.querySelector(
      `input[name="filter"][value="${category}"]`
    );
    if (categoryRadio) {
      categoryRadio.checked = true;
    }
  }

  //-- Call functions related to display listings
  displayListings();
  setupInfiniteScroll();

  //-- Searchbar function from searchbar.js
  initializeSearch(
    "searchForm",
    "searchInput",
    "profiles",
    "listings",
    "searchResultsModal"
  );

  //-- Reset filters and sortBy on page reload
  window.addEventListener("pageshow", function () {
    //-- Reset the "Sort by" dropdown to 'Newest'
    const sortBySelect = document.getElementById("sortBy");
    sortBySelect.value = "desc";

    //-- Reset the "All Auctions" radio button
    const allAuctionsRadio = document.getElementById("allAuctions");
    allAuctionsRadio.checked = true;

    //-- Reset the "All Categories" radio button only if no category is specified in the URL(clicked from Index)
    if (!category) {
      const noFilterRadio = document.getElementById("noFilter");
      noFilterRadio.checked = true;
    } else {
      //-- Set the category radio button based on the URL parameter
      const categoryRadio = document.querySelector(
        `input[name="filter"][value="${category}"]`
      );
      if (categoryRadio) {
        categoryRadio.checked = true;
      }
    }
  });
});

//---------- Display listings and handle pagination ----------//
async function displayListings(append = false) {
  const listingsContainer = document.getElementById("allListings");
  const exploreMessage = document.querySelector(".explore-message");
  const exploreError = document.querySelector(".explore-error");
  const loader = document.getElementById("loader");

  if (globalFilter.isLoading) return;
  globalFilter.isLoading = true;
  loader.style.display = "block";

  try {
    const listings = await fetchAllListings(
      globalFilter.categoryTag,
      globalFilter.sortOption,
      globalFilter.sortOrder,
      globalFilter.page,
      globalFilter.limit,
      globalFilter.active
    );

    loader.style.display = "none";

    if (!append) {
      listingsContainer.innerHTML = "";
    }
    console.log(listings);
    listings.forEach((listing) => {
      const colDiv = document.createElement("div");
      colDiv.style.cursor = "pointer";
      colDiv.className = "col-lg-4 col-sm-6 mb-4 card-container";

      const cardDiv = document.createElement("div");
      cardDiv.className = "card text-primary";
      cardDiv.setAttribute("role", "link");
      cardDiv.setAttribute("tabindex", "0");
      cardDiv.setAttribute(
        "aria-label",
        `View auction details for ${listing.title}`
      );

      //-- Click event on Card to take the user to listing.html with the right auction
      cardDiv.addEventListener("click", () => {
        window.location.href = `listing.html?id=${listing.id}`;
      });

      //-- Image container with hover overlay
      const imgContainerDiv = createImageOverlay(listing);
      cardDiv.appendChild(imgContainerDiv);

      //-- Card body
      const cardBodyDiv = createCardBody(listing);
      cardDiv.appendChild(cardBodyDiv);

      colDiv.appendChild(cardDiv);
      listingsContainer.appendChild(colDiv);
    });

    if (listings.length < globalFilter.limit) {
      globalFilter.allListingsFetched = true;
      exploreMessage.textContent = "No more listings. Back to Top";
    } else {
      globalFilter.page++;
    }
  } catch (error) {
    console.error("Error loading listings:", error);
    exploreError.textContent =
      "Failed to load listings. Please check your network settings and try refreshing the page.";
    loader.style.display = "none";
  } finally {
    globalFilter.isLoading = false;
  }
}

//---------- Image and Image Overlay ----------//
function createImageOverlay(listing) {
  const imgContainerDiv = document.createElement("div");
  imgContainerDiv.className = "card-img-top-container position-relative w-100";
  //--
  const img = document.createElement("img");
  img.className = "card-img-top position-absolute w-100 h-100 top-0 start-0";
  img.src =
    listing.media && listing.media.length > 0
      ? listing.media[0].url
      : "/images/no-img-listing.jpg";
  img.alt =
    listing.media && listing.media.length > 0
      ? listing.media[0].alt
      : "Listing Image";
  imgContainerDiv.appendChild(img);

  //---------- Overlay div only visible on hover ----------//
  const overlayDiv = document.createElement("div");
  overlayDiv.className =
    "overlay-content position-absolute top-0 start-0 end-0 bottom-0 w-100 h-100 d-flex justify-content-center align-items-center p-2";
  //-- Truncate the description to fit layout
  const trimmedDescription = trimText(listing.description, 100);
  //-- SellerName
  const sellerName = listing.seller ? listing.seller.name : "Unknown Seller";
  //-- Structure
  overlayDiv.innerHTML = `
      <div class="text-center text-break">
        <p class="text-light">${trimmedDescription}</p>
        <p class="text-light fw-bold  mb-0">Sold by:</p>
        <p class="text-light text-truncate">${sellerName}</p>
      </div>
    `;

  imgContainerDiv.appendChild(overlayDiv);

  return imgContainerDiv;
}
//---------- Card Body ----------//
function createCardBody(listing) {
  const cardBodyDiv = document.createElement("div");
  cardBodyDiv.classList.add("card-body", "bg-gray-custom");

  //-- Title
  const titleP = document.createElement("p");
  titleP.classList.add("card-title", "fs-5", "text-truncate");
  titleP.textContent = listing.title;
  cardBodyDiv.appendChild(titleP);

  //-- Highest Bid
  const highestBidAmount = getHighestBidAmount(listing);
  const highestBidP = document.createElement("p");
  highestBidP.classList.add("card-text");
  highestBidP.innerHTML = `Current Bid: <span class="highestBid">$${highestBidAmount.toFixed(
    2
  )}</span>`;
  cardBodyDiv.appendChild(highestBidP);

  //-- End Time
  const endTimeP = document.createElement("p");
  endTimeP.classList.add("card-text", "fw-light");
  const auctionIsActive = new Date(listing.endsAt) > new Date();

  if (auctionIsActive) {
    endTimeP.textContent = `Ends in: ${timeUntil(listing.endsAt)}`;
  } else {
    endTimeP.textContent = "Auction ended";
  }

  cardBodyDiv.appendChild(endTimeP);

  //-- Visual "View Auction/Auction Ended" btn. success if active and warning if ended.
  const viewAuctionVisual = document.createElement("div");
  viewAuctionVisual.className = `btn ${
    auctionIsActive ? "btn-success" : "btn-warning"
  } mt-2 w-100 text-primary`;
  viewAuctionVisual.textContent = auctionIsActive
    ? "View Auction"
    : "Auction Ended";
  cardBodyDiv.appendChild(viewAuctionVisual);

  return cardBodyDiv;
}

//---------- Utility function for sorting and filtering ----------//
function resetAndFetchListings() {
  globalFilter.page = 1;
  globalFilter.allListingsFetched = false;
  displayListings();
  resetInfiniteScroll();
  setupInfiniteScroll();
}

//---------- Sort by ----------//
document.getElementById("sortBy").addEventListener("change", function () {
  const sortValue = this.value;
  switch (sortValue) {
    case "desc":
      globalFilter.sortOption = "created";
      globalFilter.sortOrder = "desc";
      break;
    case "asc":
      globalFilter.sortOption = "created";
      globalFilter.sortOrder = "asc";
      break;
    case "alpha-asc":
      globalFilter.sortOption = "title";
      globalFilter.sortOrder = "asc";
      break;
    case "alpha-desc":
      globalFilter.sortOption = "title";
      globalFilter.sortOrder = "desc";
      break;
  }
  resetAndFetchListings();
});

//---------- Filter ----------//
document
  .querySelectorAll('input[name="filter"], input[name="auctionStatus"]')
  .forEach((input) => {
    input.addEventListener("change", () => {
      const category = document.querySelector(
        'input[name="filter"]:checked'
      ).value;
      const active = document.querySelector(
        'input[name="auctionStatus"]:checked'
      ).value;
      globalFilter.categoryTag = category === "All" ? "" : category;
      globalFilter.active = active === "Active";
      resetAndFetchListings();
    });
  });

//---------- Infinite scroll setup ----------//
function setupInfiniteScroll() {
  if (!globalFilter.infiniteScrollInitialized) {
    addInfiniteScroll(async () => {
      if (!globalFilter.allListingsFetched && !globalFilter.isLoading) {
        await displayListings(true);
      }
    });
    globalFilter.infiniteScrollInitialized = true;
  } else {
  }
}

//---------- Reset infinite scroll setup ----------//
function resetInfiniteScroll() {
  globalFilter.infiniteScrollInitialized = false;
}
