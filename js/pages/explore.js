//---------- Import Styles from explore.scss ----------/
import "../../scss/explore.scss";

//---------- Import js from modules ----------/

//-- Api for fetch All Listings --> api.js
import { fetchAllListings } from "../modules/api.js";
//-- Api for fetch Profile Search --> api.js
import { fetchProfilesSearch } from "../modules/api.js";
//-- Api for  fetch Listing Search --> api.js
import { fetchListingsSearch } from "../modules/api.js";
//-- for time until end on auctions--> utility.js
import { timeUntil } from "../modules/utility.js";
//-- for infinite scroll--> utility.js
import { addInfiniteScroll } from "../modules/utility.js";

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
  // Call functions related to display listings
  displayListings();
  setupInfiniteScroll();

  // Call functions related to search functionality

});

//-- Display listings and handle pagination
async function displayListings(append = false) {
  const listingsContainer = document.getElementById("allListings");
  const exploreMessage = document.querySelector(".explore-message");
  const exploreError = document.querySelector(".explore-error");

  if (globalFilter.isLoading) return;
  globalFilter.isLoading = true;

  try {
    const listings = await fetchAllListings(
      globalFilter.categoryTag,
      globalFilter.sortOption,
      globalFilter.sortOrder,
      globalFilter.page,
      globalFilter.limit,
      globalFilter.active
    );

    if (!append) {
      listingsContainer.textContent = "";
    }
    console.log(listings);
    listings.forEach((listing) => {
      const colDiv = document.createElement("div");
      colDiv.className = "col-lg-4 col-sm-6 mb-4";

      const cardDiv = document.createElement("div");
      cardDiv.className = "card text-primary";

      const imgContainerDiv = document.createElement("div");
      imgContainerDiv.className =
        "card-img-top-container position-relative w-100";

      const img = document.createElement("img");
      img.className =
        "card-img-top position-absolute w-100 h-100 top-0 start-0";
      img.src =
        listing.media && listing.media.length > 0
          ? listing.media[0].url
          : "/images/no-img-listing.jpg";
      img.alt =
        listing.media && listing.media.length > 0
          ? listing.media[0].alt
          : "Listing Image";
      imgContainerDiv.appendChild(img);

      const cardBodyDiv = document.createElement("div");
      cardBodyDiv.className = "card-body bg-gray-custom";

      const titleP = document.createElement("p");
      titleP.className = "card-title fs-5 text-truncate";
      titleP.textContent = listing.title;
      cardBodyDiv.appendChild(titleP);

      const currentBidP = document.createElement("p");
      currentBidP.className = "card-text";
      currentBidP.innerHTML = `Current Bid: <span class="currentBid">$${listing._count.bids}</span>`;
      cardBodyDiv.appendChild(currentBidP);

      const endTimeP = document.createElement("p");
      endTimeP.className = "card-text fw-light";
      endTimeP.innerHTML = `Ends in: <span class="endTime">${timeUntil(
        listing.endsAt
      )}</span>`;
      cardBodyDiv.appendChild(endTimeP);

      const bidButton = document.createElement("a");
      bidButton.href = "#";
      bidButton.className = "btn btn-success mt-auto w-100 text-primary";
      bidButton.textContent = "Bid Now";
      cardBodyDiv.appendChild(bidButton);

      cardDiv.appendChild(imgContainerDiv);
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
  } finally {
    globalFilter.isLoading = false;
  }
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
    console.log("Infinite Scroll is already initialized.");
  }
}

//---------- Reset infinite scroll setup ----------//
function resetInfiniteScroll() {
  globalFilter.infiniteScrollInitialized = false;
}

//---------- SearchBar ----------//

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const profilesContainer = document.getElementById('profiles');
    const listingsContainer = document.getElementById('listings');
    const searchResultsModal = new bootstrap.Modal(document.getElementById('searchResultsModal'));

    searchForm.addEventListener('submit', async (event) => {
        console.log("Form submitted");
        event.preventDefault();
        const query = searchInput.value.trim();
        console.log("Search query:", query);
        if (query) {
            await searchProfiles(query);
            await searchListings(query);
            searchResultsModal.show(); 
        }
    });

    async function searchProfiles(query) {
        console.log("Searching profiles for:", query);
        try {
            const response = await fetchProfilesSearch(query);
            console.log("Profiles found:", response);
            profilesContainer.innerHTML = '';
            response.data.forEach(profile => {
                const profileDiv = document.createElement('div');
                profileDiv.className = 'profile-result';
                profileDiv.innerHTML = `
                    <p>Name: ${profile.name}</p>
                    <p>Location: ${profile.location}</p>
                `;
                profilesContainer.appendChild(profileDiv);
            });
        } catch (error) {
            console.error("Error fetching profiles:", error);
            profilesContainer.innerHTML = `<p>Error fetching profiles: ${error.message}</p>`;
        }
    }

    async function searchListings(query) {
        console.log("Searching listings for:", query);
        try {
            const response = await fetchListingsSearch(query);
            console.log("Listings found:", response);
            listingsContainer.innerHTML = '';
            response.data.forEach(listing => {
                const listingDiv = document.createElement('div');
                listingDiv.className = 'listing-result';
                listingDiv.innerHTML = `
                    <p>Title: ${listing.title}</p>
                    <p>Price: $${listing.price}</p>
                `;
                listingsContainer.appendChild(listingDiv);
            });
        } catch (error) {
            console.error("Error fetching listings:", error);
            listingsContainer.innerHTML = `<p>Error fetching listings: ${error.message}</p>`;
        }
    }
});
