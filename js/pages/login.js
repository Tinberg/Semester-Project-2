//---------- Import Styles from loginRegister.scss ----------/
import "../../scss/loginRegister.scss";

//-----------Import the API Function Login --> modules/api.js ----------//
import { loginUser } from "../modules/api.js";

//----------Import the JTW Function --> modules/utility.js ----------//
import { storeToken } from "../modules/auth.js";

//Handles login submissions
document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const errorLogin = document.querySelector(".error-login");
  const successMessage = localStorage.getItem("registrationSuccess");

  // Display the success message if it exists in localStorage(from successfully register)
  if (successMessage) {
    errorLogin.textContent = successMessage;
    errorLogin.classList.add("text-secondary");
    localStorage.removeItem("registrationSuccess");
  }

  document
    .getElementById("loginForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = emailInput.value;
      const password = passwordInput.value;

      try {
        const result = await loginUser(email, password);
        // Store JWT token to local storage
        storeToken(result.accessToken);
        // Store the username to localstorage
        localStorage.setItem("userName", result.name);
        window.location.href = `/html/my-profile.html`;
      } catch (error) {
        console.error(error.message);
        errorLogin.classList.remove("text-secondary");
        errorLogin.classList.add("text-danger");
        errorLogin.textContent =
          "Login failed. Please ensure your email and password are correct and try again.";
      }
    });
});
