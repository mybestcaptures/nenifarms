// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    function isLoggedIn() {
        return localStorage.getItem('neniFarmsLoggedIn') === 'true';
    }

    function setLoginState(loggedIn) {
        localStorage.setItem('neniFarmsLoggedIn', loggedIn ? 'true' : 'false');
        updateNavBasedOnLogin();
    }

    // --- Navigation Update ---
    const loginNavButton = document.getElementById('loginNavButton');
    const reportNavButton = document.getElementById('reportNavButton');
    const loginNavButtonMobile = document.getElementById('loginNavButtonMobile');
    const reportNavButtonMobile = document.getElementById('reportNavButtonMobile');
    const loginFooterLink = document.getElementById('loginFooterLink');

    function updateNavBasedOnLogin() {
        const loggedIn = isLoggedIn();
        if (loginNavButton) loginNavButton.classList.toggle('hidden', loggedIn);
        if (reportNavButton) reportNavButton.classList.toggle('hidden', !loggedIn);
        if (loginNavButtonMobile) loginNavButtonMobile.classList.toggle('hidden', loggedIn);
        if (reportNavButtonMobile) reportNavButtonMobile.classList.toggle('hidden', !loggedIn);
        if (loginFooterLink) loginFooterLink.classList.toggle('hidden', loggedIn);
    }

    // --- Mobile Menu ---
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('icon-open');
    const iconClose = document.getElementById('icon-close');

    if (menuButton && mobileMenu && iconOpen && iconClose) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            iconOpen.classList.toggle('hidden');
            iconClose.classList.toggle('hidden');
        });
    }

    // --- Dynamic Year ---
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // --- Login Form Handling (Only on login.html) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Add actual validation if needed:
            // const username = document.getElementById('username').value;
            // const password = document.getElementById('password').value;
            // if (username === "admin" && password === "password123") { // Example validation
                 setLoginState(true);
                 window.location.href = 'report.html'; // Redirect to report page
            // } else {
            //     alert("Invalid credentials!");
            // }
        });
    }

    // --- Logout Button Handling (Only on report.html) ---
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            setLoginState(false);
            window.location.href = 'index.html'; // Redirect to home page
        });
    }
    
    // --- Report Page Access Control (Run on all pages that might try to access report) ---
    // If on report.html and not logged in, redirect
    if (window.location.pathname.endsWith('report.html') && !isLoggedIn()) {
        window.location.href = 'login.html';
    }


    // --- Gemini API Integration (Only on index.html or where needed) ---
    const summarizeButton = document.getElementById('summarizeButton');
    const pageContentToSummarizeDiv = document.getElementById('pageContentToSummarize'); // Note: Renamed for clarity

    if (summarizeButton && pageContentToSummarizeDiv) {
        const summaryOutputDiv = document.getElementById('summaryOutput');
        const summaryTextElement = document.getElementById('summaryText');
        const summaryErrorDiv = document.getElementById('summaryError');
        const buttonSpinner = document.getElementById('buttonSpinner');

        summarizeButton.addEventListener('click', async () => {
            if (!buttonSpinner || !summarizeButton || !summaryOutputDiv || !summaryErrorDiv || !summaryTextElement) {
                console.error("One or more summary elements are missing.");
                return;
            }
            buttonSpinner.classList.remove('hidden');
            summarizeButton.disabled = true;
            summaryOutputDiv.classList.add('hidden');
            summaryErrorDiv.classList.add('hidden');

            const contentToSummarize = pageContentToSummarizeDiv.innerText;
            const prompt = `Please provide a concise summary of the following information about Neni Farms:\n\n${contentToSummarize}`;
            const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = ""; // Will be injected if necessary
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                const result = await response.json();
                if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                    summaryTextElement.textContent = result.candidates[0].content.parts[0].text;
                    summaryOutputDiv.classList.remove('hidden');
                } else {
                    throw new Error('Failed to extract summary from API response.');
                }
            } catch (error) {
                console.error('Error fetching summary:', error);
                summaryErrorDiv.classList.remove('hidden');
            } finally {
                buttonSpinner.classList.add('hidden');
                summarizeButton.disabled = false;
            }
        });
    }

    // --- Initial Setup ---
    updateNavBasedOnLogin(); // Set initial nav state on every page load
});
