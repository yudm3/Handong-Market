document.addEventListener('readystatechange', () => console.log('ready state change: ' + document.readyState));

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded!");

    const currentPage = window.location.pathname.split('/').pop();
    let loggedInUser = localStorage.getItem('loggedInUser') || null;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let postedItems = JSON.parse(localStorage.getItem('postedItems')) || {};
    let allLoadedItems = [];

    //***************************************************************
    // Fetch items from items.json and then merge with postedItems
    //***************************************************************
    function fetchAndLoadItems() {
        return fetch('items.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                // data is in {Category: [items]} format
                // Convert to a single combined array and assign itemIDs if missing
                let combined = [];
                for (let catKey in data) {
                    data[catKey].forEach(it => {
                        if (!it.category) it.category = catKey;
                        combined.push(it);
                    });
                }

                // Now merge postedItems
                for (let catKey in postedItems) {
                    let postedCatItems = postedItems[catKey];
                    if (!Array.isArray(postedCatItems)) postedCatItems = [postedCatItems];
                    postedCatItems.forEach(it => {
                        if (!it.category) it.category = catKey;
                        // If no itemID assigned, assign a random unique ID
                        if (!it.itemID) {
                            it.itemID = Math.floor(Math.random() * 1000000);
                        }
                    });
                    combined = combined.concat(postedCatItems);
                }

                allLoadedItems = combined;
                window.allLoadedItems = allLoadedItems; // so other functions can access it
            })
            .catch(error => console.error('Error loading items.json:', error));
    }

    //***************************************************************
    // Helper functions for user, favorites, and item operations
    //***************************************************************

    function maskUserIdentifier(identifier) {
        if (!identifier) return '';
        if (identifier.length > 4) {
            return identifier.substring(0, 2) + '**' + identifier.substring(identifier.length - 2);
        } else {
            return identifier;
        }
    }

    function updateHeaderLoginLink() {
        const container = document.getElementById('login-link-container');
        if (container) {
            if (loggedInUser) {
                const user = users.find(u => u.email === loggedInUser);
                let identifierToMask = user ? user.username : loggedInUser;
                const masked = maskUserIdentifier(identifierToMask);
                container.innerHTML = '<a href="profile.html">' + masked + '</a>';
            } else {
                container.innerHTML = '<a href="login.html" id="loginLink">login</a>';
            }
        }
    }

    function getUserFavorites() {
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        return favs[loggedInUser] || [];
    }

    function isItemFavorited(itemID) {
        if (!loggedInUser) return false;
        const userFavs = getUserFavorites();
        return userFavs.some(it => it.itemID === itemID);
    }

    function getItemByID(itemID) {
        if (!window.allLoadedItems) return null;
        itemID = parseInt(itemID, 10);
        return window.allLoadedItems.find(i => i.itemID === itemID);
    }

    function toggleFavorite(itemID) {
        if (!loggedInUser) return;
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        let userFavs = favs[loggedInUser] || [];

        const item = getItemByID(itemID);
        if (!item) return;

        const index = userFavs.findIndex(it => it.itemID === itemID);
        if (index >= 0) {
            userFavs.splice(index, 1);
        } else {
            userFavs.push({ itemID: itemID, item: item });
        }

        favs[loggedInUser] = userFavs;
        localStorage.setItem('favorites', JSON.stringify(favs));
    }

    function displayItemNotFound() {
        const container = document.querySelector('.item-details-container');
        if (container) {
            container.innerHTML = '<p style="text-align:center;">Item not found.</p>';
        }
    }

    function populateItemDetails(item) {
        const mainImage = document.getElementById('mainImage');
        const titleEl = document.querySelector('.item-title');
        const categoryEl = document.querySelector('.item-category span');
        const locationEl = document.querySelector('.item-location span');
        const priceEl = document.querySelector('.item-price span');
        const descEl = document.querySelector('.item-description');
        const sellerEl = document.querySelector('.item-seller');

        if (mainImage) mainImage.src = item.image;
        if (titleEl) titleEl.textContent = item.title || 'No Title';
        if (categoryEl) categoryEl.textContent = item.category || 'All';
        if (locationEl) locationEl.textContent = item.location || 'No Location';
        if (descEl) descEl.innerHTML = `<b>Description:</b> ${item.description || 'No description'}`;
        if (sellerEl) sellerEl.innerHTML = `<b>Seller:</b> ${item.seller || 'Unknown'}`;

        if (priceEl) {
            if (item.listingType === 'forSale') {
                priceEl.textContent = (item.price || 0) + ' KRW';
            } else if (item.listingType === 'free' || item.listingType === 'lostAndFound') {
                priceEl.textContent = '0 KRW';
            } else {
                priceEl.textContent = '';
            }
        }

        const contactSellerButton = document.getElementById('contactSellerBtn');
        if (contactSellerButton) {
            contactSellerButton.addEventListener('click', function () {
                alert('This feature will be implemented soon. Stay tuned!');
            });
        }
    }

    //***************************************************************
    // Page handling sections
    //***************************************************************

    //--- Register Page ---//
    function handleRegisterPage() {
        if (currentPage !== 'register.html') return;
        const form = document.getElementById('registerForm');
        if (!form) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value.trim();
            const username = document.getElementById('registerUsername').value.trim();
            const password = document.getElementById('registerPassword').value.trim();

            if (!(email.endsWith('@handong.ac.kr') || email.endsWith('@handong.edu'))) {
                alert('Email must end with @handong.ac.kr or @handong.edu');
                return;
            }

            if (username.length < 6) {
                alert('Username must be at least 6 characters.');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters.');
                return;
            }

            if (users.find(u => u.username === username || u.email === email)) {
                alert('Username or Email already exists.');
                return;
            }

            users.push({
                email: email,
                username: username,
                password: password,
                registerDate: new Date().toISOString()
            });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        });
    }

    //--- Login Page ---//
    function handleLoginPage() {
        if (currentPage !== 'login.html') return;
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const loginVal = document.getElementById('loginInput').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            const user = users.find(u =>
                ((u.username === loginVal || u.email === loginVal) && u.password === password)
            );

            if (user) {
                localStorage.setItem('loggedInUser', user.email);
                loggedInUser = user.email;
                window.location.href = 'index.html';
            } else {
                alert('Invalid username/password or user does not exist.');
            }
        });

        const goToRegister = document.getElementById('goToRegister');
        if (goToRegister) {
            goToRegister.addEventListener('click', function () {
                window.location.href = 'register.html';
            });
        }
    }

    //--- Profile Page ---//
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

        const profileUsername = document.getElementById('profileUsername');
        const profileEmail = document.getElementById('profileEmail');
        const profileRegisterDate = document.getElementById('profileRegisterDate');

        if (profileUsername) profileUsername.textContent = user.username;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileRegisterDate) profileRegisterDate.textContent = new Date(user.registerDate).toLocaleString();

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                localStorage.removeItem('loggedInUser');
                window.location.href = 'index.html';
            });
        }

        const changePassForm = document.getElementById('changePasswordForm');
        if (changePassForm) {
            changePassForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const curPass = document.getElementById('currentPassword').value;
                const newPass = document.getElementById('newPassword').value.trim();
                const confirmPass = document.getElementById('confirmPassword').value.trim();

                if (curPass !== user.password) {
                    alert('Current password is wrong!');
                    return;
                }
                if (newPass !== confirmPass) {
                    alert('Passwords do not match.');
                    return;
                }

                user.password = newPass;
                localStorage.setItem('users', JSON.stringify(users));
                alert('Password changed successfully!');
                window.location.href = 'index.html';
            });
        }
    }

    //--- Post Item Page ---//
    function handlePostItemPage() {
        if (currentPage !== 'post_item.html') return;
        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }

        const user = users.find(u => u.email === loggedInUser);
        const sellerUsername = user ? user.username : 'Unknown';

        const form = document.getElementById('postItemForm');
        if (!form) return;

        const priceInput = document.getElementById('postPrice');
        const openToOffersCheckbox = document.getElementById('openToOffers');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const title = document.getElementById('postTitle').value.trim();
            const category = document.getElementById('postCategory').value;
            let listingType;
            if (category === "Free") {
                listingType = "free";
            } else if (category === "LostnFound") {
                listingType = "lostAndFound";
            } else {
                listingType = "forSale";
            }

            const description = document.getElementById('postDescription').value.trim();
            const location = document.getElementById('postLocation').value.trim();
            const images = document.getElementById('postImages').files;

            let imagePath = 'item-images/default.png';
            if (images.length > 0) {
                const imageName = images[0].name.trim();
                if (imageName) {
                    imagePath = 'item-images/' + imageName;
                }
            }

            let priceVal = 0;
            let offers = false;
            if (listingType === 'forSale') {
                priceVal = parseInt(priceInput.value) || 0;
                offers = openToOffersCheckbox.checked;
            } else {
                priceVal = 0;
                offers = false;
            }

            if (!postedItems[category]) {
                postedItems[category] = [];
            }

            let nextID = Math.floor(Math.random() * 1000000);
            const newItem = {
                itemID: nextID,
                title: title,
                description: description,
                image: imagePath,
                location: location,
                seller: sellerUsername,
                listingType: listingType,
                openToOffers: offers,
                price: priceVal,
                postedDate: new Date().toISOString(),
                category: category
            };

            postedItems[category].push(newItem);
            localStorage.setItem('postedItems', JSON.stringify(postedItems));
            console.log(localStorage.getItem('postedItems'));
            alert('Item posted successfully!');
            window.location.href = 'index.html';
        });
    }

    //--- Category Page ---//
    function handleCategoryPage() {
        if (currentPage !== 'category.html') return;

        const urlParams = new URLSearchParams(window.location.search);
        let category = urlParams.get('cat') || '';

        const itemsContainer = document.getElementById('categoryItems');
        const categorySelect = document.getElementById('categorySelect');
        const sortSelect = document.getElementById('sortSelect');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');

        if (categorySelect) categorySelect.value = category;

        function getAllItems() {
            console.log(window.allLoadedItems);
            let items = window.allLoadedItems || [];
            if (category) {
                items = items.filter(it => it.category === category);
            }
            return items;
        }

        function attachCategoryItemEventListeners() {
            const heartButtons = document.querySelectorAll('.heart-btn');
            const buyButtons = document.querySelectorAll('.buy-btn');

            heartButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                    if (!loggedInUser) {
                        window.location.href = 'login.html';
                        return;
                    }
                    toggleFavorite(itemID);
                    const isFav = isItemFavorited(itemID);
                    e.currentTarget.querySelector('img').src = `images/${isFav ? 'heartLiked.svg' : 'heartUnliked.svg'}`;
                });
            });

            buyButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                    if (!loggedInUser) {
                        window.location.href = 'login.html';
                        return;
                    }
                    window.location.href = `item_details.html?itemID=${itemID}`;
                });
            });
        }

        function displayItems() {
            const items = getAllItems();
            console.log("displayItems");
            console.log(items);

            const sortValue = sortSelect ? sortSelect.value : 'time_desc';
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
                const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW')
                    : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';
                const isFav = isItemFavorited(item.itemID);
                const heartIcon = isFav ? 'heartLiked.svg' : 'heartUnliked.svg';

                htmlStr += `
                    <div class="item-card" data-itemid="${item.itemID}">
                        <img src="${item.image}" alt="${item.title}">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <p><strong>Location:</strong> ${item.location}</p>
                        <p><strong>Seller:</strong> ${item.seller}</p>
                        ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}

                        <div class="item-actions">
                            <button class="heart-btn" data-itemid="${item.itemID}">
                                <img src="images/${heartIcon}" alt="heart" width="24">
                            </button>
                            <button class="buy-btn" data-itemid="${item.itemID}">Buy</button>
                        </div>
                    </div>
                `;
            });
            itemsContainer.innerHTML = htmlStr;
            attachCategoryItemEventListeners();
        }

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', function () {
                category = categorySelect ? categorySelect.value : '';
                displayItems();
            });
        }

        displayItems();
    }

    //--- Favorites Page ---//
    function handleFavoritesPage() {
        if (currentPage !== 'favorites.html') return;
        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }

        const favContainer = document.getElementById('favoritesContainer');
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        let userFavs = favs[loggedInUser] || [];

        if (userFavs.length === 0) {
            favContainer.innerHTML = "<p>You don't have liked items</p>";
            return;
        }

        let htmlStr = '';
        userFavs.forEach(f => {
            const item = f.item;
            const itemID = item.itemID;
            const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW')
                : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';

            htmlStr += `
                <div class="favorite-item" data-itemid="${itemID}">
                    <img src="${item.image}" alt="${item.title}" style="max-width:100%; height:auto;">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <p><strong>Location:</strong> ${item.location}</p>
                    <p><strong>Seller:</strong> ${item.seller}</p>
                    ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                    <div class="item-actions">
                        <button class="heart-btn" data-itemid="${itemID}">
                            <img src="images/heartLiked.svg" alt="heart" width="24">
                        </button>
                        <button class="buy-btn" data-itemid="${itemID}">Buy</button>
                    </div>
                </div>
            `;
        });

        favContainer.innerHTML = htmlStr;

        const heartButtons = favContainer.querySelectorAll('.heart-btn');
        const buyButtons = favContainer.querySelectorAll('.buy-btn');

        heartButtons.forEach(btn => {
            btn.addEventListener('click', e => {
                const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                if (!loggedInUser) {
                    window.location.href = 'login.html';
                    return;
                }
                toggleFavorite(itemID);
                e.currentTarget.closest('.favorite-item').remove();
                if (favContainer.children.length === 0) {
                    favContainer.innerHTML = "<p>You don't have liked items</p>";
                }
            });
        });

        buyButtons.forEach(btn => {
            btn.addEventListener('click', e => {
                const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                if (!loggedInUser) {
                    window.location.href = 'login.html';
                    return;
                }
                window.location.href = `item_details.html?itemID=${itemID}`;
            });
        });
    }

    //--- Index (Search) Page ---//
    function handleSearchFromIndex() {
        if (currentPage !== 'index.html') return;

        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('searchResults');

        if (!searchForm) return;
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return;

            let allItems = window.allLoadedItems || [];
            let filtered = allItems.filter(item => item.title.toLowerCase().includes(query));
            if (filtered.length === 0) {
                searchResults.innerHTML = '<p>No results found.</p>';
                return;
            }

            let htmlStr = '<div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center;">';
            filtered.forEach(item => {
                const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW')
                    : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';
                htmlStr += `
                <div class="item-card">
                    <img src="${item.image}" alt="${item.title}">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <p><strong>Location:</strong> ${item.location}</p>
                        <p><strong>Seller:</strong> ${item.seller}</p>
                        ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                        <div class="item-actions">
                            <button class="buy-btn" data-itemid="${item.itemID}">View</button>
                        </div>
                    </div>
                `;
            });
            htmlStr += '</div>';
            searchResults.innerHTML = htmlStr;

            const viewButtons = searchResults.querySelectorAll('.buy-btn');
            viewButtons.forEach(btn => {
                btn.addEventListener('click', e => {
                    const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                    if (!loggedInUser) {
                        window.location.href = 'login.html';
                        return;
                    }
                    window.location.href = `item_details.html?itemID=${itemID}`;
                });
            });
        });
    }

    //--- Item Details Page ---//
    function handleItemDetailsPage() {
        if (currentPage !== 'item_details.html') return;

        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const itemID = urlParams.get('itemID');
        if (!itemID) {
            displayItemNotFound();
            return;
        }

        const item = getItemByID(parseInt(itemID, 10));
        if (!item) {
            displayItemNotFound();
            return;
        }

        populateItemDetails(item);
    }

    //***************************************************************
    // Initialization: Fetch items and then run page handlers
    //***************************************************************
    fetchAndLoadItems().then(() => {
        updateHeaderLoginLink();
        handleRegisterPage();
        handleLoginPage();
        handleProfilePage();
        handlePostItemPage();
        handleCategoryPage();
        handleFavoritesPage();
        handleSearchFromIndex();
        handleItemDetailsPage();
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById("postCategory");
    const priceContainer = document.getElementById("priceContainer");

    function togglePriceVisibility() {
        if (!categorySelect || !priceContainer) return;
        const selectedCategory = categorySelect.value;
        if (selectedCategory === "Free" || selectedCategory === "LostnFound") {
            priceContainer.classList.add("hidden");
        } else {
            priceContainer.classList.remove("hidden");
        }
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", togglePriceVisibility);
        togglePriceVisibility();
    }
});
