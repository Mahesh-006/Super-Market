// Theme toggle functionality
function initTheme() {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const mobileThemeIcon = document.getElementById('mobileThemeIcon');
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        html.classList.add('dark');
        updateIcons('dark_mode');
    } else {
        html.classList.remove('dark');
        updateIcons('light_mode');
    }
    
    function updateIcons(iconName) {
        if (themeIcon) themeIcon.textContent = iconName;
        if (mobileThemeIcon) mobileThemeIcon.textContent = iconName;
    }
    
    // Toggle theme function
    function toggleTheme() {
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            updateIcons('light_mode');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            updateIcons('dark_mode');
        }
    }
    
    // Add event listeners
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', initTheme);