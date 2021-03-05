"use strict";
/* global ELEMENTS */

ELEMENTS.TabElements = [
   document.getElementById("tabInfo"),
   document.getElementById("gameControls"),
   document.getElementById("gameData"),
   document.getElementById("playerSettings"),
];

ELEMENTS.CurrentTab = ELEMENTS.TabElements[0];
ELEMENTS.TabSelect = document.getElementById("tabSelect");

ELEMENTS.TabSelect.onchange = function changeTab () {
   ELEMENTS.CurrentTab.classList.remove("selectedTab");
   ELEMENTS.TabElements[this.selectedIndex].classList.add("selectedTab");
   ELEMENTS.CurrentTab = ELEMENTS.TabElements[this.selectedIndex];
}

const KeyCodes = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
const ForwardKeyCodes = [KeyCodes[0], KeyCodes[3]];
const BackwardKeyCodes = [KeyCodes[1], KeyCodes[2]];

// with statement! *gasp*

// 100% of the time:
// variable --> ELEMENTS.TabSelect.variable
document.addEventListener(
   "keydown",
   function TabChange (event) {
      if (event.shiftKey) {
         if (ForwardKeyCodes.includes(event.key)) {
            with (ELEMENTS.TabSelect) {
               selectedIndex = (selectedIndex + 1) % options.length
            }
         } else if (BackwardKeyCodes.includes(event.key)) {
            with (ELEMENTS.TabSelect) {
               selectedIndex = (selectedIndex - 1) % options.length
            }
         }
      }
   },
   true
);
