// global ELEMENTS

ELEMENTS.TabElements = [
   document.getElementById("tabInfo"),
   document.getElementById("gameControls"),
   document.getElementById("gameData"),
   document.getElementById("playerSettings"),
];

ELEMENTS.CurrentTab = ELEMENTS.TabElements[0];

document.getElementById("tabSelect").onchange = function changeTab () {
   ELEMENTS.CurrentTab.classList.remove("selectedTab");
   ELEMENTS.TabElements[this.selectedIndex].classList.add("selectedTab");
   ELEMENTS.CurrentTab = ELEMENTS.TabElements[this.selectedIndex];
}
