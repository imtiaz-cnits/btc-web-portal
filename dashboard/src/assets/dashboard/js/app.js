// ...................................................................
// ...................Auth Function Js End...........................
// ...................................................................

document.addEventListener("DOMContentLoaded", function () {
  const signInForm = document.querySelector("form");
  const signupSection = document.getElementById("signup_section");
  const createAccountBtn = document.querySelector(".create_account_btn");

  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", function (e) {
      e.preventDefault();

      signInForm.classList.add("fade-out");

      signInForm.addEventListener("animationend", function handler() {
        signInForm.classList.remove("fade-out");
        signInForm.classList.add("hidden");

        signupSection.classList.remove("hidden");
        signupSection.classList.add("fade-in");

        signInForm.removeEventListener("animationend", handler);
      });
    });
  }

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("sign_in_toggle")) {
      e.preventDefault();

      signupSection.classList.add("fade-out");

      signupSection.addEventListener("animationend", function handler() {
        signupSection.classList.remove("fade-out");
        signupSection.classList.add("hidden");

        signInForm.classList.remove("hidden");
        signInForm.classList.add("fade-in");

        setTimeout(() => {
          signInForm.classList.remove("fade-in");
        }, 300);

        signupSection.removeEventListener("animationend", handler);
      });
    }
  });
});

// ...................................................................
// ......................Auth Function Js End.........................
// ...................................................................

// ...................................................................
// .........................Dark Mode JS Start........................
// ...................................................................
// Check for saved theme preference or use system preference
(function () {
  // Immediately invoked function to avoid polluting global scope

  // Theme detection and initial setup
  function initializeTheme() {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  // Icon visibility setup
  function initializeIcons() {
    const themeToggleDarkIcon = document.getElementById(
      "theme-toggle-dark-icon"
    );
    const themeToggleLightIcon = document.getElementById(
      "theme-toggle-light-icon"
    );

    if (!themeToggleDarkIcon || !themeToggleLightIcon) return;

    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      themeToggleLightIcon.classList.remove("hidden");
      themeToggleDarkIcon.classList.add("hidden");
    } else {
      themeToggleDarkIcon.classList.remove("hidden");
      themeToggleLightIcon.classList.add("hidden");
    }
  }

  // Theme toggle handler
  function setupThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    const themeToggleDarkIcon = document.getElementById(
      "theme-toggle-dark-icon"
    );
    const themeToggleLightIcon = document.getElementById(
      "theme-toggle-light-icon"
    );

    if (!themeToggle) return;

    themeToggle.addEventListener("click", function () {
      // Toggle icons
      if (themeToggleDarkIcon) themeToggleDarkIcon.classList.toggle("hidden");
      if (themeToggleLightIcon) themeToggleLightIcon.classList.toggle("hidden");

      // Toggle theme
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        localStorage.theme = "light";
      } else {
        document.documentElement.classList.add("dark");
        localStorage.theme = "dark";
      }
    });
  }

  // Initialize everything when DOM is loaded
  document.addEventListener("DOMContentLoaded", function () {
    initializeTheme();
    initializeIcons();
    setupThemeToggle();
  });

  // Optional: Watch for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!("theme" in localStorage)) {
        initializeTheme();
        initializeIcons();
      }
    });
})();

//...................................................................
//.........................Dark Mode JS End........................
//...................................................................

//...........................................................................
//..........................Table Edit Modal JS Start........................
//...........................................................................
// Modal state and elements
const modalEdit = document.getElementById("editModal");

// Check if modal exists before proceeding
if (!modalEdit) {
  // Do nothing if modal not found
  // Just skip the modal logic
} else {
  const modalOverlay = modalEdit.querySelector(".modal-overlay");
  const modalContainer = modalEdit.querySelector(".modal-container");
  let modalOpen = false;

  // Verify the child elements exist
  if (!modalOverlay || !modalContainer) {
    console.error("Modal overlay or container not found");
  } else {
    // Rest of your modal code...
    function openEditModal() {
      modalEdit.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");

      // Trigger reflow to enable animations
      void modalEdit.offsetHeight;

      // Activate animations
      modalOverlay.classList.add("active");
      modalContainer.classList.add("active");

      modalOpen = true;
    }

    function closeModal() {
      // Start closing animations
      modalOverlay.classList.remove("active");
      modalContainer.classList.remove("active");

      // Wait for animation to complete before hiding
      setTimeout(() => {
        modalEdit.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
        modalOpen = false;
      }, 300);
    }

    // Close modal when clicking outside or pressing Escape
    modalOverlay.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalOpen) {
        closeModal();
      }
    });
  }
}
//...........................................................................
//...........................................................................

//................................................................................
// .........Searchable select functionality - encapsulated for reusability........
//...............................................................................
function initializeSearchableSelect(selectContainer) {
  // Find elements specific to this searchable select instance
  const realSelect = selectContainer.querySelector("select");
  const searchInput = selectContainer.querySelector(".searchable-select-input");
  const searchOptions = selectContainer.querySelector(
    ".searchable-select-options"
  );
  const dropdownIcon = selectContainer.querySelector(".searchable-select-icon");

  // Function to populate the custom options div from the hidden select
  function initOptions() {
    searchOptions.innerHTML = ""; // Clear existing options

    // Add a default "Select an option" if not already present in the real select
    // This ensures the custom input starts empty and the user can select nothing
    if (!realSelect.querySelector('option[value=""]')) {
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Select an option";
      realSelect.prepend(defaultOption);
    }
    realSelect.value = ""; // Ensure the real select is reset
    searchInput.value = ""; // Ensure the visible input is empty

    // Create and append custom option divs for each option in the real select
    Array.from(realSelect.options).forEach((option) => {
      // Skip the empty default option when creating the display list
      if (option.value === "") {
        return;
      }

      const div = document.createElement("div");
      div.className = "searchable-option";
      div.textContent = option.text;
      div.dataset.value = option.value; // Store the actual value

      // Add click listener to each custom option
      div.addEventListener("click", () => {
        realSelect.value = option.value; // Update the hidden select's value
        searchInput.value = option.text; // Update the displayed input text

        // Remove 'selected' class from all options in this specific searchable select
        selectContainer
          .querySelectorAll(".searchable-option")
          .forEach((el) => el.classList.remove("selected"));
        div.classList.add("selected"); // Add 'selected' to the clicked option

        searchOptions.classList.remove("show"); // Hide options
        dropdownIcon.classList.remove("rotate"); // Reset icon rotation
      });
      searchOptions.appendChild(div);
    });
  }

  // Initialize options when the component is set up
  initOptions();

  // New logic to handle search input based on option count
  const nonDefaultOptions = Array.from(realSelect.options).filter(
    (option) => option.value !== ""
  );

  if (nonDefaultOptions.length <= 3) {
    // Make input read-only (can't type) but clickable
    searchInput.setAttribute("readonly", "true");
    // Remove input event listener to prevent filtering when read-only
    searchInput.removeEventListener("input", filterOptions);
    // Adjust styling to indicate read-only state
    searchInput.classList.add("bg-gray-100", "cursor-pointer");
    searchInput.classList.remove("cursor-text"); // Ensure it looks clickable
    searchOptions.style.maxHeight = "none"; // Disable scroll for fewer options
    searchOptions.style.overflowY = "hidden"; // Hide scrollbar
    searchInput.placeholder = "Select an option"; // More appropriate placeholder
  } else {
    // Enable search input
    searchInput.removeAttribute("readonly");
    // Add input event listener back
    searchInput.addEventListener("input", filterOptions);
    // Remove read-only styling
    searchInput.classList.remove("bg-gray-100", "cursor-pointer");
    searchInput.classList.add("cursor-text"); // Ensure it looks like a text input
    searchOptions.style.maxHeight = "200px"; // Re-enable scroll
    searchOptions.style.overflowY = "auto"; // Re-enable scrollbar
    searchInput.placeholder = "Search...";
  }

  // Toggles the visibility of options and rotates the dropdown icon
  function toggleDropdown() {
    const isShowing = searchOptions.classList.toggle("show");
    if (isShowing) {
      filterOptions(); // Show all options (or filtered based on current input) when opening
      dropdownIcon.classList.add("rotate");
    } else {
      dropdownIcon.classList.remove("rotate");
    }
  }

  // Event listeners for opening/closing dropdown
  // The click event listener on searchInput will still work for opening the dropdown
  searchInput.addEventListener("click", toggleDropdown);
  dropdownIcon.addEventListener("click", toggleDropdown);

  // Filters the custom options based on the search input (only active if not read-only)
  function filterOptions() {
    if (searchInput.hasAttribute("readonly")) {
      return; // Do not filter if input is read-only
    }
    const searchTerm = searchInput.value.toLowerCase();
    const options = selectContainer.querySelectorAll(".searchable-option");

    options.forEach((option) => {
      const text = option.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        option.style.display = "block";
      } else {
        option.style.display = "none";
      }
    });
  }

  // Close dropdown when clicking outside of the entire searchable select component
  document.addEventListener("click", function (e) {
    if (
      !selectContainer.contains(e.target) && // If click is outside the selectContainer
      searchOptions.classList.contains("show") // And the options are currently visible
    ) {
      searchOptions.classList.remove("show");
      dropdownIcon.classList.remove("rotate");
    }
  });
}

//.....................................................................................
//........ Searchable Multi-select functionality - encapsulated for reusability.......
//.....................................................................................

function initializeAppMultiSelect(selectContainer) {
  // Find elements specific to this searchable select instance
  const realSelect = selectContainer.querySelector("#appRealSelect");
  const searchInput = selectContainer.querySelector("#appMultiSelectInput");
  const searchOptions = selectContainer.querySelector(
    "#appMultiSelectOptionsList"
  );
  const dropdownIcon = selectContainer.querySelector(
    "#appMultiSelectDropdownIcon"
  );
  const selectedTagsContainer = selectContainer.querySelector(
    ".app-multiselect-selected-tags-wrapper"
  );

  let selectedValues = [];

  // Function to render selected tags in the input area
  function renderSelectedTags() {
    // Clear existing tags and the input value
    selectedTagsContainer
      .querySelectorAll(".app-multiselect-tag")
      .forEach((tag) => tag.remove());
    searchInput.value = "";

    selectedValues.forEach((value) => {
      const option = Array.from(realSelect.options).find(
        (opt) => opt.value === value
      );
      if (option) {
        const tag = document.createElement("span");
        tag.className = "app-multiselect-tag";
        tag.innerHTML = `
                ${option.text}
                <span class="app-multiselect-tag-close" data-value="${option.value}">&times;</span>
              `;
        // Insert tag before the input field
        selectedTagsContainer.insertBefore(tag, searchInput);

        tag
          .querySelector(".app-multiselect-tag-close")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            removeSelection(value);
          });
      }
    });

    // Update the hidden select element's selected options
    Array.from(realSelect.options).forEach((option) => {
      option.selected = selectedValues.includes(option.value);
    });
  }

  // Function to add a selection
  function addSelection(value, text) {
    if (!selectedValues.includes(value)) {
      selectedValues.push(value);
      renderSelectedTags();
      updateOptionClasses();
      searchInput.focus();
    }
  }

  // Function to remove a selection
  function removeSelection(value) {
    selectedValues = selectedValues.filter((val) => val !== value);
    renderSelectedTags();
    updateOptionClasses();
    filterOptions();
    searchInput.focus();
  }

  // Function to update 'selected' class on custom options
  function updateOptionClasses() {
    selectContainer
      .querySelectorAll(".app-multiselect-option-item")
      .forEach((el) => {
        if (selectedValues.includes(el.dataset.value)) {
          el.classList.add("selected");
        } else {
          el.classList.remove("selected");
        }
      });
  }

  // Function to populate the custom options div from the hidden select
  function initOptions() {
    searchOptions.innerHTML = "";

    Array.from(realSelect.options).forEach((option) => {
      const div = document.createElement("div");
      div.className = "app-multiselect-option-item";
      div.textContent = option.text;
      div.dataset.value = option.value;

      // Add click listener to each custom option
      div.addEventListener("click", () => {
        // Toggle selection
        if (selectedValues.includes(option.value)) {
          removeSelection(option.value);
        } else {
          addSelection(option.value, option.text);
        }
        // Keep options visible if the input is not read-only for continued selection
        if (!searchInput.hasAttribute("readonly")) {
          searchInput.value = "";
          filterOptions();
        } else {
          searchOptions.classList.remove("show");
          dropdownIcon.classList.remove("rotate");
        }
      });
      searchOptions.appendChild(div);
    });
    updateOptionClasses();
    renderSelectedTags();
  }

  // Initialize options when the component is set up
  initOptions();

  // Toggles the visibility of options and rotates the dropdown icon
  function toggleDropdown() {
    const isShowing = searchOptions.classList.toggle("show");
    if (isShowing) {
      filterOptions();
      dropdownIcon.classList.add("rotate");
      searchInput.focus();
    } else {
      dropdownIcon.classList.remove("rotate");
    }
  }

  // Event listeners for opening/closing dropdown
  selectedTagsContainer.addEventListener("click", (e) => {
    // Only toggle if the click is on the container itself, not a tag close button
    if (e.target === selectedTagsContainer || e.target === searchInput) {
      toggleDropdown();
    }
  });
  dropdownIcon.addEventListener("click", toggleDropdown);

  // Filters the custom options based on the search input (only active if not read-only)
  function filterOptions() {
    if (searchInput.hasAttribute("readonly")) {
      return; // Do not filter if input is read-only
    }
    const searchTerm = searchInput.value.toLowerCase();
    const options = selectContainer.querySelectorAll(
      ".app-multiselect-option-item"
    );

    options.forEach((option) => {
      const text = option.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        option.style.display = "block";
      } else {
        option.style.display = "none";
      }
    });
  }

  // Close dropdown when clicking outside of the entire searchable select component
  document.addEventListener("click", function (e) {
    if (
      !selectContainer.contains(e.target) &&
      searchOptions.classList.contains("show")
    ) {
      searchOptions.classList.remove("show");
      dropdownIcon.classList.remove("rotate");
    }
  });
}

// Initialize the specific appMultiSelect instance when the DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const appMultiSelectInstance = document.getElementById("appMultiSelect");
  if (appMultiSelectInstance) {
    initializeAppMultiSelect(appMultiSelectInstance);
  }
});

//...............................................................................
// Initialize all searchable select instances on the page when the DOM is ready
//...............................................................................
document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll(".searchable-select")
    .forEach(initializeSearchableSelect);
});
//...........................................................................
//..........................Table Edit Modal JS End........................
//...........................................................................
