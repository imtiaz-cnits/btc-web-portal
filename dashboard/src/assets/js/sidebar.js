//...................................................................
//.........................Sidebar JS Start..........................
//...................................................................
const css = `
        * {
        box-sizing: border-box;
        }
        body {
        margin: 0px
        }
      
        /* Sidebar Styles */
        .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 100;
        width: 270px;
        height: 100vh;
        background: var(--bg);
        transition: all 0.4s ease;
        }

        .sidebar.collapsed {
        width: 70px;
        }

        .sidebar .sidebar-header {
        height: 79.98px;
        display: flex;
        position: relative;
        padding: 15px 10px 15px 15px;
        border-bottom: 1px solid #F4F7FE;
        gap: 5px;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        }

        .sidebar.collapsed .sidebar-header {
        padding: 15px 10px;
        justify-content: center;
        }

        .sidebar-header .dark-header-logo ,
        .sidebar-header .header-logo {
        display: flex;
        gap: 10px;
        text-decoration: none;
        }
        
        .sidebar-header .light-logo-box {
        display: block;
        }

        .sidebar-header .dark-logo-box {
        display: none;
        }
        
        .dark .sidebar-header .light-logo-box {
        display: none;
        }

        .dark .sidebar-header .dark-logo-box {
        display: block;
        }

        .sidebar-header .dark-header-logo .text-name,
        .sidebar-header .header-logo .text-name {
        color: black;
        font-size: 22px;
        font-weight: bold;
        margin: 0;
        display: flex;
        align-items: center;
        }

        .sidebar-header .dark-header-logo .sidebar-logo,
        .sidebar-header .header-logo .sidebar-logo {
        width: 36px;
        height: 36px;
        display: block;
        object-fit: contain;
        border-radius: 50%;
        }

        .sidebar-header .dark-header-logo .sidebar-brandname-logo,
        .sidebar-header .header-logo .sidebar-brandname-logo {
        width: 150px;
        display: block;
        object-fit: contain;
        }

        .sidebar.collapsed .sidebar-header .dark-header-logo .text-name,
        .sidebar.collapsed .dark-header-logo .sidebar-brandname-logo {
        display: none;
        }

        .sidebar.collapsed .sidebar-header .header-logo .text-name,
        .sidebar.collapsed .header-logo .sidebar-brandname-logo {
        display: none;
        }

        .sidebar-header .sidebar-toggler,
        .sidebar-menu-button {
        height: 35px;
        width: 35px;
        color: var(--text-4);
        border: none;
        cursor: pointer;
        display: flex;
        background: var(--primary-color);
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: 0.4s ease;
        }

        .sidebar-header .sidebar-toggler {
        padding: 10px;
        }

        .sidebar.collapsed .sidebar-header .sidebar-toggler {
        position: absolute;
        right: -16px;
        height: 26px;
        width: 26px;
        }

        .sidebar-header .sidebar-toggler i,
        .sidebar-menu-button i {
        font-size: 1rem;
        transition: 0.4s ease;
        }

        .sidebar-menu-button i {
        color: var(--text-1)
        }

        .sidebar-menu-button {
        border: 1px solid var(--primary-color);
        }

        .sidebar.collapsed .sidebar-header .sidebar-toggler {
        padding: 0px;
        }

        .sidebar.collapsed .sidebar-header .sidebar-toggler i {
        transform: rotate(180deg);
        font-size: 12px;
        }

        // .sidebar-header .sidebar-toggler:hover {
        // background: #d9e1fd;
        // }

        .sidebar-nav .nav-list {
        list-style: none;
        display: flex;
        gap: 4px;
        padding: 0px 10px;
        flex-direction: column;
        transition: 0.4s ease;
        }

        .sidebar .sidebar-nav .primary-nav {
        overflow-y: auto;
        scrollbar-width: thin;
        padding-bottom: 20px;
        height: calc(100vh - 200px);
        scrollbar-color: transparent transparent;
        }

        .sidebar .sidebar-nav .primary-nav:hover {
        scrollbar-color: #eef2ff transparent;
        }

        .sidebar.collapsed .sidebar-nav .primary-nav {
        overflow: unset;
        }

        .sidebar-nav .nav-item .nav-link {
        color: var(--text-1);
        display: flex;
        gap: 12px;
        white-space: nowrap;
        border-radius: 8px;
        padding: 11px 15px;
        align-items: center;
        text-decoration: none;
        // border: 1px solid var(--secondary-color);
        transition: 0.4s ease;
        }

        .sidebar-nav
          .nav-item:is(:hover, .open)
          > .nav-link:not(.dropdown-title) { 
           color: var(--text-1);
           background: var(--secondary-color);
        }

       .dark .sidebar-nav
          .nav-item:is(:hover, .open)
          > .nav-link:not(.dropdown-title) { 
            color: var(--text-4) !important;
           background: var(--dark-hover) !important;
        }

        .dark .sidebar-nav .nav-item .nav-link.active  { 
           color: var(--text-4) !important;
           background: var(--dark-hover) !important;
        }
          .sidebar-nav .nav-item .nav-link.active { 
           color: var(--text-1);
           background: var(--secondary-color);
        }
           
         .dark .sidebar-nav .nav-item .nav-link i,
         .dark .sidebar-nav .nav-item .nav-link svg path { 
          fill: var(--bg) !important;
          color: var(--bg);
        }
           
         .sidebar-nav .nav-item .nav-link.active svg path { 
          fill: var(--primary-color) !important;
        }
        .dark .sidebar-nav .nav-item .nav-link.active svg path { 
          fill: var(--text-4) !important;
        }
           
         .sidebar-nav .nav-item .nav-link.active i { 
           color: var(--primary-color);
           
        }

        /* NEW: Style for active dropdown-title */
        .sidebar-nav .nav-item .nav-link.dropdown-title.active {
            color: var(--text-1);
            background: var(--secondary-color);
        }

        .sidebar .nav-link .nav-label {
        transition: opacity 0.3s ease;
        }

        .sidebar.collapsed .nav-link :where(.nav-label, .dropdown-icon) {
        opacity: 0;
        pointer-events: none;
        }
        .sidebar.collapsed .sub-dropdown-container .nav-link :where(.nav-label, .dropdown-icon) {
        opacity: 1 !important;
        }

        .sidebar.collapsed .sub-dropdown-menu {
        padding-top: 8px;
        padding-bottom: 8px;
        }

        .sidebar.collapsed .nav-link .dropdown-icon {
        transition: opacity 0.3s 0s ease;
        }

        .sidebar-nav .secondary-nav {
        position: absolute;
        bottom: 10px;
        margin-bottom: 0px;
        width: 100%;
        background: var(--bg);
        z-index: -1;
        }

        .sidebar-nav .nav-item {
        position: relative;
        }

        .sidebar-nav .nav-item svg {
        width: 26px;
        height: 26px;
        }

        .sidebar-nav .nav-item svg {
        width: 26px;
        height: 26px;
        }

        .sidebar-nav .nav-item i {
        font-size: 22px;
        color: var(--accent);
        }

        .sidebar-nav .nav-item .fa-angle-down {
        font-size: 16px;
        }

        /* Dropdown Stylings */
        .sidebar-nav .dropdown-container .dropdown-icon {
        margin: 0 -4px 0 auto;
        transition: transform 0.4s ease, opacity 0.3s 0.2s ease;
        }

        .sidebar-nav .dropdown-container.open .dropdown-toggle .dropdown-icon {
        transform: rotate(180deg);
        }

        .sidebar-nav .dropdown-menu {
        height: 0px;
        overflow-y: hidden;
        list-style: none;
        padding-left: 15px;
        transition: height 0.4s ease;

        }

        /* FIX: Allow sub-dropdowns to show when collapsed */
        .sidebar.collapsed .dropdown-menu {
        position: absolute;
        top: -10px;
        left: 100%;
        opacity: 0;
        height: auto !important;
        padding-right: 10px;
        overflow-y: unset;
        pointer-events: none;
        border-radius: 0 10px 10px 0;
        background: var(--bg);
        border: 1px solid var(--secondary-color);
        transition: 0s;
        min-width: 150px;
        }

        .sidebar.collapsed .dropdown-menu:has(.dropdown-link) {
        padding: 7px 10px 7px 24px;
        }

        .dark .sidebar.collapsed .dropdown-menu {
        background: var(--dark-bg2);
        border: none;
        }

        .sidebar.sidebar.collapsed .nav-item:hover > .dropdown-menu {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(12px);
        transition: all 0.4s ease;
        }

        .sidebar.sidebar.collapsed
          .nav-item:hover
          > .dropdown-menu:has(.dropdown-link) {
        transform: translateY(10px);
        }

        .dark .dropdown-menu .nav-item .nav-link {
        color: var(--text-4);
        }

        .dropdown-menu .nav-item .nav-link {
        color: var(--text-1);
        padding: 9px 15px;
        }

        .sidebar.collapsed .dropdown-menu .nav-link {
        padding: 7px 15px;
        }

        .dropdown-menu .nav-item .dropdown-title {
        display: none;
        color: var(--text-1);
        padding: 9px 15px;
        }

        .dark .dropdown-menu .nav-item .nav-link .dropdown-title {
        color: var(--text-4);
        }

        .dropdown-menu:has(.dropdown-link) .nav-item .dropdown-title {
        font-weight: 500;
        padding: 7px 15px;
        }

        .sidebar.collapsed .dropdown-menu .nav-item .dropdown-title {
        display: block;
        }

        .dropdown-container.open .dropdown-menu {
        height: 100% !important;
        margin-top: 6px;
        }

        .sidebar.collapsed .dropdown-container.open .dropdown-menu {
        height: auto !important;
        }

        .sub-dropdown-container.open .sub-dropdown-menu {
         // height: 100% !important;
         margin-top: 4px;
        }

        /* Sub-Dropdown Stylings */
        .sidebar-nav .sub-dropdown-container .sub-dropdown-toggle .dropdown-icon {
        margin: 0 -4px 0 auto;
        transition: transform 0.4s ease, opacity 0.3s 0.2s ease;
        }

        .sidebar-nav .sub-dropdown-container.open .dropdown-icon {
        transform: rotate(180deg);
        }

        .sidebar-nav .sub-dropdown-menu {
        height: 0;
        overflow-y: hidden;
        list-style: none;
        padding-left: 15px;
        transition: height 0.4s ease;
        }

        /* FIX: Adjust position and remove overflow for collapsed sub-dropdowns */
        .sidebar.collapsed .sub-dropdown-menu {
        position: absolute;
        top: -7px;
        left: 100%;
        opacity: 0;
        height: auto !important;
        padding-right: 10px;
        overflow-y: unset; 
        pointer-events: none;
        border-radius: 0 10px 10px 0;
        background: var(--bg);
        border: 1px solid var(--secondary-color);
        transition: 0s;
        min-width: 150px;
        }

        .sidebar .nav-item .fa-circle {
        font-size: 10px;
        }

        .sidebar.collapsed .nav-item .fa-circle {
        font-size: 10px;
        }

        /* FIX: Correct padding for sub-dropdown links in collapsed mode */
        .sidebar.collapsed .dropdown-menu .sub-dropdown-menu .nav-link.dropdown-link {
            padding-left: 15px;
        }

        .dark .sidebar.collapsed .dropdown-menu .sub-dropdown-menu {
          background: var(--dark-bg2);
        border: none;
        }

        .sidebar.collapsed .nav-item:hover > .sub-dropdown-menu {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0px); /* Align sub-dropdown with its parent link */
        transition: all 0.4s ease;
        }

        .sidebar.collapsed .nav-item:hover > .sub-dropdown-menu:has(.dropdown-link) {
        transform: translateY(0px); /* Align sub-dropdown with its parent link */
        }

        .sub-dropdown-menu .nav-item .nav-link {
        color: var(--text-1);
        padding: 9px 15px;
        }

        .sidebar.collapsed .sub-dropdown-menu .nav-link {
        padding: 7px 15px;
        }

        .sub-dropdown-menu .nav-item .nav-link.dropdown-title {
        display: none;
        color: #fff;
        padding: 9px 15px;
        }

        .sub-dropdown-menu:has(.dropdown-link) .nav-item .dropdown-title {
        font-weight: 500;
        padding: 7px 15px;
        }

        .sidebar.collapsed .sub-dropdown-menu .nav-item .dropdown-title {
        display: block;
        }

        /* Show active color even when collapsed */
        .sidebar.collapsed .nav-link.active {
          background: var(--secondary-color) !important;
          color: var(--text-1) !important;
        }

        .sidebar.collapsed .nav-link svg {
          width: 20px;
          height: 20px;
        }

        .sidebar.collapsed .nav-link i {
          font-size: 18px;
        }

        .dark .sidebar.collapsed .nav-link.active {
          background: var(--dark-hover) !important;
          color: var(--text-4) !important;
        }

        /* Show active icon color when collapsed */
        .sidebar.collapsed .nav-link.active i {
          color: var(--primary-color) !important;
        }

        .dark .sidebar.collapsed .nav-link.active i {
          color: var(--text-4) !important;
        }

        .sidebar.collapsed .nav-link.active svg path {
          fill: var(--primary-color) !important;
        }

        .dark .sidebar.collapsed .nav-link.active svg path {
          fill: var(--text-4) !important;
        }

        /* Ensure active dropdowns are visible on hover when collapsed */
        .sidebar.collapsed .nav-item.active:hover > .dropdown-menu,
        .sidebar.collapsed .nav-item.active .nav-item:hover > .sub-dropdown-menu {
          opacity: 1 !important;
          pointer-events: auto !important;
          transform: translateY(0) !important;
        }

        .sidebar-menu-button {
        display: none;
        }

        /* Main Content Styles */
        .main {
        flex: 1;
        margin-left: 270px;
        transition: margin-left 0.4s ease;
        }
        
        .sidebar.collapsed ~ .copyright {
        margin-left: 70px;
        }
      
        .copyright {
        margin-left: 270px;
        transition: margin-left 0.4s ease;
        }
        
        .sidebar.collapsed ~ .main {
        margin-left: 70px;
        }
      
        @media (max-width: 1024px) {
        .sidebar-menu-button {
          height: 34px;
          width: 36px;
          display: flex;
          color: #f1f4ff;
          background: var(--secondary-color);
          z-index: 110;
        }

        .sidebar {
          left: 0;
          height: 100% !important;
          z-index: 200;
        }

        .sidebar.collapsed {
          width: 270px;
          left: -270px;
        }

        .sidebar.collapsed .sidebar-toggler {
        display: none;
        }

        .sidebar.collapsed ~ .main {
          margin-left: 0;
        }

        .main {
          margin-left: 0;
        }

        .copyright,
        .sidebar.collapsed ~ .copyright {
        margin-left: 0px;
        }
        }
`;

// Create a style element
const styleElement = document.createElement("style");
styleElement.textContent = css;
document.head.appendChild(styleElement);

// Function to get the full scroll height of a menu, including sub-menus
const getFullMenuHeight = (menuElement) => {
  let totalHeight = 0;
  Array.from(menuElement.children).forEach((child) => {
    totalHeight += child.scrollHeight;
  });

  // Now, add the heights of any open sub-menus within this menu
  menuElement
    .querySelectorAll(".sub-dropdown-menu.open")
    .forEach((subMenuItem) => {
      totalHeight += subMenuItem.scrollHeight;
    });

  return totalHeight;
};

// Toggle the visibility and height of a dropdown menu
const toggleDropdown = (dropdownElement, menuElement, isOpen) => {
  const sidebar = document.querySelector(".sidebar");
  const isCollapsed = sidebar.classList.contains("collapsed");

  dropdownElement.classList.toggle("open", isOpen);
  if (isOpen) {
    if (isCollapsed) {
      menuElement.style.height = "auto";
    } else {
      menuElement.style.height = `${getFullMenuHeight(menuElement)}px`;
    }
  } else {
    menuElement.style.height = 0;
  }

  // Re-calculate parent dropdown height if a sub-dropdown changes
  const parentDropdownMenu = dropdownElement.closest(".dropdown-menu");
  if (parentDropdownMenu && parentDropdownMenu.classList.contains("open")) {
    parentDropdownMenu.style.height = `${getFullMenuHeight(
      parentDropdownMenu
    )}px`;
  }
};

// Close all open dropdowns (main and sub)
const closeAllDropdowns = () => {
  document
    .querySelectorAll(".dropdown-container.open, .sub-dropdown-container.open")
    .forEach((openDropdown) => {
      const menu = openDropdown.classList.contains("dropdown-container")
        ? openDropdown.querySelector(".dropdown-menu")
        : openDropdown.querySelector(".sub-dropdown-menu");
      toggleDropdown(openDropdown, menu, false);
    });
};

// Function to set the active nav item and its corresponding dropdown-title
const setActiveNavItem = (targetLink) => {
  document.querySelectorAll(".nav-link, .dropdown-title").forEach((link) => {
    link.classList.remove("active");
  });

  // Add 'active' class to the clicked nav-link
  targetLink.classList.add("active");

  // Find the closest parent dropdown-menu and activate its dropdown-title
  const parentDropdownMenu = targetLink.closest(".dropdown-menu");
  if (parentDropdownMenu) {
    const dropdownTitle = parentDropdownMenu.querySelector(".dropdown-title");
    if (dropdownTitle) {
      dropdownTitle.classList.add("active");
    }
  }

  // If the clicked link is inside a dropdown, ensure the dropdown is open
  let parentDropdown = targetLink.closest(".dropdown-container");
  if (parentDropdown) {
    toggleDropdown(
      parentDropdown,
      parentDropdown.querySelector(".dropdown-menu"),
      true
    );
  }

  // If the clicked link is inside a sub-dropdown, ensure its parent dropdown is also open
  let parentSubDropdown = targetLink.closest(".sub-dropdown-container");
  if (parentSubDropdown) {
    toggleDropdown(
      parentSubDropdown,
      parentSubDropdown.querySelector(".sub-dropdown-menu"),
      true
    );
    // Also ensure the main dropdown containing this sub-dropdown is open
    parentDropdown = parentSubDropdown.closest(".dropdown-container");
    if (parentDropdown) {
      toggleDropdown(
        parentDropdown,
        parentDropdown.querySelector(".dropdown-menu"),
        true
      );
    }
  }
};

// Function to handle sidebar collapsed state persistence
const handleSidebarState = () => {
  const sidebar = document.querySelector(".sidebar");

  // Always collapse sidebar on mobile view
  if (window.innerWidth <= 1024) {
    sidebar.classList.add("collapsed");
    localStorage.setItem("sidebarCollapsed", "true");
    return;
  }

  // Check localStorage for saved state (desktop only)
  const storedState = localStorage.getItem("sidebarCollapsed");
  if (storedState !== null) {
    if (storedState === "true") {
      sidebar.classList.add("collapsed");
    } else {
      sidebar.classList.remove("collapsed");
    }
  }

  // Update localStorage when sidebar is toggled
  document
    .querySelectorAll(".sidebar-toggler, .sidebar-menu-button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const isNowCollapsed = sidebar.classList.contains("collapsed");
        localStorage.setItem("sidebarCollapsed", isNowCollapsed);
      });
    });
};

// Attach click event to all dropdown toggles (main dropdowns)
document.querySelectorAll(".dropdown-toggle").forEach((dropdownToggle) => {
  dropdownToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const dropdown = dropdownToggle.closest(".dropdown-container");
    const menu = dropdown.querySelector(".dropdown-menu");
    const isOpen = dropdown.classList.contains("open");

    // Close all *other* main dropdowns, and all sub-dropdowns
    document
      .querySelectorAll(".dropdown-container.open")
      .forEach((otherDropdown) => {
        if (otherDropdown !== dropdown) {
          toggleDropdown(
            otherDropdown,
            otherDropdown.querySelector(".dropdown-menu"),
            false
          );
        }
      });
    // Close all sub-dropdowns (even in the current main dropdown if it's closing)
    document
      .querySelectorAll(".sub-dropdown-container.open")
      .forEach((subDropdown) => {
        toggleDropdown(
          subDropdown,
          subDropdown.querySelector(".sub-dropdown-menu"),
          false
        );
      });

    toggleDropdown(dropdown, menu, !isOpen);
  });
});

// Attach click event to all sub-dropdown toggles
document
  .querySelectorAll(".sub-dropdown-toggle")
  .forEach((subDropdownToggle) => {
    subDropdownToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const subDropdown = subDropdownToggle.closest(".sub-dropdown-container");
      const subMenu = subDropdown.querySelector(".sub-dropdown-menu");
      const isOpen = subDropdown.classList.contains("open");

      // Close other sub-dropdowns within the same parent *main* dropdown
      subDropdown
        .closest(".dropdown-menu")
        .querySelectorAll(".sub-dropdown-container.open")
        .forEach((otherSubDropdown) => {
          if (otherSubDropdown !== subDropdown) {
            toggleDropdown(
              otherSubDropdown,
              otherSubDropdown.querySelector(".sub-dropdown-menu"),
              false
            );
          }
        });

      toggleDropdown(subDropdown, subMenu, !isOpen);
    });
  });

// Initialize sidebar state and attach toggle events
document.addEventListener("DOMContentLoaded", () => {
  handleSidebarState();
  highlightActiveLink();
});

// Attach click event to sidebar toggle buttons
document
  .querySelectorAll(".sidebar-toggler, .sidebar-menu-button")
  .forEach((button) => {
    button.addEventListener("click", () => {
      closeAllDropdowns();
      document.querySelector(".sidebar").classList.toggle("collapsed");
      // Store the current state in localStorage
      const isCollapsed = document
        .querySelector(".sidebar")
        .classList.contains("collapsed");
      localStorage.setItem("sidebarCollapsed", isCollapsed);

      // Re-highlight active links after toggle to ensure proper styling
      highlightActiveLink();
    });
  });

// Close sidebar on outside click for mobile view
document.addEventListener("click", (e) => {
  const sidebar = document.querySelector(".sidebar");
  const sidebarMenuButton = document.querySelector(".sidebar-menu-button");

  if (
    window.innerWidth <= 1024 &&
    !sidebar.classList.contains("collapsed") &&
    !sidebar.contains(e.target) &&
    (!sidebarMenuButton || !sidebarMenuButton.contains(e.target))
  ) {
    sidebar.classList.add("collapsed");
    localStorage.setItem("sidebarCollapsed", true);
    closeAllDropdowns();
  }
});

// Handle window resize
window.addEventListener("resize", () => {
  const sidebar = document.querySelector(".sidebar");
  // Always collapse sidebar on mobile view
  if (window.innerWidth <= 1024) {
    sidebar.classList.add("collapsed");
    localStorage.setItem("sidebarCollapsed", "true");
  } else {
    // Only auto-expand if there's no stored state
    const storedState = localStorage.getItem("sidebarCollapsed");
    if (storedState === null) {
      sidebar.classList.remove("collapsed");
    }
  }

  // Re-highlight active links after resize to ensure proper styling
  highlightActiveLink();
});

// Function to set the active nav item based on the current URL
const highlightActiveLink = () => {
  const currentPath = window.location.pathname.split("/").pop();
  const sidebar = document.querySelector(".sidebar");
  const isCollapsed = sidebar.classList.contains("collapsed");

  // Remove 'active' class from all nav-links and dropdown-titles initially
  document.querySelectorAll(".nav-link, .dropdown-title").forEach((link) => {
    link.classList.remove("active");
  });

  // Find the link whose href matches the current page's path
  document.querySelectorAll(".sidebar-nav .nav-link").forEach((link) => {
    const linkHref = link.getAttribute("href");
    if (linkHref) {
      const linkPath = linkHref.split("/").pop();
      if (linkPath === currentPath) {
        link.classList.add("active");

        // Activate the dropdown-title if exists
        const parentNavItem = link.closest(".nav-item");
        if (parentNavItem) {
          const dropdownTitle = parentNavItem.querySelector(
            ".dropdown-link.dropdown-title, .nav-link.dropdown-title"
          );
          if (dropdownTitle) {
            dropdownTitle.classList.add("active");
          }
        }

        // Open parent dropdown if exists (works in both collapsed and expanded states)
        let parentDropdown = link.closest(".dropdown-container");
        if (parentDropdown) {
          const dropdownMenu = parentDropdown.querySelector(".dropdown-menu");
          if (dropdownMenu) {
            parentDropdown.classList.add("open");
            if (isCollapsed) {
              // In collapsed state, keep the height auto for proper hover effects
              dropdownMenu.style.height = "auto";
            } else {
              // In expanded state, calculate the full height
              dropdownMenu.style.height = `${getFullMenuHeight(
                dropdownMenu
              )}px`;
            }
          }
        }

        // Open parent sub-dropdown if exists (works in both collapsed and expanded states)
        let parentSubDropdown = link.closest(".sub-dropdown-container");
        if (parentSubDropdown) {
          const subDropdownMenu =
            parentSubDropdown.querySelector(".sub-dropdown-menu");
          if (subDropdownMenu) {
            parentSubDropdown.classList.add("open");
            if (isCollapsed) {
              // In collapsed state, keep the height auto for proper hover effects
              subDropdownMenu.style.height = "auto";
            } else {
              // In expanded state, calculate the full height
              subDropdownMenu.style.height = `${getFullMenuHeight(
                subDropdownMenu
              )}px`;
            }
          }
        }
      }
    }
  });
};

// Add click event listener to all valid nav links for navigation and active state
document.querySelectorAll(".sidebar-nav .nav-link").forEach((link) => {
  if (
    link.getAttribute("href") &&
    link.getAttribute("href") !== "#" &&
    !link.classList.contains("dropdown-toggle")
  ) {
    link.addEventListener("click", (e) => {
      setActiveNavItem(link);
    });
  }
});
//...................................................................
//...........................Sidebar JS End..........................
//...................................................................

//...........................................................................
//...........................Navbar Dropdown JS Start..........................
//...........................................................................

document.addEventListener("DOMContentLoaded", () => {
  const dropdownParents = document.querySelectorAll(".dropdown-parent");
  const searchToggleButton = document.querySelector(".search-toggle-button");
  const mobileSearchDropdown = document.querySelector(
    ".mobile-search-dropdown"
  );

  const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

  // Function to show a dropdown
  const showDropdown = (dropdownBox) => {
    dropdownBox.classList.remove("opacity-0", "invisible", "scale-95");
    dropdownBox.classList.add("opacity-100", "visible", "scale-100");
  };

  // Function to hide a dropdown
  const hideDropdown = (dropdownBox) => {
    dropdownBox.classList.add("opacity-0", "invisible", "scale-95");
    dropdownBox.classList.remove("opacity-100", "visible", "scale-100");
  };

  // Function to close all dropdowns
  const closeAllDropdowns = (exceptDropdown = null) => {
    dropdownParents.forEach((parent) => {
      const dropdownBox = parent.querySelector(".dropdown-box");
      if (dropdownBox && dropdownBox !== exceptDropdown) {
        hideDropdown(dropdownBox);
      }
    });
    if (mobileSearchDropdown && mobileSearchDropdown !== exceptDropdown) {
      hideDropdown(mobileSearchDropdown);
    }
  };

  dropdownParents.forEach((parent) => {
    const toggleButton = parent.querySelector(".dropdown-toggle");
    const dropdownBox = parent.querySelector(".dropdown-box");

    if (toggleButton && dropdownBox) {
      // Click listener for both mobile and desktop (to close on click)
      toggleButton.addEventListener("click", (event) => {
        event.stopPropagation();

        if (isDesktop()) {
          if (!dropdownBox.classList.contains("opacity-0")) {
            hideDropdown(dropdownBox);
          }
        } else {
          // On mobile, click always toggles and closes others
          const isOpening = dropdownBox.classList.contains("opacity-0");
          closeAllDropdowns(dropdownBox);
          if (isOpening) {
            showDropdown(dropdownBox);
          } else {
            hideDropdown(dropdownBox);
          }
        }
      });

      // Hover listeners for desktop only
      parent.addEventListener("mouseenter", () => {
        if (isDesktop()) {
          closeAllDropdowns(dropdownBox);
          showDropdown(dropdownBox);
        }
      });

      parent.addEventListener("mouseleave", () => {
        if (isDesktop()) {
          hideDropdown(dropdownBox);
        }
      });
    }
  });

  // Toggle mobile search dropdown
  if (searchToggleButton && mobileSearchDropdown) {
    searchToggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpening = mobileSearchDropdown.classList.contains("opacity-0");

      closeAllDropdowns(mobileSearchDropdown);

      if (isOpening) {
        showDropdown(mobileSearchDropdown);
      } else {
        hideDropdown(mobileSearchDropdown);
      }
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", (event) => {
    let clickedInsideDropdown = false;
    dropdownParents.forEach((parent) => {
      if (parent.contains(event.target)) {
        clickedInsideDropdown = true;
      }
    });
    if (searchToggleButton && searchToggleButton.contains(event.target)) {
      clickedInsideDropdown = true;
    }
    if (mobileSearchDropdown && mobileSearchDropdown.contains(event.target)) {
      clickedInsideDropdown = true;
    }

    // If clicked outside, close all dropdowns.
    if (!clickedInsideDropdown) {
      closeAllDropdowns();
    }
  });
});
//...........................................................................
//...........................Navbar Dropdown JS End..........................
//...........................................................................
