// ==UserScript==
// @name create AGLC Youtube Live
// @match https://studio.youtube.com/*
// ==/UserScript==

(function() {
  'use strict';
  let lastUrl = location.href;
  
  function SelectTemplate() {
    console.log('start');

    const targetText = '路德會永恩堂 崇拜 2026年?月?日 上午11時正';
    const dialogSelector = 'tp-yt-paper-dialog[style-target="host"].style-scope.ytls-popup-container';

    // Helper function to check if an element is visible
    function isVisible(el) {
      return el && window.getComputedStyle(el).display !== 'none';
    }

    // Observe for the dialog appearing
    const dialogObserver = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (
              node.nodeType === 1 &&
              node.matches &&
              node.matches(dialogSelector)
            ) {
              //console.log('Dialog appeared:', node);
              console.log('Dialog appeared');
              observer.disconnect();

              // Now observe style changes to see when dialog becomes visible
              waitForDialogVisible(node);
            }
          });
        }
      }
    });

    // Start observing for dialog insertion
    dialogObserver.observe(document.body, { childList: true, subtree: true });

    // Function to watch for dialog visibility
    function waitForDialogVisible(dialogNode) {
      if (isVisible(dialogNode)) {
        clickTargetDiv(dialogNode);
        return;
      }
      // Observe style changes on the dialog node
      const styleObserver = new MutationObserver(() => {
        if (isVisible(dialogNode)) {
          styleObserver.disconnect();
          clickTargetDiv(dialogNode);
        }
      });
      styleObserver.observe(dialogNode, {
        attributes: true,
        attributeFilter: ['style']
      });
    }

    // Function to find and click the target div
    function clickTargetDiv(dialogNode) {
      setTimeout(() => {
        const stringElements = dialogNode.querySelectorAll('yt-formatted-string#title.style-scope.ytls-broadcast-menu-item-renderer');
        for (const stringEl of stringElements) {
          if (stringEl.textContent.trim() === targetText) {
            const parentDiv = stringEl.closest('div');
            if (parentDiv) {
              parentDiv.click();
              parentDiv.click();
              updateTitle();
              updateDateInput();
              updateTimeInput();
              //console.log('Clicked the template live:', parentDiv);
              console.log('Clicked the template live:', targetText);
              return;
            } else {
              console.log('Parent <div> not found for the matching string.');
            }
            return; // Stop after first match
          }
        }
        console.log('No matching <yt-formatted-string> found with the exact text.');
      }, 200); // You may adjust this delay if needed
    }
    
    // update Live title to next Sunday ======================================================================//
    //========================================================================================================//
    
    function getNextSundayFormatted() {
      const today = new Date();
      const dayOfWeek = today.getDay();
      // 0 is Sunday, so if today is Sunday, get next Sunday (7 days later)
      const daysUntilNextSunday = (7 - dayOfWeek) % 7 || 7;
      const nextSunday = new Date(today);
      nextSunday.setDate(today.getDate() + daysUntilNextSunday);
      return `${nextSunday.getMonth() + 1}月${nextSunday.getDate()}日`;
    }

    // Watch for the #textbox div after the click
    function updateTitle() {
      const textboxSelector = 'div#textbox.style-scope.ytcp-social-suggestions-textbox';
      const targetTextPattern = /^路德會永恩堂 崇拜 2026年\?月\?日 上午11時正$/;

      function updateIfMatch(textbox) {
        if (textbox && targetTextPattern.test(textbox.textContent.trim())) {
          textbox.focus();
          // Replace ?月?日 with the next Sunday
          const newDateStr = getNextSundayFormatted();
          textbox.textContent = textbox.textContent.replace(/\?月\?日/, newDateStr);
          
          // Also dispatch events so that any listeners update
          textbox.dispatchEvent(new Event('input', { bubbles: true }));
          textbox.dispatchEvent(new Event('change', { bubbles: true }));
          
          setTimeout(() => {
            textbox.blur();
          }, 100);
          console.log('Textbox updated:', textbox.textContent);
          return true;
        }
        return false;
      }

      function observeAndUpdate(textbox) {
        // Observe for further changes in case the text is set asynchronously
        const observer = new MutationObserver(() => {
          if (updateIfMatch(textbox)) {
            observer.disconnect();
          }
        });
        observer.observe(textbox, { childList: true, characterData: true, subtree: true });
        // Initial check
        updateIfMatch(textbox);
      }

      // Try to find the textbox immediately
      let textbox = document.querySelector(textboxSelector);
      if (textbox) {
        observeAndUpdate(textbox);
      } else {
        // If not found, observe the body for it being added
        const bodyObserver = new MutationObserver((mutations, obs) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === 1 && node.matches && node.matches(textboxSelector)) {
                obs.disconnect();
                observeAndUpdate(node);
                return;
              }
            }
          }
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
      }
    }
    
    // update Live calendar to next Sunday ================================================================//
    //=====================================================================================================//
    
    function updateDateInput() {
      let CalendarButtonSelector = 'ytcp-text-dropdown-trigger#datepicker-trigger ytcp-dropdown-trigger.style-scope.ytcp-text-dropdown-trigger.style-scope.ytcp-text-dropdown-trigger';
      const dynamicDateSelector = 'form.style-scope.ytcp-date-picker tp-yt-iron-input.input-element.style-scope.tp-yt-paper-input input.style-scope.tp-yt-paper-input';

      function getNextSundayCalendar() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        // If today is Sunday, get next Sunday (7 days later)
        const daysUntilNextSunday = (7 - dayOfWeek) % 7 || 7;
        const nextSunday = new Date(today);
        nextSunday.setDate(today.getDate() + daysUntilNextSunday);

        // Array of abbreviated month names
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[nextSunday.getMonth()];
        const day = nextSunday.getDate();
        const year = nextSunday.getFullYear();

        return `${month} ${day}, ${year}`;
      }

      function setDateValue() {
        setTimeout(() => {
          let CalendarButton = document.querySelector(CalendarButtonSelector);
          if (CalendarButton) {
            CalendarButton.click();
            
            setTimeout(() => {
              let input = document.querySelector(dynamicDateSelector);
              //input.focus();
              const newCalStr = getNextSundayCalendar();
              input.value = newCalStr;
              console.log(input);
              console.log(input.value);
              setTimeout(() => {
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }, 100);
            }, 100);
            
            
            setTimeout(() => {
              //input.blur();
              let timeinput = document.querySelector('tp-yt-iron-input#input-2 input.style-scope.tp-yt-paper-input');
              timeinput.focus();
              console.log('Date picked next Sunday.');
            }, 100);
            return true;
          }
        }, 300);
      }

      const bodyObserver = new MutationObserver((mutations, obs) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1 && node.matches && node.matches(CalendarButtonSelector)) {
              console.log('CalendarButtonSelector');
              setDateValue();
              obs.disconnect();
              return;
            }
          }
        }
      });
      bodyObserver.observe(document.body, { childList: true, subtree: true });
    }
    
    // update Live time to 11:00 AM =======================================================================//
    //=====================================================================================================//
    
    function updateTimeInput() {
      const timeInputSelector = 'tp-yt-iron-input#input-2 input.style-scope.tp-yt-paper-input';

      function setTimeValue(input) {
        setTimeout(() => {
          if (input) {
            input.focus();
            input.value = "11:00 AM";
            // Also dispatch events so that any listeners update
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            setTimeout(() => {
              input.blur();
              console.log('Input updated to 11:00 AM.');
            }, 100);
            return true;
          }
        }, 500);
      }

      // Try to find the input immediately
      let input = document.querySelector(timeInputSelector);
      if (input) {
        setTimeValue(input);
      } else {
        // If not found, observe for its addition
        const bodyObserver = new MutationObserver((mutations, obs) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === 1) {
                // Check if the node or its descendants match
                let foundInput = node.matches && node.matches(timeInputSelector)
                  ? node
                  : node.querySelector && node.querySelector(timeInputSelector);
                if (foundInput) {
                  obs.disconnect();
                  setTimeValue(foundInput);
                  return;
                }
              }
            }
          }
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
      }
    }
  }

  // Observe URL changes
  setInterval(() => {
    //console.log('checking');
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (location.href.includes('/channel/UC2LOYen89PZP3y36uYY4v7A/livestreaming')) {
        SelectTemplate();
      }
    }
  }, 200);
})();