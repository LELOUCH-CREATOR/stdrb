// Check if user is authenticated before loading any page
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['login.html', 'register.html'];
    
    if (!token && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return false;
    } else if (token && publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Run check immediately when script loads
checkAuth(); 