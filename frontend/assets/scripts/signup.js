const form = document.getElementById('signupForm');
const messageBox = document.getElementById('signupMessage');

form.addEventListener('submit', async e => {
  e.preventDefault();

  messageBox.textContent = '';
  messageBox.className = 'signup-message';
  messageBox.style.display = 'none';

  const username = form[0].value;
  const email = form[1].value;
  const password = form[2].value;

  try {
    const res = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      messageBox.textContent = data.error || 'Error creating account';
      messageBox.classList.add('error');
      messageBox.style.display = 'block';
      return;
    }

    messageBox.textContent = 'Account created successfully. Please log in.';
    messageBox.classList.add('success');
    messageBox.style.display = 'block';

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);

  } catch (err) {
    messageBox.textContent = 'A user with that email address already exists. Please log in.';
    messageBox.classList.add('error');
    messageBox.style.display = 'block';
  }
});
