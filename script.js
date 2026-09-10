(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const runningAnimations = new Set();
  let motionPaused = false;
  let printing = false;

  try {
    motionPaused = localStorage.getItem("portfolio-motion") === "off";
  } catch {
    // Motion preferences still work when browser storage is unavailable.
  }

  const canAnimate = () =>
    !motionPaused && !reducedMotion.matches && !printing && !document.hidden;

  const animateElement = (element, keyframes, options = {}) => {
    if (!canAnimate() || !element.animate) return;
    const animation = element.animate(keyframes, {
      duration: 720,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "backwards",
      ...options,
    });
    runningAnimations.add(animation);
    const release = () => {
      runningAnimations.delete(animation);
      animation.cancel();
    };
    animation.finished.then(release, release);
  };

  const settleAnimations = (within = document) => {
    for (const animation of runningAnimations) {
      const target = animation.effect.target;
      if (within.contains(target) || target.contains(within)) animation.cancel();
    }
  };

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#site-nav");
  const header = document.querySelector(".site-header");
  const mobileViewport = window.matchMedia("(max-width: 760px)");

  if (menuButton && navigation) {
    // Keep navigation visible if JavaScript is unavailable.
    menuButton.hidden = false;
    document.documentElement.classList.add("navigation-ready");

    const setMenu = (open, restoreFocus = false) => {
      const wasOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.querySelector(".menu-label").textContent = open
        ? "Close"
        : "Menu";
      navigation.classList.toggle("is-open", open);
      if (open && !wasOpen && mobileViewport.matches) {
        animateElement(
          navigation,
          [
            { opacity: 0, transform: "translateY(-6px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 240 },
        );
      } else if (!open) {
        settleAnimations(navigation);
      }
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
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY > 0 && scrollableHeight - window.scrollY <= 2) {
        currentId = sections[sections.length - 1]?.id || currentId;
      }
      if (header) {
        header.classList.toggle("is-scrolled", window.scrollY > 20);
        header.style.setProperty(
          "--reading-progress",
          scrollableHeight > 0
            ? Math.max(0, Math.min(1, window.scrollY / scrollableHeight))
            : 0,
        );
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
    document.querySelectorAll(".project-details").forEach((details) => {
      details.addEventListener("toggle", updateCurrentSection);
    });
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
      if (copyButton.disabled) return;
      copyButton.disabled = true;
      window.clearTimeout(toastTimeout);
      copyStatus.textContent = "";
      try {
        await navigator.clipboard.writeText(copyButton.dataset.email);
        copyStatus.textContent = "Email address copied. Say hello!";
      } catch {
        copyStatus.textContent =
          "Couldn’t copy. Select the email address, or use the email link.";
      } finally {
        copyButton.disabled = false;
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

  const motionButton = document.querySelector("[data-motion-toggle]");
  const updateMotion = () => {
    const enabled = !motionPaused && !reducedMotion.matches;
    document.documentElement.dataset.motion = enabled ? "full" : "reduced";
    if (!enabled) settleAnimations();
    if (motionButton) {
      motionButton.hidden = false;
      motionButton.disabled = reducedMotion.matches;
      motionButton.setAttribute("aria-pressed", String(enabled));
      motionButton.querySelector("[data-motion-label]").textContent = enabled
        ? "on"
        : "off";
      motionButton.title = reducedMotion.matches
        ? "Reduced motion is enabled in your system settings"
        : "Turn animations on or off";
    }
  };

  motionButton?.addEventListener("click", () => {
    motionPaused = !motionPaused;
    try {
      localStorage.setItem("portfolio-motion", motionPaused ? "off" : "on");
    } catch {
      // Keep the selected preference for this visit.
    }
    updateMotion();
  });
  reducedMotion.addEventListener("change", updateMotion);
  updateMotion();

  // Elements stay visible by default; animations only run as they enter view.
  const revealTargets = [...document.querySelectorAll("[data-reveal]")];
  const revealed = new WeakSet();
  let revealObserver;

  const reveal = (element, immediate = false) => {
    if (revealed.has(element)) return;
    revealed.add(element);
    revealObserver?.unobserve(element);
    if (immediate || element.contains(document.activeElement) || !canAnimate())
      return;

    const delay = Math.min(Number(element.dataset.revealDelay) || 0, 450);
    const isPortrait = element.dataset.reveal === "portrait";
    animateElement(
      element,
      [
        {
          opacity: 0,
          transform: isPortrait
            ? "translateY(20px) rotate(2deg) scale(0.97)"
            : "translateY(22px)",
        },
        { opacity: 1, transform: "translateY(0) rotate(0deg) scale(1)" },
      ],
      { duration: isPortrait ? 1000 : 720, delay },
    );

    element
      .querySelectorAll(".food-node, .match-node, .chat-bubble")
      .forEach((item, index) => {
        animateElement(
          item,
          [
            { opacity: 0, transform: "translateY(10px) scale(0.96)" },
            { opacity: 1, transform: "translateY(0) scale(1)" },
          ],
          { duration: 600, delay: delay + 140 + index * 110 },
        );
      });
    element.querySelectorAll(".diagram-line").forEach((line, index) => {
      animateElement(
        line,
        [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
        { duration: 650, delay: delay + 220 + index * 120 },
      );
    });
    element.querySelectorAll(".typing-bubble span").forEach((dot, index) => {
      animateElement(
        dot,
        [
          { transform: "translateY(0)", opacity: 0.5 },
          { transform: "translateY(-3px)", opacity: 1, offset: 0.5 },
          { transform: "translateY(0)", opacity: 0.5 },
        ],
        { duration: 650, delay: delay + 400 + index * 100, iterations: 2 },
      );
    });
  };

  const revealWithin = (target) => {
    settleAnimations(target);
    revealTargets.forEach((element) => {
      if (target.contains(element) || element.contains(target)) {
        reveal(element, true);
        settleAnimations(element);
      }
    });
  };

  const hashTarget = (hash) => {
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return null;
    }
  };

  const revealHashTarget = () => {
    const target = hashTarget(window.location.hash);
    if (target) revealWithin(target);
  };
  revealHashTarget();
  window.addEventListener("hashchange", revealHashTarget);
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (
      !link || event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    ) return;
    const target = hashTarget(link.hash);
    if (!target) return;
    revealWithin(target);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
  document.addEventListener("focusin", (event) => revealWithin(event.target));

  if (typeof window.IntersectionObserver === "function") {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target);
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px 32px 0px" },
    );
    revealTargets.forEach((element) => {
      if (!revealed.has(element)) revealObserver.observe(element);
    });
  }

  document.querySelectorAll(".project-details").forEach((details) => {
    details.addEventListener("toggle", () => {
      const content = details.querySelector("ul");
      if (!content) return;
      settleAnimations(content);
      if (details.open) {
        animateElement(
          content,
          [
            { opacity: 0, transform: "translateY(-4px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 240 },
        );
      }
    });
  });
  window.addEventListener("beforeprint", () => {
    printing = true;
    settleAnimations();
  });
  window.addEventListener("afterprint", () => {
    printing = false;
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) settleAnimations();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) settleAnimations();
  });
})();
