document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    }));
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  async function submitForm(form, data, status) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.innerHTML : '';
    status.className = 'form-message';
    status.textContent = 'Sending your message...';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }
    try {
      const response = await fetch('submit-form.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams(data).toString()
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to send your message.');
      status.textContent = result.message;
      status.classList.add('success');
      form.reset();
      return true;
    } catch (error) {
      status.textContent = error.message || 'Could not send your message. Please try again.';
      status.classList.add('error');
      return false;
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    }
  }

  // Demo feedback form: client-side validation and visible status only.
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', event => {
      event.preventDefault();
      const status = document.getElementById('feedback-message-status');
      const name = feedbackForm.elements.name.value.trim();
      const rating = feedbackForm.elements.rating.value;
      const message = feedbackForm.elements.message.value.trim();
      status.className = 'form-message';
      if (name.length < 2 || !rating || message.length < 5) {
        status.textContent = 'Please enter your name, choose a rating, and write at least 5 characters of feedback.';
        status.classList.add('error');
        return;
      }
      submitForm(feedbackForm, {
        form_type: 'feedback',
        name,
        rating,
        message
      }, status);
    });
  }

  // Contact form: field-level validation and a success message.
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const status = document.getElementById('contact-status');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function showError(field, message) {
      field.classList.add('invalid');
      const error = field.closest('.field')?.querySelector('.field-error');
      if (error) error.textContent = message;
    }
    function clearError(field) {
      field.classList.remove('invalid');
      const error = field.closest('.field')?.querySelector('.field-error');
      if (error) error.textContent = '';
    }

    contactForm.querySelectorAll('input:not([type=checkbox]), select, textarea').forEach(field => {
      field.addEventListener('input', () => clearError(field));
      field.addEventListener('change', () => clearError(field));
    });

    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      status.className = 'form-message';
      status.textContent = '';
      let valid = true;
      const name = contactForm.elements.name;
      const email = contactForm.elements.email;
      const service = contactForm.elements.service;
      const project = contactForm.elements.project;
      const phone = contactForm.elements.phone;
      const consent = document.getElementById('consent');

      [name, email, service, project, phone].forEach(clearError);
      document.querySelector('.consent-error').textContent = '';

      if (name.value.trim().length < 2) { showError(name, 'Please enter at least 2 characters.'); valid = false; }
      if (!emailPattern.test(email.value.trim())) { showError(email, 'Enter a valid email address.'); valid = false; }
      if (!service.value) { showError(service, 'Please choose a service.'); valid = false; }
      if (project.value.trim().length < 10) { showError(project, 'Please describe your project in at least 10 characters.'); valid = false; }
      if (phone.value.trim() && !/^[+()\d\s.-]{7,20}$/.test(phone.value.trim())) { showError(phone, 'Please enter a valid phone number.'); valid = false; }
      if (!consent.checked) { document.querySelector('.consent-error').textContent = 'Please confirm before submitting.'; valid = false; }

      if (!valid) {
        status.textContent = 'Please review the highlighted fields and try again.';
        status.classList.add('error');
        const firstInvalid = contactForm.querySelector('.invalid, #consent:not(:checked)');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      submitForm(contactForm, {
        form_type: 'contact',
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        service: service.value,
        budget: contactForm.elements.budget.value,
        message: project.value.trim()
      }, status).then(success => {
        if (success) {
          contactForm.querySelectorAll('.invalid').forEach(field => field.classList.remove('invalid'));
          contactForm.querySelectorAll('.field-error').forEach(error => error.textContent = '');
        }
      });
    });
  }
});
