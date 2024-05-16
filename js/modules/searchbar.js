//---------- Import js from modules ----------/

//-- Api for fetch profile and lisiting search --> api.js
import { fetchProfilesSearch, fetchListingsSearch } from "./api.js";
//-- For map out the highest bid amount --> utility.js
import { getHighestBidAmount } from "./utility.js";
//-- GetToken to --> auth.js
import { getToken } from "./auth.js";

//-- For search listings and profiles --> index.js and explore.js
export { initializeSearch };

//---------- SearchBar ----------//
//--global getToken for Auth--//
const token = getToken();

function initializeSearch() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const profilesContainer = document.getElementById("profiles");
  const listingsContainer = document.getElementById("listings");
  const searchResultsModal = new bootstrap.Modal(
    document.getElementById("searchResultsModal")
  );
  const searchLoaderModal = new bootstrap.Modal(
    document.getElementById("searchLoaderModal")
  );

  const minLoaderTime = 500; // Minimum display time for the loader in milliseconds

  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      searchLoaderModal.show();
      const startTime = Date.now();

      try {
        await Promise.all([searchListings(query), searchProfiles(query)]);
      } catch (error) {
        console.error("Error during search:", error);
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = minLoaderTime - elapsedTime;

        setTimeout(() => {
          searchLoaderModal.hide();
          searchResultsModal.show();
        }, Math.max(0, remainingTime));
      }
    }
  });
  
  //---------- Search Profiles ----------//
  async function searchProfiles(query) {
    try {
      const response = await fetchProfilesSearch(query);
      profilesContainer.innerHTML = "";

      if (response.data.length === 0) {
        const noResultMsg = document.createElement("p");
        noResultMsg.textContent =
          "No profiles found matching your search criteria.";
        profilesContainer.appendChild(noResultMsg);
      } else {
        const profileList = document.createElement("ul");
        profileList.className = "list-group";

        response.data.forEach((profile) => {
          const listItem = document.createElement("li");
          listItem.className =
            "list-group-item profile-result d-flex align-items-center search-item";
          listItem.style.cursor = "pointer";
          //-- Profile Img
          const img = document.createElement("img");
          img.src = profile.avatar.url;
          img.alt = profile.avatar.alt || "Profile Image";
          img.className = "rounded-circle-bottom searchImg me-3";
          //-- Profile Name
          const nameParagraph = document.createElement("p");
          nameParagraph.className = "m-0";
          nameParagraph.textContent = profile.name;

          listItem.appendChild(img);
          listItem.appendChild(nameParagraph);
          profileList.appendChild(listItem);

          //-- Add event listener for redirection to profile or my-profile if its the logged in users name
          listItem.addEventListener("click", () => {
            const currentUser = localStorage.getItem("userName");
            const profileUrl =
              profile.name === currentUser
                ? "/html/my-profile.html"
                : `/html/profile.html?userName=${encodeURIComponent(
                    profile.name
                  )}`;
            window.location.href = profileUrl;
          });
        });

        profilesContainer.appendChild(profileList);
      }
    } catch (error) {
      //-- Display login/register message if user is not logged in or error message
      console.error("Error fetching profiles:", error);
      profilesContainer.innerHTML = "";

      if (!token) {
        profilesContainer.textContent = "Please ";

        const loginLink = document.createElement("a");
        loginLink.href = "/html/login.html";
        loginLink.textContent = "log in";
        loginLink.className = "fw-bold text-secondary";

        const registerLink = document.createElement("a");
        registerLink.href = "/html/register.html";
        registerLink.textContent = "Sign up";
        registerLink.className = "fw-bold text-secondary";

        profilesContainer.appendChild(loginLink);
        profilesContainer.appendChild(document.createTextNode(" or "));
        profilesContainer.appendChild(registerLink);
        profilesContainer.appendChild(
          document.createTextNode(" to view profiles.")
        );
      } else {
        profilesContainer.textContent =
          "We're unable to fetch profiles at the moment. Please try again later.";
        profilesContainer.classList.add("text-danger");
      }
    }
  }
  //---------- Search Listings ----------//
  async function searchListings(query) {
    try {
      const response = await fetchListingsSearch(query);
      listingsContainer.innerHTML = "";

      if (response.data.length === 0) {
        const noResultMsg = document.createElement("p");
        noResultMsg.textContent =
          "No listings found matching your search criteria.";
        listingsContainer.appendChild(noResultMsg);
      } else {
        const listingList = document.createElement("ul");
        listingList.className = "list-group";

        response.data.forEach((listing) => {
          const listItem = document.createElement("li");
          listItem.className =
            "list-group-item listing-result d-flex align-items-center search-item";
          listItem.style.cursor = "pointer";
          //-- Go to listing.html with the right id
          listItem.addEventListener("click", () => {
            window.location.href = `/html/listing.html?id=${listing.id}`;
          });
          //-- Listing img
          const img = document.createElement("img");
          img.src =
            listing.media && listing.media.length > 0
              ? listing.media[0].url
              : "/images/no-img-listing.jpg";
          img.alt =
            listing.media && listing.media.length > 0
              ? listing.media[0].alt
              : "Listing Image";
          img.className = "rounded me-3 searchImg";
          //- container for text
          const textDiv = document.createElement("div");
          textDiv.className = "text-truncate";
          //-- Title
          const titleParagraph = document.createElement("p");
          titleParagraph.className = "m-0";
          titleParagraph.textContent = listing.title;
          //-- Highest Bid
          const bidSmall = document.createElement("small");
          bidSmall.className = "text-muted m-0";
          const highestBidAmount = getHighestBidAmount(listing);
          bidSmall.textContent = `Current bid: $${highestBidAmount.toFixed(2)}`;

          textDiv.appendChild(titleParagraph);
          textDiv.appendChild(bidSmall);

          listItem.appendChild(img);
          listItem.appendChild(textDiv);
          listingList.appendChild(listItem);
        });

        listingsContainer.appendChild(listingList);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      listingsContainer.textContent =
        "We're unable to fetch listings at the moment. Please try again later.";
      listingsContainer.classList.add("text-danger");
    }
  }
}
