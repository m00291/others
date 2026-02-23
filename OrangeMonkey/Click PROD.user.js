// ==UserScript==
// @name     Click PROD
// @version  1.0
// @match    https://banids.cityu.edu.hk/ssomanager/ui/samlLogout.jsp
// @grant    none
// ==/UserScript==

(function () {
  'use strict';

  window.addEventListener('DOMContentLoaded', function () {
    // Find the content div
    const contentDiv = document.querySelector('div.content');
    if (!contentDiv) return;
    console.log("OrangeMonkey");

    // Look for "Click <a href=...>here</a> to sign in again" pattern
    const links = contentDiv.querySelectorAll('a[href="https://banweb.cityu.edu.hk"]');
    for (const link of links) {
      const parentText = link.parentNode.textContent || '';
      // Either check for "Click " before, or check surrounding sentence
      if (
        parentText.includes('You have successfully signed out.') &&
        parentText.includes('Click') &&
        parentText.includes('to sign in again')
      ) {
        link.click();
        break;
      }
    }
  });
})();