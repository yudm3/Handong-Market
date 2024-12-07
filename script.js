// script.js

document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop(); 
  // currentPage will be 'index.html', 'login.html', 'register.html', 'profile.html', etc.

  // Check if a user is logged in
  const loggedInUser = localStorage.getItem('loggedInUser');

  // This function updates the header on index.html if a user is logged in
  function updateIndexHeader() {
      const loginLinkContainer = document.getElementById('login-link-container');
      if (!loginLinkContainer) return; // Only run on index.html where this exists

      if (loggedInUser) {
          // User logged in, show username
          loginLinkContainer.innerHTML = '<a href="profile.html">' + loggedInUser + '</a>';
      } else {
          // User not logged in, show login link
          loginLinkContainer.innerHTML = '<a href="login.html" id="loginLink">login</a>';
      }
  }

  // Registration logic on register.html
  // Store username & password in localStorage for simplicity
  // We'll store a single user for this demo. In a real scenario, you'd have multiple users.
  function handleRegisterPage() {
      const registerForm = document.getElementById('registerForm');
      if (!registerForm) return;

      registerForm.addEventListener('submit', function(event) {
          event.preventDefault();
          const username = document.getElementById('registerUsername').value;
          const password = document.getElementById('registerPassword').value;

          // Save to localStorage. For a single user scenario:
          localStorage.setItem('registeredUsername', username);
          localStorage.setItem('registeredPassword', password);

          alert('Registration successful! Please login with your new account.');
          window.location.href = 'login.html';
      });
  }

  // Login logic on login.html
  function handleLoginPage() {
      const loginForm = document.getElementById('loginForm');
      if (!loginForm) return;

      loginForm.addEventListener('submit', function(event) {
          event.preventDefault();
          const username = document.getElementById('loginUsername').value;
          const password = document.getElementById('loginPassword').value;

          // Retrieve the registered credentials
          const regUser = localStorage.getItem('registeredUsername');
          const regPass = localStorage.getItem('registeredPassword');

          // Check credentials
          if (username === regUser && password === regPass) {
              // Correct, log the user in
              localStorage.setItem('loggedInUser', username);
              window.location.href = 'index.html';
          } else {
              alert('Username or password is incorrect or user does not exist.');
          }
      });

      const goToRegister = document.getElementById('goToRegister');
      if (goToRegister) {
          goToRegister.addEventListener('click', function() {
              window.location.href = 'register.html';
          });
      }
  }

  // Profile page logic
  function handleProfilePage() {
      if (currentPage !== 'profile.html') return;
      
      const usernameDisplay = document.getElementById('profileUsername');
      const logoutBtn = document.getElementById('logoutBtn');

      if (usernameDisplay && loggedInUser) {
          usernameDisplay.textContent = loggedInUser;
      }

      if (logoutBtn) {
          logoutBtn.addEventListener('click', function() {
              // Clear logged in user
              localStorage.removeItem('loggedInUser');
              window.location.href = 'index.html';
          });
      }
  }

  // Run functions depending on the page
  updateIndexHeader();
  handleRegisterPage();
  handleLoginPage();
  handleProfilePage();
});
