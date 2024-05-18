//-------------------- Import Styles from global and bootstrap JS --------------------//
import "../scss/global.scss";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
window.bootstrap = bootstrap;

// ------------------ Import Navbar Initialization Function ------------------//
//-- Initializes the navbar dynamically based on user authentication status
import { initUserNavbar } from "./modules/navbar.js";
//-- Create new Listing
import { setupNewListingForm } from "./modules/navbar.js";

//-------------------- Initializations --------------------//
document.addEventListener("DOMContentLoaded", function () {
  initUserNavbar(); //-- Initializes the navbar dynamically based on user authentication status. --> modules/navbar.js
  setupNewListingForm(); //-- Initializes create new listing form --> modules/nabar.js
});
