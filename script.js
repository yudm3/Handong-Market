document.addEventListener('readystatechange', () => console.log('ready state change: ' + document.readyState));

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded event fired!");

    const currentPage = window.location.pathname.split('/').pop();
    console.log("Current page detected:", currentPage);

    let loggedInUser = localStorage.getItem('loggedInUser') || null;
    console.log("loggedInUser from localStorage:", loggedInUser);

    let users = JSON.parse(localStorage.getItem('users')) || [];
    console.log("users from localStorage:", users);

    let postedItems = JSON.parse(localStorage.getItem('postedItems')) || {};
    console.log("postedItems from localStorage:", postedItems);

    let allLoadedItems = [];

    //***************************************************************
    // Fetch items from items.json and then merge with postedItems
    //***************************************************************
    function fetchAndLoadItems() {
        console.log("Fetching items.json...");
        return fetch('items.json')
            .then(response => {
                console.log("items.json fetch response status:", response.status);
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log("items.json data fetched:", data);
                console.log("Merging fetched data with postedItems...");
                let combined = [];
                for (let catKey in data) {
                    data[catKey].forEach(it => {
                        if (!it.category) it.category = catKey;
                        combined.push(it);
                    });
                }

                console.log("Data after loading items.json:", combined);
                console.log("Now merging postedItems into combined array...");
                for (let catKey in postedItems) {
                    let postedCatItems = postedItems[catKey];
                    if (!Array.isArray(postedCatItems)) postedCatItems = [postedCatItems];
                    postedCatItems.forEach(it => {
                        if (!it.category) it.category = catKey;
                        if (!it.itemID) {
                            // assign random ID for posted item
                            it.itemID = Math.floor(Math.random() * 1000000);
                        }
                    });
                    combined = combined.concat(postedCatItems);
                }

                console.log("Final combined items after merging postedItems:", combined);
                allLoadedItems = combined;
                window.allLoadedItems = allLoadedItems; 
                return allLoadedItems;
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
        console.log("Updating header login link...");
        const container = document.getElementById('login-link-container');
        if (container) {
            if (loggedInUser) {
                const user = users.find(u => u.email === loggedInUser);
                console.log("User found for login link:", user);
                let identifierToMask = user ? user.username : loggedInUser;
                const masked = maskUserIdentifier(identifierToMask);
                container.innerHTML = '<a href="profile.html">' + masked + '</a>';
            } else {
                container.innerHTML = '<a href="login.html" id="loginLink">login</a>';
            }
        }
    }

    function getUserFavorites() {
        console.log("Getting user favorites...");
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        return favs[loggedInUser] || [];
    }

    function isItemFavorited(itemID) {
        const userFavs = getUserFavorites();
        return userFavs.some(it => it.itemID === itemID);
    }

    function getItemByID(itemID) {
        if (!window.allLoadedItems) return null;
        itemID = parseInt(itemID, 10);
        return window.allLoadedItems.find(i => i.itemID === itemID);
    }

    function toggleFavorite(itemID) {
        console.log("Toggling favorite for itemID:", itemID);
        if (!loggedInUser) return;
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        let userFavs = favs[loggedInUser] || [];

        const item = getItemByID(itemID);
        if (!item) return;

        const index = userFavs.findIndex(it => it.itemID === itemID);
        if (index >= 0) {
            console.log("Item was favorited, removing it...");
            userFavs.splice(index, 1);
        } else {
            console.log("Item not in favorites, adding it...");
            userFavs.push({ itemID: itemID, item: item });
        }

        favs[loggedInUser] = userFavs;
        localStorage.setItem('favorites', JSON.stringify(favs));
        console.log("Updated favorites:", favs);
    }

    function displayItemNotFound() {
        console.log("Item not found, displaying message...");
        const container = document.querySelector('.item-details-container');
        if (container) {
            container.innerHTML = '<p style="text-align:center;">Item not found.</p>';
        }
    }

    function populateItemDetails(item) {
        console.log("Populating item details for:", item);
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
                console.log("Contact Seller button clicked");
                alert('This feature will be implemented soon. Stay tuned!');
            });
        }
    }

    //***************************************************************
    // Page Handlers
    //***************************************************************

    //--- Register Page ---//
    function handleRegisterPage() {
        console.log("handleRegisterPage called");
        if (currentPage !== 'register.html') return;
        console.log("On register page");
        const form = document.getElementById('registerForm');
        if (!form) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log("Register form submitted");
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
            console.log("New user registered:", users);
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        });
    }

    //--- Login Page ---//
    function handleLoginPage() {
        console.log("handleLoginPage called");
        if (currentPage !== 'login.html') return;
        console.log("On login page");
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log("Login form submitted");
            const loginVal = document.getElementById('loginInput').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            const user = users.find(u =>
                ((u.username === loginVal || u.email === loginVal) && u.password === password)
            );
            console.log("Login attempt:", loginVal, password, "User found:", user);
            if (user) {
                localStorage.setItem('loggedInUser', user.email);
                loggedInUser = user.email;
                console.log("User logged in:", user.email);
                window.location.href = 'index.html';
            } else {
                alert('Invalid username/password or user does not exist.');
            }
        });

        const goToRegister = document.getElementById('goToRegister');
        if (goToRegister) {
            goToRegister.addEventListener('click', function () {
                console.log("Go to register clicked");
                window.location.href = 'register.html';
            });
        }
    }

    //--- Profile Page ---//
    function handleProfilePage() {
        console.log("handleProfilePage called");
        if (currentPage !== 'profile.html') return;
        console.log("On profile page");
        if (!loggedInUser) {
            console.log("No loggedInUser, redirecting to login");
            window.location.href = 'login.html';
            return;
        }

        const user = users.find(u => u.email === loggedInUser);
        console.log("Profile user:", user);
        if (!user) {
            console.log("User not found, removing loggedInUser and redirecting");
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
                console.log("Logout clicked");
                localStorage.removeItem('loggedInUser');
                window.location.href = 'index.html';
            });
        }

        const changePassForm = document.getElementById('changePasswordForm');
        if (changePassForm) {
            changePassForm.addEventListener('submit', function (e) {
                e.preventDefault();
                console.log("Change password form submitted");
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
                console.log("Password changed for user:", user);
                alert('Password changed successfully!');
                window.location.href = 'index.html';
            });
        }
    }

    //--- Post Item Page ---//
    function handlePostItemPage() {
        console.log("handlePostItemPage called");
        if (currentPage !== 'post_item.html') return;
        console.log("On post_item page");
        if (!loggedInUser) {
            console.log("No loggedInUser, redirecting to login");
            window.location.href = 'login.html';
            return;
        }

        const user = users.find(u => u.email === loggedInUser);
        const sellerUsername = user ? user.username : 'Unknown';
        console.log("Seller username for posted items:", sellerUsername);

        const form = document.getElementById('postItemForm');
        if (!form) return;

        const priceInput = document.getElementById('postPrice');
        const openToOffersCheckbox = document.getElementById('openToOffers');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log("Post item form submitted");
            const title = document.getElementById('postTitle').value.trim();
            const category = document.getElementById('postCategory').value;
            console.log("Selected category:", category);
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

            console.log("Newly created item:", newItem);
            postedItems[category].push(newItem);
            localStorage.setItem('postedItems', JSON.stringify(postedItems));
            console.log("Updated postedItems in localStorage:", postedItems);
            alert('Item posted successfully!');
            window.location.href = 'index.html';
        });
    }

    //--- Category Page ---//
    function handleCategoryPage() {
        console.log("handleCategoryPage called");
        if (currentPage !== 'category.html') return;
        console.log("On category page");

        const urlParams = new URLSearchParams(window.location.search);
        let category = urlParams.get('cat') || '';
        console.log("Category selected from URL:", category);

        const itemsContainer = document.getElementById('categoryItems');
        const categorySelect = document.getElementById('categorySelect');
        const sortSelect = document.getElementById('sortSelect');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');

        if (categorySelect) categorySelect.value = category;

        function getAllItems() {
            console.log("Fetching all items for category page");
            console.log("allLoadedItems currently:", window.allLoadedItems);
            let items = window.allLoadedItems || [];
            if (category) {
                items = items.filter(it => it.category === category);
            }
            return items;
        }

        function attachCategoryItemEventListeners() {
            console.log("Attaching event listeners to category items");
            const heartButtons = document.querySelectorAll('.heart-btn');
            const buyButtons = document.querySelectorAll('.buy-btn');

            heartButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    console.log("Heart button clicked for item:", e.currentTarget.getAttribute('data-itemid'));
                    const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                    if (!loggedInUser) {
                        console.log("User not logged in, redirecting to login");
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
                    console.log("Buy button clicked for item:", e.currentTarget.getAttribute('data-itemid'));
                    const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                    if (!loggedInUser) {
                        console.log("User not logged in, redirecting to login");
                        window.location.href = 'login.html';
                        return;
                    }
                    window.location.href = `item_details.html?itemID=${itemID}`;
                });
            });
        }

        function displayItems() {
            console.log("displayItems called on category page");
            const items = getAllItems();
            console.log("Items found for category:", category, items);

            const sortValue = sortSelect ? sortSelect.value : 'time_desc';
            console.log("Sorting items by:", sortValue);
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
                console.log("No items found for this category/filter");
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
                console.log("Apply filters clicked");
                category = categorySelect ? categorySelect.value : '';
                displayItems();
            });
        }

        displayItems();
    }

    //--- Favorites Page ---//
    function handleFavoritesPage() {
        console.log("handleFavoritesPage called");
        if (currentPage !== 'favorites.html') return;
        console.log("On favorites page");
        if (!loggedInUser) {
            console.log("No loggedInUser on favorites page, redirecting to login");
            window.location.href = 'login.html';
            return;
        }

        const favContainer = document.getElementById('favoritesContainer');
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        let userFavs = favs[loggedInUser] || [];
        console.log("User favorites:", userFavs);

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
                console.log("Unfavorite clicked for item:", itemID);
                if (!loggedInUser) {
                    console.log("Not logged in, redirecting to login");
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
                console.log("Buy clicked on favorites page for item:", itemID);
                if (!loggedInUser) {
                    console.log("Not logged in, redirecting");
                    window.location.href = 'login.html';
                    return;
                }
                window.location.href = `item_details.html?itemID=${itemID}`;
            });
        });
    }

    //--- Index (Search) Page ---//
    function handleSearchFromIndex() {
        console.log("handleSearchFromIndex called");
        if (currentPage !== 'index.html') return;
        console.log("On index page (search)");
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('searchResults');

        if (!searchForm) return;
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log("Search form submitted");
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return;

            let allItems = window.allLoadedItems || [];
            console.log("Searching for query:", query, "in items:", allItems);
            let filtered = allItems.filter(item => item.title.toLowerCase().includes(query));
            if (filtered.length === 0) {
                console.log("No results found for search query:", query);
                searchResults.innerHTML = '<p>No results found.</p>';
                return;
            }

            console.log("Search results found:", filtered);
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
                    console.log("View clicked on search result for item:", itemID);
                    if (!loggedInUser) {
                        console.log("Not logged in, redirecting");
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
        console.log("handleItemDetailsPage called");
        if (currentPage !== 'item_details.html') return;
        console.log("On item_details page");

        if (!loggedInUser) {
            console.log("Not logged in, redirecting to login");
            window.location.href = 'login.html';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const itemID = urlParams.get('itemID');
        console.log("ItemID from URL:", itemID);
        if (!itemID) {
            displayItemNotFound();
            return;
        }

        const item = getItemByID(parseInt(itemID, 10));
        console.log("Item found by ID:", item);
        if (!item) {
            displayItemNotFound();
            return;
        }

        populateItemDetails(item);
    }

    //***************************************************************
    // Initialization: Fetch items and then run page handlers
    //***************************************************************
    console.log("Starting fetchAndLoadItems...");
    fetchAndLoadItems().then(() => {
        console.log("Items fetched and loaded. Running page handlers now.");
        updateHeaderLoginLink();
        handleRegisterPage();
        handleLoginPage();
        handleProfilePage();
        handlePostItemPage();
        handleCategoryPage();
        handleFavoritesPage();
        handleSearchFromIndex();
        handleItemDetailsPage();
    }).catch(err => {
        console.error("Error in fetchAndLoadItems:", err);
    });
});


document.addEventListener("DOMContentLoaded", function () {
    console.log("Second DOMContentLoaded fired - for price container logic");
    const categorySelect = document.getElementById("postCategory");
    const priceContainer = document.getElementById("priceContainer");

    function togglePriceVisibility() {
        console.log("togglePriceVisibility called");
        if (!categorySelect || !priceContainer) {
            console.log("categorySelect or priceContainer not found");
            return;
        }
        const selectedCategory = categorySelect.value;
        console.log("Selected category for price visibility:", selectedCategory);
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
