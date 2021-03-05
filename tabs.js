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

document.addEventListener(
   "keydown",
   function TabChange (event) {
      if (event.shiftKey) {
         if (ForwardKeyCodes.includes(event.key)) {
            // I wish I could use the with statement
            ELEMENTS.TabSelect.selectedIndex = (ELEMENTS.TabSelect.selectedIndex + 1) % ELEMENTS.TabSelect.options.length;
            ELEMENTS.TabSelect.dispatchEvent(new Event("change"));
         } else if (BackwardKeyCodes.includes(event.key)) {
            ELEMENTS.TabSelect.selectedIndex = (ELEMENTS.TabSelect.selectedIndex - 1) % ELEMENTS.TabSelect.options.length;
            ELEMENTS.TabSelect.dispatchEvent(new Event("change"));
         }
      }
   }
);
