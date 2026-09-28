// Prefill the "Preferred doctor" field if the page was opened with ?doctor=...
const params = new URLSearchParams(window.location.search);
const preferredDoctor = params.get('doctor');
if (preferredDoctor) {
  const doctorSelect = document.getElementById('doctor');
  const match = Array.from(doctorSelect.options).find(o => o.value === preferredDoctor);
  if (match) doctorSelect.value = preferredDoctor;
}

// Don't allow picking a date in the past
document.getElementById('date').min = new Date().toISOString().split('T')[0];

const form = document.getElementById('appointment-form');
const submitBtn = document.getElementById('submit-btn');
const messageBox = document.getElementById('form-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageBox.className = 'form-message';
  messageBox.textContent = '';

  const payload = Object.fromEntries(new FormData(form).entries());

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }

    messageBox.textContent = "Thanks — your appointment request has been sent. We'll contact you shortly to confirm.";
    messageBox.className = 'form-message success';
    form.reset();
  } catch (err) {
    messageBox.textContent = err.message || 'Could not send your request. Please try again or call us directly.';
    messageBox.className = 'form-message error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Request appointment';
  }
});
