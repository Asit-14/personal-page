(() => {
  "use strict";

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#site-nav");
  const mobileViewport = window.matchMedia("(max-width: 760px)");

  if (menuButton && navigation) {
    // Keep navigation visible if JavaScript is unavailable.
    menuButton.hidden = false;
    document.documentElement.classList.add("navigation-ready");

    const setMenu = (open, restoreFocus = false) => {
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.querySelector(".menu-label").textContent = open
        ? "Close"
        : "Menu";
      navigation.classList.toggle("is-open", open);
      if (restoreFocus) menuButton.focus();
    };

    menuButton.addEventListener("click", () => {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });

    navigation.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      setMenu(false);
      if (mobileViewport.matches) {
        const destination = document.querySelector(link.getAttribute("href"));
        if (destination) {
          destination.setAttribute("tabindex", "-1");
          destination.focus({ preventScroll: true });
        }
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        menuButton.getAttribute("aria-expanded") === "true"
      ) {
        setMenu(false, true);
      }
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".site-header")) setMenu(false);
    });
    document.addEventListener("focusin", (event) => {
      if (!event.target.closest(".site-header")) setMenu(false);
    });
    mobileViewport.addEventListener("change", () => setMenu(false));

    const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
    const sections = sectionLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    let scrollQueued = false;

    const updateCurrentSection = () => {
      const marker = Math.min(window.innerHeight * 0.35, 260);
      let currentId = "";
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker)
          currentId = section.id;
      }
      for (const link of sectionLinks) {
        if (link.hash === `#${currentId}`)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
      scrollQueued = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!scrollQueued) {
          scrollQueued = true;
          window.requestAnimationFrame(updateCurrentSection);
        }
      },
      { passive: true },
    );
    window.addEventListener("resize", updateCurrentSection, { passive: true });
    updateCurrentSection();
  }

  const copyButton = document.querySelector(".copy-email");
  const copyStatus = document.querySelector("#copy-status");
  let toastTimeout;
  if (
    copyButton &&
    copyStatus &&
    navigator.clipboard &&
    window.isSecureContext
  ) {
    copyButton.hidden = false;
    copyButton.addEventListener("click", async () => {
      window.clearTimeout(toastTimeout);
      copyStatus.textContent = "";
      try {
        await navigator.clipboard.writeText(copyButton.dataset.email);
        copyStatus.textContent = "Email address copied. Say hello!";
      } catch {
        copyStatus.textContent =
          "Couldn’t copy. Select the email address, or use the email link.";
      }
      copyStatus.classList.add("is-visible");
      toastTimeout = window.setTimeout(() => {
        copyStatus.classList.remove("is-visible");
        copyStatus.textContent = "";
      }, 5000);
    });
  }

  const printButton = document.querySelector("[data-print]");
  if (printButton) {
    printButton.hidden = false;
    printButton.addEventListener("click", () => window.print());
  }
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
})();
