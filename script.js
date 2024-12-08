// script.js
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop();
    let loggedInUser = localStorage.getItem('loggedInUser') || null;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let postedItems = JSON.parse(localStorage.getItem('postedItems')) || {};

    function maskUserIdentifier(identifier) {
        if (!identifier) return '';
        return identifier.substring(0, 2) + '**' + identifier.substring(identifier.length - 2, identifier.length);
    }

    function updateHeaderLoginLink() {
        const container = document.getElementById('login-link-container');
        if (container) {
            if (loggedInUser) {
                // Find user data
                const user = users.find(u => u.username === loggedInUser || u.email === loggedInUser);
                let identifierToMask = user ? user.email : loggedInUser;
                // If user's email available, prefer email display, else username
                if (!user) {
                    // fallback if somehow no user found
                    identifierToMask = loggedInUser;
                } else {
                    identifierToMask = user.username;
                }

                const masked = maskUserIdentifier(identifierToMask);
                container.innerHTML = '<a href="profile.html">' + masked + '</a>';
            } else {
                container.innerHTML = '<a href="login.html" id="loginLink">login</a>';
            }
        }
    }


    // Registration page
    function handleRegisterPage() {
        if (currentPage !== 'register.html') return;
        const form = document.getElementById('registerForm');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value.trim();
            const username = document.getElementById('registerUsername').value.trim();
            const password = document.getElementById('registerPassword').value.trim();

            if (!(email.endsWith('@handong.ac.kr') || email.endsWith('@handong.edu'))) {
                alert('Email must be a valid Handong email ending with @handong.ac.kr or @handong.edu');
                return;
            }

            if (username.length < 6) {
                alert('Your username must be at least 6 characters.');
                return;
            }

            if (password.length < 6) {
                alert('Your password must be at least 6 characters.');
                return;
            }

            if (users.find(u => u.username === username || u.email === email)) {
                alert('Username or Email already exists. Choose another one.');
                return;
            }

            users.push({
                email: email,
                username: username,
                password: password,
                registerDate: new Date().toISOString()
            });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registration successful! Please login with your new account.');
            window.location.href = 'login.html';
        });
    }

    // Login page
    function handleLoginPage() {
        if (currentPage !== 'login.html') return;
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const loginVal = document.getElementById('loginInput').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            const user = users.find(u =>
                ((u.username === loginVal || u.email === loginVal) && u.password === password)
            );

            if (user) {
                // Store user.email as the identifier for loggedInUser
                localStorage.setItem('loggedInUser', user.email);
                loggedInUser = user.email;
                window.location.href = 'index.html';
            } else {
                alert('Invalid username or password, or user does not exist.');
            }
        });

        const goToRegister = document.getElementById('goToRegister');
        if (goToRegister) {
            goToRegister.addEventListener('click', function () {
                window.location.href = 'register.html';
            });
        }
    }

    // Profile page
    function handleProfilePage() {
        if (currentPage !== 'profile.html') return;
        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }

        const user = users.find(u => u.email === loggedInUser);
        if (!user) {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileRegisterDate').textContent = new Date(user.registerDate).toLocaleString();

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', function () {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });

        // Change password
        const changePassForm = document.getElementById('changePasswordForm');
        changePassForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const curPass = document.getElementById('currentPassword').value;
            if (curPass !== user.password) {
                alert('Current password is wrong!');
                return;
            }
            const newPass = document.getElementById('newPassword').value.trim();
            user.password = newPass;
            localStorage.setItem('users', JSON.stringify(users));
            alert('Password changed successfully!');
            // redirect to home page
            window.location.href = 'index.html';
        });
    }

    // Post item page
    function handlePostItemPage() {
        if (currentPage !== 'post_item.html') return;
        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }

        const form = document.getElementById('postItemForm');
        const listingTypes = form.querySelectorAll('input[name="listingType"]');
        const priceInputContainer = document.getElementById('priceInputContainer');
        const priceInput = document.getElementById('postPrice');
        const openToOffersCheckbox = document.getElementById('openToOffers');

        listingTypes.forEach(radio => {
            radio.addEventListener('change', function () {
                if (this.value === 'forSale') {
                    priceInputContainer.style.display = 'inline-block';
                } else {
                    priceInputContainer.style.display = 'none';
                }
            });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const title = document.getElementById('postTitle').value.trim();
            const category = document.getElementById('postCategory').value;
            const listingType = form.querySelector('input[name="listingType"]:checked').value;
            const description = document.getElementById('postDescription').value.trim();
            const location = document.getElementById('postLocation').value.trim();
            const images = document.getElementById('postImages').files;

            let imagePath = 'images/default.jpg';
            if (images.length > 0) {
                // In real scenario, we'd upload image; here we just simulate
                imagePath = 'images/' + images[0].name;
            }

            let priceVal = 0;
            let offers = false;
            if (listingType === 'forSale') {
                priceVal = parseInt(priceInput.value) || 0;
                offers = openToOffersCheckbox.checked;
            }

            if (!postedItems[category]) postedItems[category] = [];

            const newItem = {
                title: title,
                description: description,
                image: imagePath,
                location: location,
                seller: loggedInUser,
                listingType: listingType,
                openToOffers: offers,
                price: priceVal,
                postedDate: new Date().toISOString()
            };

            postedItems[category].push(newItem);
            localStorage.setItem('postedItems', JSON.stringify(postedItems));

            alert('Item posted successfully!');
            form.reset();
            priceInputContainer.style.display = 'none';
        });
    }

    // Category page: load items, merge posted items, sorting
    function handleCategoryPage() {
        if (currentPage !== 'category.html') return;

        const urlParams = new URLSearchParams(window.location.search);
        let category = urlParams.get('cat') || '';

        const itemsContainer = document.getElementById('categoryItems');
        const categorySelect = document.getElementById('categorySelect');
        const sortSelect = document.getElementById('sortSelect');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');

        // Set initial categorySelect
        categorySelect.value = category;

        let allData = {}; // to store fetched data

        function loadItems() {
            fetch('items.json')
                .then(res => res.json())
                .then(data => {
                    allData = data;
                    displayItems();
                })
                .catch(err => console.error(err));
        }

        function getAllItems() {
            // Merge predefined items and posted items
            let combined = [];
            if (category && allData[category]) {
                combined = combined.concat(allData[category]);
            } else if (!category) {
                // no category means show all
                for (let catKey in allData) {
                    combined = combined.concat(allData[catKey]);
                }
            }

            if (category && postedItems[category]) {
                combined = combined.concat(postedItems[category]);
            } else if (!category) {
                for (let catKey in postedItems) {
                    combined = combined.concat(postedItems[catKey]);
                }
            }

            return combined;
        }

        function displayItems() {
            let items = getAllItems();

            // Apply sorting
            const sortValue = sortSelect.value;
            if (sortValue === 'time_desc') {
                items.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
            } else if (sortValue === 'time_asc') {
                items.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
            } else if (sortValue === 'price_asc') {
                items.sort((a, b) => a.price - b.price);
            } else if (sortValue === 'price_desc') {
                items.sort((a, b) => b.price - a.price);
            }

            if (items.length === 0) {
                itemsContainer.innerHTML = '<p style="text-align:center;">No items found.</p>';
                return;
            }

            let htmlStr = '';
            items.forEach(item => {
                const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW') : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';
                htmlStr += `
                  <div class="item-card">
                      <img src="${item.image}" alt="${item.title}">
                      <h3>${item.title}</h3>
                      <p>${item.description}</p>
                      <p><strong>Location:</strong> ${item.location}</p>
                      <p><strong>Seller:</strong> ${item.seller}</p>
                      ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                  </div>
              `;
            });
            itemsContainer.innerHTML = htmlStr;
        }

        applyFiltersBtn.addEventListener('click', function () {
            category = categorySelect.value;
            displayItems();
        });

        loadItems();
    }

    function handleFavoritesPage() {
        if (currentPage !== 'favorites.html') return;
        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }
        // If user is logged in, we already have updateHeaderLoginLink() for username.
        // Load favorite items if you have any logic for that...
        // For now, just ensure username stays masked.
    }

    // Searching from index
    function handleSearchFromIndex() {
        if (currentPage !== 'index.html') return;
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('searchResults');
        let allDataCache = null;

        function loadAllItemsForSearch() {
            return fetch('items.json').then(res => res.json()).then(data => {
                // Merge posted items
                for (let catKey in postedItems) {
                    if (!data[catKey]) data[catKey] = [];
                    data[catKey] = data[catKey].concat(postedItems[catKey]);
                }
                return data;
            });
        }

        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return;

            if (!allDataCache) {
                loadAllItemsForSearch().then(data => {
                    allDataCache = data;
                    showSearchResults(query);
                });
            } else {
                showSearchResults(query);
            }
        });

        function showSearchResults(query) {
            let allItems = [];
            for (let cat in allDataCache) {
                allItems = allItems.concat(allDataCache[cat]);
            }

            let filtered = allItems.filter(item => item.title.toLowerCase().includes(query));
            if (filtered.length === 0) {
                searchResults.innerHTML = '<p>No results found.</p>';
                return;
            }

            let htmlStr = '<div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center;">';
            filtered.forEach(item => {
                const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW') : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';
                htmlStr += `
                  <div class="item-card">
                      <img src="${item.image}" alt="${item.title}">
                      <h3>${item.title}</h3>
                      <p>${item.description}</p>
                      <p><strong>Location:</strong> ${item.location}</p>
                      <p><strong>Seller:</strong> ${item.seller}</p>
                      ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                  </div>
              `;
            });
            htmlStr += '</div>';
            searchResults.innerHTML = htmlStr;
        }
    }

    updateHeaderLoginLink();
    handleRegisterPage();
    handleLoginPage();
    handleProfilePage();
    handlePostItemPage();
    handleCategoryPage();
    handleFavoritesPage();
    handleSearchFromIndex();
});