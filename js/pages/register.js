//---------- Import Styles from loginRegister.scss ----------/
import "../../scss/loginRegister.scss";

//---------- Import the API Function Register --> modules/api.js ----------//
import { registerUser } from "../modules/api.js";

//---------- Eventlistner and fucntion handle for register api --------//
document
  .getElementById("registerForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const errorRegistration = document.querySelector(".error-registration");
    errorRegistration.textContent = "";

    const userData = {
      name: document.getElementById("registerName").value,
      email: document.getElementById("registerEmail").value,
      password: document.getElementById("registerPassword").value,
    };

    try {
      const response = await registerUser(userData);
      //-- If !response ok shows the latest errormessage from the api response
      if (!response.ok) {
        const errorData = await response.json();
        const registerErrorMessage =
          errorData.errors.length > 0
            ? errorData.errors[errorData.errors.length - 1].message
            : "Registration failed. Please check your details and try again.";
        console.error("Registration failed:", errorData);
        errorRegistration.textContent = registerErrorMessage;
        //-- direct the user to login on success register
      } else {
        //-- set message to localstorage for redirect on success
        localStorage.setItem(
          "registrationSuccess",
          "Registration successful. Please log in."
        );
        window.location.href = "/html/login.html";
      }
    } catch (error) {
      console.error("Registration failed:", error);
      errorRegistration.textContent =
        "We're experiencing technical difficulties. Please try again later.";
    }
  });
