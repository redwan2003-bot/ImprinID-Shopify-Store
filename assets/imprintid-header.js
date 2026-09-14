(() => {
  const DESKTOP_MEDIA = window.matchMedia('(min-width: 1100px)');

  const getFocusable = (container) =>
    Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), summary, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hidden && element.getClientRects().length > 0);

  const initializeHeader = (header) => {
    if (!header || header.dataset.iiInitialized === 'true') return;
    header.dataset.iiInitialized = 'true';

    const menus = Array.from(header.querySelectorAll('[data-ii-menu]'));
    const detailsMenus = Array.from(header.querySelectorAll('[data-ii-details-menu]'));
    const mobileToggle = header.querySelector('[data-ii-mobile-toggle]');
    const mobileNav = header.querySelector('[data-ii-mobile-nav]');

    const closeMenu = (menu, restoreFocus = false) => {
      const trigger = menu.querySelector('[data-ii-menu-trigger]');
      const panel = menu.querySelector('[data-ii-menu-panel]');
      if (!trigger || !panel || panel.hidden) return;

      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) trigger.focus();
    };

    const closeAllMenus = (except = null) => {
      menus.forEach((menu) => {
        if (menu !== except) closeMenu(menu);
      });
      detailsMenus.forEach((details) => {
        if (!except || !details.contains(except)) details.removeAttribute('open');
      });
    };

    const openMenu = (menu) => {
      const trigger = menu.querySelector('[data-ii-menu-trigger]');
      const panel = menu.querySelector('[data-ii-menu-panel]');
      if (!trigger || !panel) return;

      closeAllMenus(menu);
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    };

    menus.forEach((menu) => {
      const trigger = menu.querySelector('[data-ii-menu-trigger]');
      const panel = menu.querySelector('[data-ii-menu-panel]');
      if (!trigger || !panel) return;

      let closeTimer;

      trigger.addEventListener('click', () => {
        if (panel.hidden) openMenu(menu);
        else closeMenu(menu);
      });

      trigger.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowDown') return;
        event.preventDefault();
        openMenu(menu);
        getFocusable(panel)[0]?.focus();
      });

      menu.addEventListener('mouseenter', () => {
        if (!DESKTOP_MEDIA.matches) return;
        window.clearTimeout(closeTimer);
        openMenu(menu);
      });

      menu.addEventListener('mouseleave', () => {
        if (!DESKTOP_MEDIA.matches) return;
        closeTimer = window.setTimeout(() => {
          if (!menu.contains(document.activeElement)) closeMenu(menu);
        }, 140);
      });

      menu.addEventListener('focusout', (event) => {
        if (event.relatedTarget && menu.contains(event.relatedTarget)) return;
        window.setTimeout(() => {
          if (!menu.contains(document.activeElement)) closeMenu(menu);
        });
      });

      panel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeMenu(menu, true);
          return;
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        const focusable = getFocusable(panel);
        const currentIndex = focusable.indexOf(document.activeElement);
        if (currentIndex < 0) return;

        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = (currentIndex + direction + focusable.length) % focusable.length;
        focusable[nextIndex]?.focus();
      });
    });

    header.querySelectorAll('[data-ii-tab]').forEach((tab) => {
      const activate = () => {
        const index = tab.dataset.iiTab;
        header.querySelectorAll('[data-ii-tab]').forEach((item) => {
          item.classList.toggle('is-active', item === tab);
          if (item === tab) item.setAttribute('aria-current', 'true');
          else item.removeAttribute('aria-current');
        });
        header.querySelectorAll('[data-ii-tab-panel]').forEach((panel) => {
          const isActive = panel.dataset.iiTabPanel === index;
          panel.classList.toggle('is-active', isActive);
          panel.hidden = !isActive;
        });
      };

      tab.addEventListener('mouseenter', activate);
      tab.addEventListener('focus', activate);
    });

    detailsMenus.forEach((details) => {
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        menus.forEach((menu) => closeMenu(menu));
        detailsMenus.forEach((other) => {
          if (other !== details && !details.contains(other)) other.removeAttribute('open');
        });
      });

      details.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !details.open) return;
        event.preventDefault();
        details.removeAttribute('open');
        details.querySelector(':scope > summary')?.focus();
      });
    });

    const closeMobileNav = (restoreFocus = false) => {
      if (!mobileToggle || !mobileNav) return;
      mobileNav.hidden = true;
      mobileNav.classList.remove('is-open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) mobileToggle.focus();
    };

    const openMobileNav = () => {
      if (!mobileToggle || !mobileNav) return;
      closeAllMenus();
      mobileNav.hidden = false;
      mobileNav.classList.add('is-open');
      mobileToggle.setAttribute('aria-expanded', 'true');
    };

    mobileToggle?.addEventListener('click', () => {
      if (mobileNav.hidden) openMobileNav();
      else closeMobileNav();
    });

    mobileNav?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMobileNav(true);
    });

    mobileNav?.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMobileNav();
    });

    header.querySelector('.ii-search input[type="search"]')?.addEventListener('focus', () => closeAllMenus());

    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) {
        closeAllMenus();
        closeMobileNav();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const openMenuElement = menus.find((menu) => !menu.querySelector('[data-ii-menu-panel]')?.hidden);
      if (openMenuElement) closeMenu(openMenuElement, true);
      detailsMenus.forEach((details) => details.removeAttribute('open'));
    });

    const handleViewportChange = (event) => {
      if (event.matches) closeMobileNav();
      else closeAllMenus();
    };

    DESKTOP_MEDIA.addEventListener?.('change', handleViewportChange);
  };

  const initializeAllHeaders = (root = document) => {
    root.querySelectorAll('[data-ii-header]').forEach(initializeHeader);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializeAllHeaders());
  } else {
    initializeAllHeaders();
  }

  document.addEventListener('shopify:section:load', (event) => initializeAllHeaders(event.target));
})();
