//---------- Import Styles from listing.scss ----------/
import "../../scss/listing.scss";

//---------- Import js from modules ----------/
//-- GetToken to --> auth.js
import { getToken } from "../modules/auth.js";
//-- Api for fetch specific listing --> api.js
import { fetchListingById } from "../modules/api.js";
//-- Api for bid on listing --> api.js
import { sendBid } from "../modules/api.js";
//-- Api for update listing --> api.js
import { updateListing } from "../modules/api.js";
//-- Api for delete listing --> api.js
import { deleteListing } from "../modules/api.js";
//-- For show time since bid was made --> utility.js
import { timeSince } from "../modules/utility.js";
//-- For map out the highest bid amount --> utility.js
import { getHighestBidAmount } from "../modules/utility.js";


//----------  URL parameters and listing ID ----------//
const urlParams = new URLSearchParams(window.location.search);
const listingId = urlParams.get("id");
//-- Error message element
const errorMessageElement = document.getElementById("idErrorMessage");
//-- global getToken for Auth(different layout)
const token = getToken();

//---------- Check for listing ID from the URL on page load ----------//
document.addEventListener("DOMContentLoaded", function () {
  if (!listingId) {
    console.error("No listing ID provided in the URL.");
    errorMessageElement.textContent =
      "The URL is missing a valid listing ID. Please ensure the link is correct and try again, or return to the homepage.";
    return;
  }
  //---------- Call fetchListingById with both includeSeller and includeBids set to true ----------//
  fetchListingById(listingId, true, true)
    .then((data) => {
      displayListingDetails(data);
      if (data.seller) displaySellerInfo(data.seller);
      if (data.bids) displayBidHistory(data.bids);
    })
    .catch((error) => {
      console.error("Failed to load the listing data:", error);
      errorMessageElement.textContent =
        "We encountered an issue loading the listing details. Some parts of this page may not display correctly. Please refresh the page or try again later.";
    });
});
//---------- Display listing Details ----------//
function displayListingDetails(listing) {
  const loggedInUserName = localStorage.getItem("userName"); //-- To check if its the same as the listing (disable bid btn)

  //--Image
  const imageUrl =
    listing.media && listing.media.length > 0
      ? listing.media[0].url
      : "/images/no-img-listing.jpg";
  const imageAlt =
    listing.media && listing.media.length > 0 && listing.media[0].alt
      ? listing.media[0].alt
      : "Listing image";

  document.getElementById("listingImg").src = imageUrl;
  document.getElementById("listingImg").alt = imageAlt;

  //-- Title
  document.getElementById("listingTitleDisplay").textContent =
    listing.title || "No title available";

  //-- Description
  document.getElementById("listingDescriptionDisplay").textContent =
    listing.description || "No description available";

  //-- Highest Bid
  const highestBid = getHighestBidAmount(listing);
  document.getElementById("listing-bids").textContent = `$${highestBid.toFixed(
    2
  )}`;

  //-- Bid button and login message container selectors
  const bidButton = document.getElementById("bidBtn");
  const loginMessageContainer = document.getElementById(
    "loginMessageContainer"
  );

  //-- Determine if the auction has ended
  const endTime = new Date(listing.endsAt);
  const now = new Date();
  const auctionEnded = endTime < now;
  const endsInDisplay = document.getElementById("listing-endsIn").parentNode;

  if (auctionEnded) {
    endsInDisplay.textContent = "Auction Ended";
    endsInDisplay.classList.add("text-danger", "fs-5");
    endsInDisplay.classList.remove("text-normal");
    bidButton.disabled = true;
  } else {
    endsInDisplay.classList.remove("text-danger");
    endsInDisplay.classList.add("text-normal");
    endsInDisplay.innerHTML = "Ends in: <span id='listing-endsIn'></span>";
    startCountdown(listing.endsAt, "listing-endsIn");
  }
  if (listing.seller && loggedInUserName === listing.seller.name) {
    bidButton.disabled = true;
    displayEditIcon(listing); // Call to display the edit icon
  }

  //-- Handle login state for bidding
  if (!token) {
    //-- User is not logged in, disable the bid button and show a message.
    bidButton.disabled = true;
    if (loginMessageContainer) {
      const listingId = listing.id;
      loginMessageContainer.innerHTML = `
            <p>Please <a href="login.html?redirect=${listingId}" class="fw-bold text-secondary">log in</a> or <a href="register.html" class="fw-bold text-secondary">sign up</a> to participate in auctions, view sellers, or access bid history profiles.</p>
        `;
      loginMessageContainer.style.display = "block";
    }
  } else {
    // User logged in (auction not ended or loggedin is not seller display bid btn)
    if (
      !auctionEnded &&
      !(listing.seller && loggedInUserName === listing.seller.name)
    ) {
      bidButton.disabled = false;
      bidButton.style.display = "block";
    }
  }
}

//---------- Display Seller and Info ----------//
function displaySellerInfo(seller) {
  document.getElementById("sellerImg").src = seller.avatar.url;
  document.getElementById("seller").textContent = seller.name;
  document.getElementById("sellerEmail").textContent = seller.email;
  const sellerInfoDiv = document.getElementById("sellerDiv");
  if (!token) {
    sellerInfoDiv.style.cursor = "default";
  } else {
    sellerInfoDiv.style.cursor = "pointer";
    sellerInfoDiv.addEventListener("click", () => {
      const currentUser = localStorage.getItem("userName");
      const profileUrl =
        seller.name === currentUser
          ? "/html/my-profile.html"
          : `/html/profile.html?userName=${encodeURIComponent(seller.name)}`;
      window.location.href = profileUrl;
    });
  }
}

//---------- Helper function for Bid History for listing ----------//
//-- Creates HTML for a bid item
function createBidHtml(bid, isAuthenticated) {
  const bidderNameHtml = isAuthenticated
    ? `<a href="#" class="text-hover text-decoration-none cursor-pointer">${bid.bidder.name}</a>`
    : `<span>${bid.bidder.name}</span>`;

  return `
    <li class="d-flex border-bottom border-primary py-2">
      <div class="bidName col-4 text-start" aria-label="Bidder Name">${bidderNameHtml}</div>
      <div class="bidTime col-4 text-center" aria-label="Time of Bid">${timeSince(
        bid.created
      )}</div>
      <div class="bidAmount col-4 text-end" aria-label="Bid Amount">$${bid.amount.toFixed(
        2
      )}</div>
    </li>
  `;
}
//-- Redirection to profile pages
function addProfileRedirectionListeners(container, isAuthenticated) {
  if (isAuthenticated) {
    container.querySelectorAll("a").forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        event.preventDefault();
        const bidderName = anchor.textContent;
        const currentUser = localStorage.getItem("userName");
        const profileUrl =
          bidderName === currentUser
            ? "/html/my-profile.html"
            : `/html/profile.html?userName=${encodeURIComponent(bidderName)}`;
        window.location.href = profileUrl;
      });
    });
  }
}

//---------- Display bid History for listing and showMoreBtn ----------//
//-- (including anchor tag around userName if Token is in localStorage)
function displayBidHistory(bids) {
  console.log("All bids fetched from the API:", bids);
  const bidHistoryElement = document.getElementById("bidHistory");
  const bidHistoryHeader = document.getElementById("bidHistoryHeader");

  if (bidHistoryHeader.children.length > 1) {
    bidHistoryHeader.removeChild(bidHistoryHeader.children[1]);
  }

  //-- This displays the total number of bids in ()
  const countSpan = document.createElement("span");
  countSpan.className = "fw-normal ms-1";
  countSpan.textContent = `(${bids.length})`;
  bidHistoryHeader.appendChild(countSpan);

  //-- If no Bids
  if (bids.length === 0) {
    bidHistoryElement.innerHTML = `<p class="text-lg-start text-center">No bids have been placed on this listing yet.</p>`;
  } else {
    //-- Sort bids by date and display the first 10.
    bids.sort((a, b) => new Date(b.created) - new Date(a.created));

    let bidsHtml = bids
      .slice(0, 10)
      .map((bid) => createBidHtml(bid, token))
      .join("");
    bidHistoryElement.innerHTML = bidsHtml;

    //-- Add event listeners for redirection
    addProfileRedirectionListeners(bidHistoryElement, token);

    //-- Append 'Show More' button if there are more than 10 bids.
    if (bids.length > 10) {
      const showMoreButton = document.createElement("button");
      showMoreButton.textContent = "Show More";
      showMoreButton.className = "btn btn-primary mt-4";
      showMoreButton.onclick = () => showMoreBids(bids, bidHistoryElement);
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "d-flex justify-content-center w-100";
      buttonContainer.appendChild(showMoreButton);
      bidHistoryElement.appendChild(buttonContainer);
    }
  }
}
//-- Show all bids when the "Show More" button is clicked (including anchor tag around userName if Token is in localStorage)
function showMoreBids(bids, container) {
  let allBidsHtml = bids.map((bid) => createBidHtml(bid, token)).join("");
  container.innerHTML = allBidsHtml;

  //-- Add event listeners for redirection
  addProfileRedirectionListeners(container, token);
}

//---------- Countdown for Auction ending (Unique to listing.js) ----------//
function startCountdown(endsAt, elementId) {
  let interval;
  const updateCountdown = () => {
    const endTime = new Date(endsAt).getTime();
    const now = new Date().getTime();
    const timeLeft = endTime - now;

    if (timeLeft <= 0) {
      document.getElementById(elementId).textContent = "Auction ended";
      document.getElementById(elementId).className = "text-danger";
      clearInterval(interval);
      return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const formattedTime = `${days.toString().padStart(2, "0")}d ${hours
      .toString()
      .padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds
      .toString()
      .padStart(2, "0")}s`;
    document.getElementById(elementId).textContent = formattedTime;
  };

  updateCountdown();
  interval = setInterval(updateCountdown, 1000);
}

//---------- Bid on Listing ----------//
document
  .getElementById("bidBtn")
  .addEventListener("click", async function (event) {
    event.preventDefault();
    const bidAmountInput = parseFloat(
      document.querySelector('input[type="number"]').value
    );
    const currentHighestBid = parseFloat(
      document.getElementById("listing-bids").textContent.replace("$", "")
    );
    //-- Validate the bid amount is a number and greater than zero
    if (isNaN(bidAmountInput) || bidAmountInput <= 0) {
      errorMessageElement.textContent = "Please enter a valid bid amount.";

      return;
    }
    //-- Validate bid is higher than the current highest bid
    if (bidAmountInput <= currentHighestBid) {
      errorMessageElement.textContent =
        "Your bid must be higher than the current highest bid.";

      return;
    }
    //-- Confirmation dialog to confirm the bid
    const confirmBid = confirm(
      `Are you sure you want to bid $${bidAmountInput.toFixed(2)}?`
    );
    if (!confirmBid) {
      return;
    }
    //-- Submit bid
    try {
      const bidResponse = await sendBid(listingId, bidAmountInput);
      const formattedBidAmount = bidAmountInput.toFixed(2);
      //--Reload to show bid history and give alert with the submitted value.
      window.location.reload();
      alert(
        `Bid successfully submitted! You bid $${formattedBidAmount}. You can view bid history under the 'Bid History' section on this listing or in your profile under 'Bidding Activity'.`
      );
      console.log("Bid Response:", bidResponse);
    } catch (error) {
      console.error("Failed to submit bid:", error);
      errorMessageElement.textContent =
        "Failed to submit bid: Please ensure your bid is a whole number, check your internet connection, and try again.";
    }
  });

//---------- Edit Listing ----------//

//-- Display the edit icon if the user is the seller --//
function displayEditIcon(listing) {
  const editIcon = document.createElement("i");
  editIcon.className =
    "fa-regular fa-pen-to-square fs-3 text-primary  position-absolute top-0 end-0 pe-2 pt-1 ";
  editIcon.style.cursor = "pointer";
  editIcon.title = "Edit Listing";
  editIcon.setAttribute("data-bs-toggle", "tooltip");
  editIcon.setAttribute("data-bs-placement", "top");
  editIcon.setAttribute("title", "Edit Listing");

  //-- Bootstrap tooltip
  new bootstrap.Tooltip(editIcon);

  editIcon.addEventListener("click", () => {
    openEditListingModal(listing);
  });

  const iconContainer = document.querySelector("#iconContainer");
  iconContainer.appendChild(editIcon);
}
//-- Open the Edit Listing Modal and populate with current data
function openEditListingModal(listing) {
  const editListingModal = new bootstrap.Modal(
    document.getElementById("editListingModal")
  );
  document.getElementById("editListingImage").value =
    listing.media[0]?.url || "";
  document.getElementById("editAltText").value = listing.media[0]?.alt || "";
  document.getElementById("editListingTitle").value = listing.title || "";
  document.getElementById("editListingDescription").value =
    listing.description || "";
  //-- Category
  const categorySelect = document.getElementById("editCategorySelect");
  const currentCategory =
    listing.tags && listing.tags.length > 0 ? listing.tags[0] : "";
  categorySelect.value = currentCategory;

  updateEditFeedbacks();
  editListingModal.show();
}

//---------- Save changes made in the input for update Listing (API) ----------//
document
  .getElementById("saveListingChanges")
  .addEventListener("click", async () => {
    const title = document.getElementById("editListingTitle").value;
    const description = document.getElementById("editListingDescription").value;
    const category = document.getElementById("editCategorySelect").value;
    const imageUrl = document.getElementById("editListingImage").value;
    const altText = document.getElementById("editAltText").value;

    const errorFeedback = document.getElementById("editErrorFeedback");
    errorFeedback.style.display = "none";

    // Initialize error message accumulator
    const errorMessageEditListing = "Failed to edit Listing. Include a title and ensure it, along with description, are under 280 characters. If adding an image, descriptions should be under 120 characters and URLs must start with 'http://' or 'https://'. Adjust and retry.";
    let hasError = false;

    // Validation checks
    if (!title) {
      hasError = true;
    }
    if (title.length > 280) {
      hasError = true;
    }
    if (description.length > 280) {
      hasError = true;
    }
    if (altText.length > 120) {
      hasError = true;
    }
    if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
      hasError = true;
    }

    if (hasError) {
      errorFeedback.textContent = errorMessageEditListing;
      errorFeedback.style.display = "block";
      return;
    }

    const updatedData = {
      title,
      description,
      tags: [category],
      media: [
        {
          url: imageUrl,
          alt: altText,
        },
      ],
    };

    try {
      await updateListing(listingId, updatedData);
      window.location.reload();
    } catch (error) {
      console.error("Error updating listing:", error);
      errorFeedback.textContent =
        "Failed to update the listing. Please check your internet connection and try again later.";
      errorFeedback.style.display = "block";
    }
  });
//---------- Functions to update feedback for inputs dynamically ---------//
function updateEditFeedbacks() {
  updateEditTitleFeedback();
  updateEditDescriptionFeedback();
  updateEditAltTextFeedback();
}
//-- Update title characterCount
function updateEditTitleFeedback() {
  const title = document.getElementById("editListingTitle").value;
  const feedback = document.getElementById("editTitleFeedback");
  feedback.textContent = `${title.length}/280 characters`;
  feedback.classList.toggle("text-danger", title.length > 280);
}
//-- update description characterCount
function updateEditDescriptionFeedback() {
  const description = document.getElementById("editListingDescription").value;
  const feedback = document.getElementById("editDescriptionFeedback");
  feedback.textContent = `${description.length}/280 characters`;
  feedback.classList.toggle("text-danger", description.length > 280);
}
//-- Update alt text characterCount
function updateEditAltTextFeedback() {
  const altText = document.getElementById("editAltText").value;
  const feedback = document.getElementById("editAltTextFeedback");
  feedback.textContent = `${altText.length}/120 characters`;
  feedback.classList.toggle("text-danger", altText.length > 120);
}
//-- Event listeners for live feedback in edit modal
document
  .getElementById("editListingTitle")
  .addEventListener("input", updateEditTitleFeedback);
document
  .getElementById("editListingDescription")
  .addEventListener("input", updateEditDescriptionFeedback);
document
  .getElementById("editAltText")
  .addEventListener("input", updateEditAltTextFeedback);

//---------- Delete the listing ----------//
document
  .getElementById("deleteListingButton")
  .addEventListener("click", async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this listing?"
    );
    if (!confirmDelete) return;

    try {
      await deleteListing(listingId);
      window.location.href = "/html/my-profile.html";
    } catch (error) {
      console.error("Error deleting listing:", error);
      document.getElementById("deleteErrorFeedback").textContent =
        "Failed to delete the listing. Please try again. If the issue persists, it may be due to a temporary problem. You can refresh the page and attempt to delete the listing again. If the problem continues, please contact support for further assistance.";
    }
  });
