//------ Export --------/

//-- Infinite scroll, triggering a callback when the user reaches the bottom of the page
export { addInfiniteScroll }; //-------------------------------------------------------------------------------------------------------------> Line: 32
//-- For shorten the text on overlay text for posts --> explore.js, home.js, profile.js, and my-profile.js
export { trimText }; //----------------------------------------------------------------------------------------------------------------------> Line: 88
//-- Function to show date as relative time or DD/MM/YYYY --> All pages with posts
export { formatRelativeTime }; //------------------------------------------------------------------------------------------------------------> Line: 102
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
//------ formatRealtiveTime to make dates more readable and fit layout--------/
/**
 *  Formats a given date string as a relative time up to 6 days ago ("1 minute ago", "1 hour ago", "1 day ago"), and as a date in DD/MM/YYYY format for older dates
 * @param {string}
 * @returns {string}
 */
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.round((now - date) / 1000);
  const minutesAgo = Math.round(secondsAgo / 60);
  const hoursAgo = Math.round(minutesAgo / 60);
  const daysAgo = Math.round(hoursAgo / 24);

  if (daysAgo < 1) {
    if (hoursAgo < 1) {
      return minutesAgo === 1 ? "1 minute ago" : `${minutesAgo} minutes ago`;
    }
    return hoursAgo === 1 ? "1 hour ago" : `${hoursAgo} hours ago`;
  } else if (daysAgo < 7) {
    return daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
  } else {
    return date.toLocaleDateString("en-GB");
  }
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
