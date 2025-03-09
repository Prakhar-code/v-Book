const handleLogout = async () => {
    try {
        const token = localStorage.getItem('token');
        await fetch('/vBook/api/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Clear token and other user data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');  // if you store user data

        // Redirect to login page
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout failed:', error);
    }
};