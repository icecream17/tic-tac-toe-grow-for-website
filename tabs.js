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

document.addEventListener(
   "keydown",
   function TabChange (event) {
      if (event.shiftKey) {
         // In a dropdown, going down the list === going forward
         if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            // I wish I could use the with statement
            ELEMENTS.TabSelect.selectedIndex = (ELEMENTS.TabSelect.selectedIndex + 1) % ELEMENTS.TabSelect.options.length;
            ELEMENTS.TabSelect.dispatchEvent(new Event("change"));
         } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            // Add options.length so that pressing left won't get a -1 index
            ELEMENTS.TabSelect.selectedIndex = (ELEMENTS.TabSelect.selectedIndex + ELEMENTS.TabSelect.options.length - 1) % ELEMENTS.TabSelect.options.length;
            ELEMENTS.TabSelect.dispatchEvent(new Event("change"));
         }
      }
   }
);
