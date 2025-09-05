// Mobile Menu Toggle
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Close menu when clicking on a link
    document.querySelectorAll(".nav-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Navbar background on scroll
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        navbar.style.background = "rgba(255, 255, 255, 0.98)";
        navbar.style.borderBottom = "1px solid #e0e0e0";
      } else {
        navbar.style.background = "rgba(255, 255, 255, 0.95)";
        navbar.style.borderBottom = "1px solid #e0e0e0";
      }
    });
  }

  // Animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document
    .querySelectorAll(".feature-card, .timeline-item, .metrics-category")
    .forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });

  // Copy to clipboard functionality
  window.copyToClipboard = function (text) {
    navigator.clipboard
      .writeText(text)
      .then(function () {
        // Show success message
        const copyBtn = event.target;
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "✅";
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      })
      .catch(function (err) {
        console.error("Failed to copy: ", err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      });
  };

  // Metrics counter animation
  function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
      start += increment;
      if (start < target) {
        element.textContent = Math.floor(start);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    }

    updateCounter();
  }

  // Animate metrics when they come into view
  const metricsObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const metricValue = entry.target.querySelector(".metric-value");
          if (metricValue && !metricValue.classList.contains("animated")) {
            metricValue.classList.add("animated");
            const value = metricValue.textContent;

            // Extract number from text
            const numberMatch = value.match(/\d+/);
            if (numberMatch) {
              const number = parseInt(numberMatch[0]);
              const prefix = value.substring(0, value.indexOf(numberMatch[0]));
              const suffix = value.substring(
                value.indexOf(numberMatch[0]) + numberMatch[0].length
              );

              metricValue.textContent = prefix + "0" + suffix;

              setTimeout(() => {
                animateCounter(
                  {
                    textContent: "",
                  },
                  number,
                  1500
                );

                let current = 0;
                const timer = setInterval(() => {
                  current += Math.ceil(number / 60);
                  if (current >= number) {
                    current = number;
                    clearInterval(timer);
                  }
                  metricValue.textContent = prefix + current + suffix;
                }, 25);
              }, 200);
            }
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll(".metrics-category").forEach((metric) => {
    metricsObserver.observe(metric);
  });

  // Demo code syntax highlighting
  function highlightCode() {
    const codeBlocks = document.querySelectorAll(
      ".demo-code code, .code-block code"
    );

    codeBlocks.forEach((block) => {
      let html = block.innerHTML;

      // Highlight JavaScript keywords
      html = html.replace(
        /\b(const|let|var|function|async|await|require|module|exports|if|else|for|while|return|try|catch|throw|new|class|extends|import|export|default)\b/g,
        '<span class="keyword">$1</span>'
      );

      // Highlight strings
      html = html.replace(
        /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        '<span class="string">$1$2$1</span>'
      );

      // Highlight numbers
      html = html.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

      // Highlight comments
      html = html.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');

      // Highlight function names
      html = html.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
        '<span class="function">$1</span>('
      );

      block.innerHTML = html;
    });
  }

  highlightCode();

  // Progress bar for roadmap items
  function updateRoadmapProgress() {
    const completedItems = document.querySelectorAll(
      ".timeline-item.completed"
    ).length;
    const totalItems = document.querySelectorAll(".timeline-item").length;
    const progressPercentage = (completedItems / totalItems) * 100;

    // Create progress indicator if it doesn't exist
    let progressIndicator = document.querySelector(".roadmap-progress");
    if (!progressIndicator && document.querySelector(".roadmap")) {
      progressIndicator = document.createElement("div");
      progressIndicator.className = "roadmap-progress";
      progressIndicator.innerHTML = `
                <div class="progress-label">Roadmap Progress: ${Math.round(
                  progressPercentage
                )}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
            `;

      // Add CSS for progress bar
      const style = document.createElement("style");
      style.textContent = `
                .roadmap-progress {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .progress-label {
                    font-weight: 600;
                    margin-bottom: 10px;
                    color: #374151;
                }
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #3b82f6);
                    transition: width 1s ease-in-out;
                }
            `;
      document.head.appendChild(style);

      const roadmapSection = document.querySelector(".roadmap .container");
      if (roadmapSection) {
        roadmapSection.insertBefore(
          progressIndicator,
          roadmapSection.querySelector("h2").nextSibling
        );
      }
    }
  }

  updateRoadmapProgress();

  // Easter egg: Konami code
  let konamiCode = [];
  const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A

  document.addEventListener("keydown", function (e) {
    konamiCode.push(e.keyCode);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(",") === konamiSequence.join(",")) {
      // Trigger special animation
      document.body.style.animation = "rainbow 2s infinite";

      const style = document.createElement("style");
      style.textContent = `
                @keyframes rainbow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
            `;
      document.head.appendChild(style);

      setTimeout(() => {
        document.body.style.animation = "";
        style.remove();
      }, 4000);

      console.log("🎉 LogStack Developer Mode Activated! 🎉");
      konamiCode = [];
    }
  });

  // Performance monitoring
  if ("performance" in window) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        const loadTime =
          performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`📊 LogStack website loaded in ${loadTime}ms`);

        // Report to analytics if available
        if (typeof gtag !== "undefined") {
          gtag("event", "page_load_time", {
            event_category: "Performance",
            value: loadTime,
          });
        }
      }, 0);
    });
  }

  // Service worker registration for offline support
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (registration) {
        console.log("📱 Service Worker registered successfully");
      })
      .catch(function (error) {
        console.log("❌ Service Worker registration failed");
      });
  }
});

// Theme switcher (for future implementation)
function initThemeSwitcher() {
  const theme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);

  // Create theme toggle button
  const themeToggle = document.createElement("button");
  themeToggle.className = "theme-toggle";
  themeToggle.innerHTML = theme === "dark" ? "☀️" : "🌙";
  themeToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border: none;
        border-radius: 50%;
        background: #2563eb;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transition: all 0.3s ease;
    `;

  themeToggle.addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    themeToggle.innerHTML = newTheme === "dark" ? "☀️" : "🌙";
  });

  document.body.appendChild(themeToggle);
}

// Initialize theme switcher (commented out for now)
// initThemeSwitcher();
