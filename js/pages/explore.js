//---------- Import Styles from explore.scss ----------/
import "../../scss/explore.scss";

//---------- Import js from modules ----------/

//-- Api for fetch All Listings --> api.js
import { fetchAllListings } from "../modules/api.js";
//-- for time until end on auctions--> utility.js
import { timeUntil } from "../modules/utility.js";
//-- for infinite scroll--> utility.js
import { addInfiniteScroll } from "../modules/utility.js";

//Global state for user Category sortby, and pagination
let globalFilter = {
    categoryTag: "", 
    sortOption: "created",
    sortOrder: "desc",
    page: 1, 
    limit: 20,
    allListingsFetched: false,
    active: null
  };
  

document.addEventListener("DOMContentLoaded", displayListings);

async function displayListings() {
    try {
      const listings = await fetchAllListings(
        globalFilter.categoryTag,
        globalFilter.sortOption,
        globalFilter.sortOrder,
        globalFilter.page,
        globalFilter.limit,
        globalFilter.active
      );
    const listingsContainer = document.getElementById("allListings");
    listingsContainer.textContent = "";
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
  } catch (error) {
    console.error("Error loading listings:", error);
  }
}

document.getElementById('sortBy').addEventListener('change', function() {
    const sortValue = this.value;
    switch(sortValue) {
      case 'desc':
        globalFilter.sortOption = 'created';
        globalFilter.sortOrder = 'desc';
        break;
      case 'asc':
        globalFilter.sortOption = 'created';
        globalFilter.sortOrder = 'asc';
        break;
      case 'alpha-asc':
        globalFilter.sortOption = 'title';
        globalFilter.sortOrder = 'asc';
        break;
      case 'alpha-desc':
        globalFilter.sortOption = 'title';
        globalFilter.sortOrder = 'desc';
        break;
    }
    displayListings();
  });


document.querySelectorAll('input[name="filter"]').forEach(input => {
  input.addEventListener('change', function() {
    if (this.value === "All") {
      globalFilter.categoryTag = ""; // Set category tag to empty string for no filter
    } else {
      globalFilter.categoryTag = this.value;
    }
    globalFilter.page = 1; 
    displayListings();
  });
});
document.querySelectorAll('input[name="auctionStatus"]').forEach(input => {
    input.addEventListener('change', function() {
        globalFilter.active = this.value === "Active";
        displayListings();
    });
});
