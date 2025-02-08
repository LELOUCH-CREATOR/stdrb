document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('bi-eye');
            this.classList.toggle('bi-eye-slash');
        });
    });

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/auth/login', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    localStorage.setItem('token', data.token);
                    window.location.href = 'index.html';
                } else {
                    const response = JSON.parse(xhr.responseText);
                    alert(response.message || 'Login failed');
                }
            };
            
            xhr.onerror = function() {
                console.error('Login error');
                alert('An error occurred during login');
            };
            
            xhr.send(JSON.stringify({ email, password }));
        });
    }

    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/auth/register', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onload = function() {
                if (xhr.status === 201) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    const response = JSON.parse(xhr.responseText);
                    alert(response.message || 'Registration failed');
                }
            };
            
            xhr.onerror = function() {
                console.error('Registration error');
                alert('An error occurred during registration');
            };
            
            xhr.send(JSON.stringify({ fullName, email, password }));
        });
    }
}); 