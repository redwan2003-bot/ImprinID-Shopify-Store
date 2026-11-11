class SageProductStandard {
  constructor(root) {
    this.root = root;
    this.tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    this.panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
    this.bindTabs();
    this.bindActions();
  }

  activate(tab) {
    const panelId = tab.getAttribute('aria-controls');
    for (const candidate of this.tabs) {
      const active = candidate === tab;
      candidate.setAttribute('aria-selected', active ? 'true' : 'false');
      candidate.tabIndex = active ? 0 : -1;
    }
    for (const panel of this.panels) panel.hidden = panel.id !== panelId;
    tab.focus();
  }

  bindTabs() {
    for (const tab of this.tabs) {
      tab.addEventListener('click', () => this.activate(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const current = this.tabs.indexOf(tab);
        let next = current;
        if (event.key === 'ArrowLeft') next = (current - 1 + this.tabs.length) % this.tabs.length;
        if (event.key === 'ArrowRight') next = (current + 1) % this.tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = this.tabs.length - 1;
        this.activate(this.tabs[next]);
      });
    }
  }

  bindActions() {
    const share = this.root.querySelector('[data-sage-share]');
    const print = this.root.querySelector('[data-sage-print]');
    if (share) {
      share.addEventListener('click', async () => {
        const url = share.dataset.shareUrl || window.location.href;
        if (navigator.share) {
          await navigator.share({ title: document.title, url });
          return;
        }
        await navigator.clipboard.writeText(url);
        share.dataset.originalLabel ||= share.textContent;
        share.textContent = share.dataset.copiedLabel;
        window.setTimeout(() => { share.textContent = share.dataset.originalLabel; }, 1600);
      });
    }
    if (print) print.addEventListener('click', () => window.print());
  }
}

document.querySelectorAll('[data-sage-product-standard]').forEach((root) => new SageProductStandard(root));
