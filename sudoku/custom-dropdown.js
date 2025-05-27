class MakeCustomDropdown {
  constructor(selector) {
    this.originalSelect = document.querySelector(selector);
    if (!this.originalSelect) return;

    this.init();
  }

  init() {
    // 1. Hide original select
    this.originalSelect.classList.add('custom-select-hidden');

    // 2. Create wrapper structure
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    // Set initial text based on currently selected option
    const selectedOption = this.originalSelect.options[this.originalSelect.selectedIndex];
    trigger.textContent = selectedOption ? selectedOption.text : '';

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-options';

    // 3. Populate custom options from original select options
    Array.from(this.originalSelect.options).forEach((option) => {
      const item = document.createElement('div');
      item.className = 'custom-option';
      if (option.selected) item.classList.add('selected');
      item.textContent = option.text;
      item.dataset.value = option.value;

      // Handle option selection click
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Update original select value & trigger change event
        this.originalSelect.value = item.dataset.value;
        this.originalSelect.dispatchEvent(new Event('change'));

        // Update trigger text
        trigger.textContent = item.textContent;

        // Update active classes
        optionsContainer.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        item.classList.add('selected');

        // Close dropdown
        wrapper.classList.remove('open');
      });

      optionsContainer.appendChild(item);
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsContainer);

    // 4. Insert custom component right where the original select was
    this.originalSelect.parentNode.insertBefore(wrapper, this.originalSelect.nextSibling);

    // 5. Toggle open/close on trigger click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close any other open dropdowns first
      document.querySelectorAll('.custom-select-wrapper').forEach(w => {
        if (w !== wrapper) w.classList.remove('open');
      });
      wrapper.classList.toggle('open');
    });

    // 6. Close when clicking outside
    document.addEventListener('click', () => {
      wrapper.classList.remove('open');
    });
  }
}