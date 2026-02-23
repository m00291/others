// ==UserScript==
// @name     Click ESU8 PRO8
// @version  1.0
// @match    https://banwebdev.cityu.edu.hk:7064/pls/ESU8/twbkwbis.P_GenMenu*
// @match    https://banwebdev.cityu.edu.hk:7065/pls/PRO8/twbkwbis.P_GenMenu*
// @grant    none
// ==/UserScript==

(function () {
  'use strict';

  // Wait for DOM to be ready
  window.addEventListener('DOMContentLoaded', function () {
    // Find the body div
    const bodyDiv = document.querySelector('div.body');
    if (!bodyDiv) return;
    console.log("OrangeMonkey");

    // Find all <b> tags inside body
    const bolds = bodyDiv.querySelectorAll('b');
    for (const b of bolds) {
      // Find "here" link with the specified href inside the <b>
      const link = b.querySelector('a[href="twgkpswd_cityu.P_WWWLogin"]');
      if (link && b.textContent.includes('Click') && b.textContent.includes('to login AIMS')) {
        // Perform a mouse click on the link
        link.click();
        break;
      }
    }
  });
})();