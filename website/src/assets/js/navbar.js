// Navbar Start.........................
document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.getElementById("menu-btn");
    const closeMenuBtn = document.getElementById("close-menu");
    const mobileMenu = document.getElementById("mobile-menu");
    const menuOverlay = document.getElementById("menu-overlay");

    // Track currently open dropdowns
    let currentOpenDropdown = null;
    let currentOpenSubDropdown = null;

    // Mobile menu toggle
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.remove("-translate-x-full");
      menuOverlay.classList.remove("hidden");
    });

    // Close mobile menu
    function closeMobileMenu() {
      mobileMenu.classList.add("-translate-x-full");
      menuOverlay.classList.add("hidden");
      closeAllDropdowns();
    }

    closeMenuBtn.addEventListener("click", closeMobileMenu);
    menuOverlay.addEventListener("click", closeMobileMenu);

    // Mobile dropdown functionality
    const dropdownButtons = document.querySelectorAll(
      ".mobile-dropdown-btn"
    );

    dropdownButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation();

        const dropdown = this.nextElementSibling;
        const icon = this.querySelector(".mobile-dropdown-icon");

        // Close other dropdowns at the same level
        if (currentOpenDropdown && currentOpenDropdown !== dropdown) {
          const otherIcon =
            currentOpenDropdown.previousElementSibling.querySelector(
              ".mobile-dropdown-icon"
            );
          currentOpenDropdown.classList.remove("open");
          if (otherIcon) otherIcon.classList.remove("open");
        }

        // Toggle current dropdown
        dropdown.classList.toggle("open");
        icon.classList.toggle("open");

        // Update current open dropdown
        currentOpenDropdown = dropdown.classList.contains("open")
          ? dropdown
          : null;

        // Close any open sub-dropdowns when closing main dropdown
        if (!dropdown.classList.contains("open")) {
          closeAllSubDropdowns();
        }
      });
    });

    // Sub-mobile dropdown functionality
    const subDropdownButtons = document.querySelectorAll(
      ".sub-mobile-dropdown-btn"
    );

    subDropdownButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation();

        const subDropdown = this.nextElementSibling;
        const icon = this.querySelector(".mobile-dropdown-icon");

        // Close other sub-dropdowns at the same level
        if (
          currentOpenSubDropdown &&
          currentOpenSubDropdown !== subDropdown
        ) {
          const otherIcon =
            currentOpenSubDropdown.previousElementSibling.querySelector(
              ".mobile-dropdown-icon"
            );
          currentOpenSubDropdown.classList.remove("open");
          if (otherIcon) otherIcon.classList.remove("open");
        }

        // Toggle current sub-dropdown
        subDropdown.classList.toggle("open");
        icon.classList.toggle("open");

        // Update current open sub-dropdown
        currentOpenSubDropdown = subDropdown.classList.contains("open")
          ? subDropdown
          : null;
      });
    });

    // Close all dropdowns
    function closeAllDropdowns() {
      document
        .querySelectorAll(".mobile-dropdown.open")
        .forEach((dropdown) => {
          dropdown.classList.remove("open");
        });

      document
        .querySelectorAll(".mobile-dropdown-btn .mobile-dropdown-icon.open")
        .forEach((icon) => {
          icon.classList.remove("open");
        });

      currentOpenDropdown = null;
      closeAllSubDropdowns();
    }

    // Close all sub-dropdowns
    function closeAllSubDropdowns() {
      document
        .querySelectorAll(".sub-mobile-dropdown.open")
        .forEach((dropdown) => {
          dropdown.classList.remove("open");
        });

      document
        .querySelectorAll(
          ".sub-mobile-dropdown-btn .mobile-dropdown-icon.open"
        )
        .forEach((icon) => {
          icon.classList.remove("open");
        });

      currentOpenSubDropdown = null;
    }

    // Close dropdowns when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !e.target.closest(".mobile-dropdown-btn") &&
        !e.target.closest(".sub-mobile-dropdown-btn") &&
        !e.target.closest(".mobile-dropdown") &&
        !e.target.closest(".sub-mobile-dropdown")
      ) {
        closeAllDropdowns();
      }
    });

    // Dynamic dropdown positioning for desktop
    function adjustDropdownPositions() {
      if (window.innerWidth >= 1024) {
        // Only for desktop
        document.querySelectorAll(".dropdown").forEach((dropdown) => {
          const dropdownContent =
            dropdown.querySelector(".dropdown-content");
          if (!dropdownContent) return;

          const dropdownRect = dropdown.getBoundingClientRect();
          const contentWidth = dropdownContent.offsetWidth;

          // Check if dropdown would go off screen to the right
          if (dropdownRect.left + contentWidth > window.innerWidth) {
            dropdownContent.classList.add("dropdown-content-left");
            dropdownContent.classList.remove("dropdown-content-right");
          } else {
            dropdownContent.classList.add("dropdown-content-right");
            dropdownContent.classList.remove("dropdown-content-left");
          }

          // Adjust sub-dropdowns
          dropdown
            .querySelectorAll(".has-sub-dropdown")
            .forEach((subDropdown) => {
              const subDropdownContent = subDropdown.querySelector(
                ".sub-dropdown-content"
              );
              if (!subDropdownContent) return;

              const subDropdownRect = subDropdown.getBoundingClientRect();
              const subContentWidth = subDropdownContent.offsetWidth;

              // Check if sub-dropdown would go off screen to the right
              if (
                subDropdownRect.left + contentWidth + subContentWidth >
                window.innerWidth
              ) {
                subDropdownContent.classList.add(
                  "sub-dropdown-content-left"
                );
                subDropdownContent.classList.remove(
                  "sub-dropdown-content-right"
                );
              } else {
                subDropdownContent.classList.add(
                  "sub-dropdown-content-right"
                );
                subDropdownContent.classList.remove(
                  "sub-dropdown-content-left"
                );
              }
            });
        });
      }
    }

    // Run on load and resize
    adjustDropdownPositions();
    window.addEventListener("resize", adjustDropdownPositions);

    // Also adjust when dropdowns are hovered (in case content changes)
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      dropdown.addEventListener("mouseenter", adjustDropdownPositions);
    });
  });
// Navbar End.........................