// Top Bar Notice Board JS Start....................
const marqueeContainer = document.querySelector(".text_single");
const items = document.querySelectorAll(".js_text");
let marqueeAnimation;

// Function to create infinite horizontal scrolling
function createInfiniteLoop(container, items, speed = 70) {
  // Calculate total width of all items including margins
  let totalWidth = 0;
  items.forEach(item => {
    const itemWidth = item.offsetWidth;
    const itemMargin = parseInt(window.getComputedStyle(item).marginRight) || 0;
    totalWidth += itemWidth + itemMargin;
  });

  // Duplicate items for seamless looping
  const clones = [];
  items.forEach(item => {
    const clone = item.cloneNode(true);
    clones.push(clone);
    container.appendChild(clone);
  });

  // Get all items including clones
  const allItems = Array.from(items).concat(clones);

  // Animation variables
  let position = 0;
  let animationId;
  const containerWidth = container.offsetWidth;

  // Animation function
  function animate() {
    position -= 1;
    
    // Reset position when first set of items has completely scrolled left
    if (-position >= totalWidth / 2) {
      position = 0;
    }
    
    // Apply the transform
    container.style.transform = `translateX(${position}px)`;
    
    animationId = requestAnimationFrame(animate);
  }

  // Start animation
  function startAnimation() {
    if (!animationId) {
      animate();
    }
  }

  // Stop animation
  function stopAnimation() {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  // Store control functions
  marqueeAnimation = {
    play: startAnimation,
    pause: stopAnimation
  };

  // Start initially
  startAnimation();

  // Return animation controls
  return marqueeAnimation;
}

// Initialize the marquee
marqueeAnimation = createInfiniteLoop(marqueeContainer, items);

// Pause on hover
marqueeContainer.addEventListener("mouseenter", () => {
  marqueeAnimation.pause();
});

marqueeContainer.addEventListener("mouseleave", () => {
  marqueeAnimation.play();
});

// Top Bar Notice Board JS End....................

// Our Client Infinity Slide Start................
const scrollers = document.querySelectorAll(".scroller, .scroller2"); // Target both scroller and scroller2

// If a user hasn't opted in for reduced motion, then we add the animation
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addAnimation();
}

function addAnimation() {
  scrollers.forEach((scroller) => {
    // Add data-animated="true" to every .scroller and .scroller2 on the page
    scroller.setAttribute("data-animated", true);

    // Make an array from the elements within .scroller__inner or .scroller__inner2
    const scrollerInner = scroller.querySelector(
      ".scroller__inner, .scroller__inner2"
    ); // Ensure it works for both inner classes
    const scrollerContent = Array.from(scrollerInner.children);

    // For each item in the array, clone it
    // Add aria-hidden to it
    // Add it into the .scroller__inner or .scroller__inner2
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute("aria-hidden", true);
      scrollerInner.appendChild(duplicatedItem);
    });
  });
}
// Our Client Infinity Slide End................

// Vertical Notice Board Scrolling js Start...............
document.addEventListener('DOMContentLoaded', function() {
  const noticeItem = document.querySelector('.notice_item ul');
  const noticeItems = document.querySelectorAll('.notice_item ul li');
  let tickerHeight = noticeItems[0] ? noticeItems[0].offsetHeight : 0; // Get height of first item
  let interval;

  // Move last item to the top initially
  if (noticeItems.length > 0) {
    const lastItem = noticeItems[noticeItems.length - 1];
    noticeItem.insertBefore(lastItem, noticeItem.firstChild);
    noticeItem.style.marginTop = `-${tickerHeight}px`;
  }

  function moveTop() {
    // Apply transition
    noticeItem.style.transition = 'top 600ms ease';
    noticeItem.style.top = `-${tickerHeight}px`;

    // After animation completes
    setTimeout(function() {
      // Move first item to the end
      const firstItem = noticeItem.querySelector('li:first-child');
      noticeItem.appendChild(firstItem);
      
      // Reset position without animation
      noticeItem.style.transition = 'none';
      noticeItem.style.top = '0';
      
      // Force reflow to apply the reset
      void noticeItem.offsetHeight;
    }, 600);
  }

  // Set up interval for auto-scrolling
  function startInterval() {
    interval = setInterval(moveTop, 2000);
  }

  // Start the interval initially
  startInterval();

  // Pause scrolling on hover
  noticeItem.parentElement.addEventListener('mouseenter', function() {
    clearInterval(interval);
  });

  noticeItem.parentElement.addEventListener('mouseleave', function() {
    startInterval();
  });
});
// Vertical Notice Board Scrolling js End...............

// Home page Counter Js Start................
document.addEventListener("DOMContentLoaded", function () {
  // Counter animation function
  function animateCounters() {
    const counters = document.querySelectorAll(".numbers");
    const duration = 4000; // Duration in milliseconds
    const frameRate = 60; // Approx. 60 frames per second
    const interval = duration / frameRate; // Time per frame

    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-target"), 10);
      let current = 0;
      const increment = target / (duration / interval);

      const updateCounter = () => {
        current += increment;
        if (current >= target) {
          counter.textContent = target; // Ensure final value is accurate
        } else {
          counter.textContent = Math.floor(current);
          setTimeout(updateCounter, interval);
        }
      };

      updateCounter();
    });
  }

  // Observe when the stats section enters the viewport
  const statsSection = document.querySelector(".stats");
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters(); // Start the counters
          observer.disconnect(); // Stop observing after animation starts
        }
      });
    },
    { threshold: 1 } // Trigger when 50% of the section is visible
  );

  if (statsSection) {
    observer.observe(statsSection);
  }
});

// Home page Counter Js End................

// About Page Counter js .................
document.addEventListener("DOMContentLoaded", function () {
  // Counter animation function
  function animateCounters() {
    const count = document.querySelectorAll(".nmbr");
    const duration = 4000; // Duration in milliseconds
    const frameRate = 60; // Approx. 60 frames per second
    const interval = duration / frameRate; // Time per frame

    count.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-target"), 10);
      let current = 0;
      const increment = target / (duration / interval);

      const formatNumber = (number) => {
        if (number >= 1000) {
          return (number / 1000).toFixed(1).replace(/\.0$/, "") + "K"; // Format as K
        }
        return number;
      };

      const updateCounter = () => {
        current += increment;
        if (current >= target) {
          counter.textContent = formatNumber(target); // Ensure final value is accurate
        } else {
          counter.textContent = formatNumber(Math.floor(current));
          setTimeout(updateCounter, interval);
        }
      };

      updateCounter();
    });
  }

  // Observe when the stats section enters the viewport
  const statsSection = document.querySelector(".stats");
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters(); // Start the counters
          observer.disconnect(); // Stop observing after animation starts
        }
      });
    },
    { threshold: 1 } // Trigger when 50% of the section is visible
  );

  if (statsSection) {
    observer.observe(statsSection);
  }
});
// About Page Counter js .................

// Home page About Section Counter Start...................
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".counters");
  const counterSection = document.querySelector(".img_counter");
  let hasAnimated = false; // To ensure animation runs only once

  const formatNumber = (num, isKFormat = true) => {
    if (isKFormat && num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`.replace(".0", ""); // Format 1000 as 1K
    }
    return num; // Just return the number without formatting
  };

  const startCounters = () => {
    const duration = 4000; // Duration for all counters (in milliseconds)
    const interval = 20; // Interval for updates (in milliseconds)
    const steps = duration / interval; // Number of steps for the animation

    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target");
      let current = 0; // Start value
      const increment = target / steps; // Increment per step

      // Check if it's the specific counter (e.g., counter_box3) to exclude "K" formatting
      const isKFormat = counter.id !== "counter_box3"; // Exclude K format for counter_box3

      const updateCounter = () => {
        current += increment;
        if (current >= target) {
          counter.innerText = formatNumber(target, isKFormat); // Ensure final value is exact
        } else {
          counter.innerText = formatNumber(Math.ceil(current), isKFormat);
          setTimeout(updateCounter, interval);
        }
      };

      updateCounter();
    });
  };

  const handleScroll = () => {
    const sectionPosition = counterSection.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;

    if (sectionPosition < screenHeight && !hasAnimated) {
      hasAnimated = true; // Prevents multiple executions
      startCounters();
    }
  };

  window.addEventListener("scroll", handleScroll);
});
// Home page About Section Counter Start...................
// ............................................................................
// ............................................................................
// ............................................................................
// ............................................................................
// ............................................................................
// GSAP Animations for the Home About counters Start...............
// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Counter box 1 animation
gsap.fromTo(
  ".counter_box1",
  { x: "100%", opacity: 0 },
  {
    x: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".counter_box1",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);

// Counter box 2 animation
gsap.fromTo(
  ".counter_box2",
  { x: "-100%", opacity: 0 },
  {
    x: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".counter_box2",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);

// Counter box 3 animation
gsap.fromTo(
  ".counter_box3",
  { y: "-100%", opacity: 0 },
  {
    y: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".counter_box3",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);

//  GSAP Animations for the Home About counters End................
// About Section Counter End...................

// Home Page Gsap Start....
// Notice Animation
gsap.fromTo(
  ".notice_board",
  { y: "30%", opacity: 0 },
  {
    y: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".notice_board",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);

// Hero animation
gsap.fromTo(
  ".hero .theame",
  { x: "-30%", opacity: 0 },
  {
    x: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".hero .theame",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);
gsap.fromTo(
  ".offer",
  { y: "20%", opacity: 0 },
  {
    y: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".offer",
      start: "top 100%",
      end: "top 20%",
      toggleActions: "play none none none",
    },
  }
);
gsap.fromTo(
  ".Our_project",
  { y: "20%", opacity: 0 },
  {
    y: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".Our_project",
      start: "top 100%",
      end: "top 20%",
      toggleActions: "play none none none",
    },
  }
);

// Home Page Gsap End...........................

// Contact Us Page Gsap Start.....................
gsap.fromTo(
  ".contact_us .breadcrumb",
  { x: "-30%", opacity: 0 },
  {
    x: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".contact_us .breadcrumb",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);
gsap.fromTo(
  ".contact_us .contact_theame",
  { x: "30%", opacity: 0 },
  {
    x: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".contact_us .contact_theame",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);
gsap.fromTo(
  ".cta_section .cta",
  { y: "30%", opacity: 0 },
  {
    y: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".cta_section .cta",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);

gsap.fromTo(
  ".about_us .wrapper",
  { x: "-30%", opacity: 0 },
  {
    x: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".contact_us .breadcrumb",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);
gsap.fromTo(
  ".about_us .contact_theame",
  { x: "30%", opacity: 0 },
  {
    x: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".contact_us .contact_theame",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);

// Contact Us Page Gsap End....


// Notice Single Page Gsap End....
gsap.fromTo(
  ".single_notice",
  { y: "30%", opacity: 0 },
  {
    y: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".single_notice",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);
// Notice Single Page Gsap End....


// About Page Gsap Animation Start.............
gsap.fromTo(
  ".our_mission .images1 .small",
  { x: "30%", opacity: 0 },
  {
    x: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".our_mission .images1 .small",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);
gsap.fromTo(
  ".our_mission .images2 .small",
  { x: "-30%", opacity: 0 },
  {
    x: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".our_mission .images2 .small",
      start: "top 80%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);

gsap.fromTo(
  ".our_mission .heading_wrap",
  { y: "30%", opacity: 0 },
  {
    y: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".our_mission .heading_wrap",
      start: "top 100%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);

gsap.fromTo(
  ".our_mission .heading_wrap2",
  { y: "30%", opacity: 0 },
  {
    y: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".our_mission .heading_wrap2",
      start: "top 100%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);

gsap.fromTo(
  ".team",
  { y: "30%", opacity: 0 },
  {
    y: "0%",
    opacity: 1,
    duration: 1,
    scrollTrigger: {
      trigger: ".team",
      start: "top 100%",
      end: "top 50%",
      toggleActions: "play none none none",
    },
  }
);

// About Page Gsap Animation End.............




// Notice Single page Functionality................
 function toggleMenu(button) {
        document.querySelectorAll(".menu").forEach((menu) => {
          if (!menu.contains(button)) menu.classList.add("hidden");
        });
        const menu = button.nextElementSibling;
        menu.classList.toggle("hidden");
      }

      window.addEventListener("click", function (e) {
        if (!e.target.closest(".relative")) {
          document
            .querySelectorAll(".menu")
            .forEach((menu) => menu.classList.add("hidden"));
        }
      });

      function downloadViewerImage(button) {
        const viewerBox = button.closest("div").parentElement.parentElement.nextElementSibling;
        html2canvas(viewerBox).then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = "viewer-content.png";
          link.click();
        });
      }

      document.querySelectorAll(".viewer-box").forEach((viewer) => {
        const zoomContainer = viewer.querySelector(".zoom-container");
        let scale = 1,
          startX = 0,
          startY = 0,
          currentX = 0,
          currentY = 0;
        let isDragging = false,
          initialDistance = null;

        viewer.addEventListener("wheel", function (e) {
          e.preventDefault();
          scale += e.deltaY < 0 ? 0.1 : -0.1;
          scale = Math.min(Math.max(scale, 0.5), 5);
          applyTransform();
        });

        viewer.addEventListener("mousedown", (e) => {
          isDragging = true;
          startX = e.clientX - currentX;
          startY = e.clientY - currentY;
          viewer.style.cursor = "grabbing";
        });

        window.addEventListener("mousemove", (e) => {
          if (!isDragging) return;
          currentX = e.clientX - startX;
          currentY = e.clientY - startY;
          applyTransform();
        });

        window.addEventListener("mouseup", () => {
          isDragging = false;
          viewer.style.cursor = "grab";
        });

        viewer.addEventListener(
          "touchstart",
          (e) => {
            if (e.touches.length === 1) {
              startX = e.touches[0].clientX - currentX;
              startY = e.touches[0].clientY - currentY;
              isDragging = true;
            } else if (e.touches.length === 2) {
              initialDistance = getDistance(e.touches[0], e.touches[1]);
            }
          },
          { passive: false }
        );

        viewer.addEventListener(
          "touchmove",
          (e) => {
            if (e.touches.length === 1 && isDragging) {
              currentX = e.touches[0].clientX - startX;
              currentY = e.touches[0].clientY - startY;
              applyTransform();
            } else if (e.touches.length === 2 && initialDistance !== null) {
              const newDistance = getDistance(e.touches[0], e.touches[1]);
              scale = Math.min(
                Math.max(scale * (newDistance / initialDistance), 0.5),
                5
              );
              initialDistance = newDistance;
              applyTransform();
            }
          },
          { passive: false }
        );

        viewer.addEventListener("touchend", () => {
          isDragging = false;
          initialDistance = null;
        });

        function applyTransform() {
          zoomContainer.style.transform = `scale(${scale}) translate(${currentX}px, ${currentY}px)`;
        }

        function getDistance(t1, t2) {
          const dx = t1.clientX - t2.clientX;
          const dy = t1.clientY - t2.clientY;
          return Math.sqrt(dx * dx + dy * dy);
        }
      });
// Notice Single page Functionality................