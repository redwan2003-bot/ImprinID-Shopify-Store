class ProductSubscriptions extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector('[data-selling-plan-input]');
    this.options = this.querySelectorAll('input[name="purchase_option"]');
    this.selects = this.querySelectorAll('[data-selling-plan-select]');

    this.options.forEach((option) => option.addEventListener('change', () => this.syncSelection()));
    this.selects.forEach((select) => select.addEventListener('change', () => this.syncSelection()));
    this.syncSelection();
  }

  syncSelection() {
    if (!this.input) return;

    const selectedOption = this.querySelector('input[name="purchase_option"]:checked');
    const selectedPlanId = selectedOption?.value || '';

    this.selects.forEach((select) => {
      const belongsToSelectedGroup = select.closest('.ii-selling-plan')?.contains(selectedOption);
      select.disabled = !belongsToSelectedGroup;
    });

    const activeSelect = Array.from(this.selects).find((select) => !select.disabled);
    this.input.value = activeSelect?.value || selectedPlanId;
  }

  getCurrentSellingPlanId() {
    return this.input?.value || '';
  }
}

if (!customElements.get('product-subscriptions')) {
  customElements.define('product-subscriptions', ProductSubscriptions);
}

window.ProductSubscriptions = ProductSubscriptions;
window.getCurrentSellingPlanId = () =>
  document.querySelector('product-subscriptions')?.getCurrentSellingPlanId() || '';
