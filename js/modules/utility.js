//------ Export --------/

//-- Infinite scroll, triggering a callback when the user reaches the bottom of the page
export { addInfiniteScroll }; //-------------------------------------------------------------------------------------------------------------> Line: 32
//-- For shorten the text on overlay text for posts --> explore.js, home.js, profile.js, and my-profile.js
export { trimText }; //----------------------------------------------------------------------------------------------------------------------> Line: 88
//-- For removing error message and element after a duration -->
export { clearElementAfterDuration }; //-----------------------------------------------------------------------------------------------------> Line: 129


/**
 * Enables infinite scroll, triggering a callback when the user reaches the bottom of the page
 * @param {Function}
 */
function addInfiniteScroll(callback) {
  let timeout;
  window.addEventListener("scroll", () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        await callback();
      }
    }, 100);
  });
}

//------ Trim text on overlay for posts to fit layout --------/
/**
 * Function to trim text to show only the first maxChars characters followed by '...' in post body overylay
 * @param {string} text
 * @param {number} maxChars
 * @returns {string} Trimmed text
 */
function trimText(text, maxChars) {
  if (!text || text.length > maxChars) {
    return (
      (text || "").substring(0, maxChars) +
      (text && text.length > maxChars ? "..." : "")
    );
  }
  return text;
}

//------ clears a error message after a short duration --------/
/**
 * Clears the text content of the given element after a specified duration.
 *
 * @param {HTMLElement}
 * @param {number}
 */
function clearElementAfterDuration(element, duration = 7000) {
  setTimeout(() => {
    if (element && element.remove) {
      element.remove();
    }
  }, duration);
}
