document.addEventListener('readystatechange', () => {
    console.log('[DEBUG] readystatechange:', document.readyState);
});

document.addEventListener('DOMContentLoaded', function () {
    console.log('[DEBUG] DOMContentLoaded event fired!');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('[DEBUG] Current page detected:', currentPage);

    let loggedInUser = localStorage.getItem('loggedInUser') || null;
    console.log('[DEBUG] loggedInUser from localStorage:', loggedInUser);

    let users = JSON.parse(localStorage.getItem('users')) || [];
    console.log('[DEBUG] users from localStorage:', users);

    let postedItems = JSON.parse(localStorage.getItem('postedItems')) || {};
    console.log('[DEBUG] postedItems from localStorage:', postedItems);

    let allLoadedItems = [];

    function ensureCategoryAndID(data) {
        for (let catKey in data) {
            data[catKey].forEach(it => {
                if (!it.category) it.category = catKey;
                if (!it.itemID) {
                    it.itemID = Math.floor(Math.random() * 1000000);
                    console.log('[DEBUG] Assigned itemID:', it.itemID, it.title);
                }
            });
        }
    }

    function fetchAndLoadItems() {
        console.log('[DEBUG] Starting fetchAndLoadItems...');
        let defaultItems = JSON.parse(localStorage.getItem('defaultItems'));

        if (defaultItems) {
            console.log('[DEBUG] defaultItems found in localStorage, using them directly');
            allLoadedItems = [];
            for (let catKey in defaultItems) {
                allLoadedItems = allLoadedItems.concat(defaultItems[catKey]);
            }
            for (let catKey in postedItems) {
                let postedCatItems = postedItems[catKey];
                if (!Array.isArray(postedCatItems)) postedCatItems = [postedCatItems];
                allLoadedItems = allLoadedItems.concat(postedCatItems);
            }

            window.allLoadedItems = allLoadedItems;
            return Promise.resolve(allLoadedItems);
        } else {
            console.log('[DEBUG] Fetching items.json...');
            return fetch('items.json')
                .then(response => {
                    console.log('[DEBUG] items.json fetch response status:', response.status);
                    if (!response.ok) {
                        throw new Error('Network response not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('[DEBUG] items.json data fetched');
                    ensureCategoryAndID(data);
                    localStorage.setItem('defaultItems', JSON.stringify(data));

                    let combined = [];
                    for (let catKey in data) {
                        combined = combined.concat(data[catKey]);
                    }

                    for (let catKey in postedItems) {
                        let postedCatItems = postedItems[catKey];
                        if (!Array.isArray(postedCatItems)) postedCatItems = [postedCatItems];
                        combined = combined.concat(postedCatItems);
                    }

                    allLoadedItems = combined;
                    window.allLoadedItems = allLoadedItems;
                    return allLoadedItems;
                })
                .catch(error => {
                    console.error('[DEBUG] Error fetching items:', error);
                });
        }
    }

    function maskUserIdentifier(identifier) {
        if (!identifier) return '';
        if (identifier.length > 4) {
            return identifier.substring(0, 2) + '**' + identifier.substring(identifier.length - 2);
        } else {
            return identifier;
        }
    }

    function updateHeaderLoginLink() {
        console.log('[DEBUG] Updating header login link...');
        const container = document.getElementById('login-link-container');
        if (!container) return;
        if (loggedInUser) {
            const user = users.find(u => u.email === loggedInUser);
            let identifierToMask = user ? user.username : loggedInUser;
            const masked = maskUserIdentifier(identifierToMask);
            container.innerHTML = '<a href="profile.html">' + masked + '</a>';
        } else {
            container.innerHTML = '<a href="login.html" id="loginLink">login</a>';
        }
    }

    function getUserFavorites() {
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        return favs[loggedInUser] || [];
    }

    function isItemFavorited(itemID) {
        const userFavs = getUserFavorites();
        return userFavs.some(it => it.itemID === itemID);
    }

    function getItemByID(itemID) {
        console.log('[DEBUG] getItemByID called with:', itemID);
        if (!window.allLoadedItems) return null;
        itemID = parseInt(itemID, 10);
        return window.allLoadedItems.find(i => i.itemID === itemID);
    }

    function toggleFavorite(itemID) {
        console.log('[DEBUG] toggleFavorite called with itemID:', itemID);
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
        if (descEl) descEl.innerHTML = '<b>Description:</b> ' + (item.description || 'No description');
        if (sellerEl) sellerEl.innerHTML = '<b>Seller:</b> ' + (item.seller || 'Unknown');

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

    function handleRegisterPage() {
        if (!currentPage.startsWith('register')) return;
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

    function handleLoginPage() {
        if (!currentPage.startsWith('login')) return;
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

    function handleProfilePage() {
        if (!currentPage.startsWith('profile')) return;
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

        const profileContainer = document.querySelector('.profile-section.profile-posts .profile-container');
        if (!profileContainer) return;

        function getUserPostedItems() {
            let userItems = [];
            for (let catKey in postedItems) {
                let catArr = postedItems[catKey];
                if (!Array.isArray(catArr)) catArr = [catArr];
                catArr.forEach(it => {
                    if (it.seller === user.username) {
                        userItems.push(it);
                    }
                });
            }
            return userItems;
        }

        function deleteUserPost(itemID) {
            for (let catKey in postedItems) {
                let catArr = postedItems[catKey];
                if (!Array.isArray(catArr)) catArr = [catArr];
                let index = catArr.findIndex(it => it.itemID === itemID && it.seller === user.username);
                if (index >= 0) {
                    catArr.splice(index, 1);
                    postedItems[catKey] = catArr; 
                    localStorage.setItem('postedItems', JSON.stringify(postedItems));
                    displayUserPosts();
                    return;
                }
            }
        }

        function displayUserPosts() {
            let userItems = getUserPostedItems();
            if (userItems.length === 0) {
                profileContainer.innerHTML = "<p>No posts here yet.</p>";
                return;
            }

            let htmlStr = '';
            userItems.forEach(item => {
                const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW')
                    : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';
                
                htmlStr += `
                    <div class="favorite-item" data-itemid="${item.itemID}" style="width:200px;">
                        <img src="${item.image}" alt="${item.title}" style="max-width:100%; height:auto;">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <p><strong>Location:</strong> ${item.location}</p>
                        <p><strong>Seller:</strong> ${item.seller}</p>
                        ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                        <div class="item-actions" id="delete-btn">
                            <button class="delete-post-btn" data-itemid="${item.itemID}">Delete</button>
                        </div>
                    </div>
                `;
            });

            profileContainer.innerHTML = htmlStr;

            const deleteButtons = profileContainer.querySelectorAll('.delete-post-btn');
            deleteButtons.forEach(btn => {
                btn.addEventListener('click', e => {
                    const itemID = parseInt(e.currentTarget.getAttribute('data-itemid'), 10);
                    deleteUserPost(itemID);
                });
            });
        }

        displayUserPosts();
    }

    function handlePostItemPage() {
        if (!currentPage.startsWith('post_item')) return;
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
            alert('Item posted successfully!');
            window.location.href = 'index.html';
        });
    }

    function handleCategoryPage() {
        if (!currentPage.startsWith('category')) return;

        const urlParams = new URLSearchParams(window.location.search);
        let category = urlParams.get('cat') || '';

        const itemsContainer = document.getElementById('categoryItems');
        const categorySelect = document.getElementById('categorySelect');
        const sortSelect = document.getElementById('sortSelect');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');

        if (categorySelect) categorySelect.value = category;

        function getAllItems() {
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
            if (!itemsContainer) return;
            if (items.length === 0) {
                itemsContainer.innerHTML = '<p style="text-align:center;">No items found.</p>';
                return;
            }

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

            let htmlStr = '';
            items.forEach(item => {
                const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW')
                    : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';
                const isFav = isItemFavorited(item.itemID);
                const heartIcon = isFav ? 'heartLiked.svg' : 'heartUnliked.svg';

                htmlStr += `
                    <div class="favorite-item" data-itemid="${item.itemID}">
                        <div class="favorite-item-image">
                            <img src="${item.image}" alt="${item.title}">
                        </div>
                        <div class="favorite-item-info">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                            <p><strong>Location:</strong> ${item.location}</p>
                            <p><strong>Seller:</strong> ${item.seller}</p>
                            ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                        </div>
                        <div class="favorite-item-actions">
                            <button class="heart-btn" data-itemid="${item.itemID}">
                                <img src="images/${heartIcon}" alt="heart">
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
                const newCategory = categorySelect ? categorySelect.value : '';
                category = newCategory;
                displayItems();
            });
        }

        displayItems();
    }

    function handleFavoritesPage() {
        if (!currentPage.startsWith('favorites')) return;
        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }

        const favContainer = document.getElementById('favoritesContainer');
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        let userFavs = favs[loggedInUser] || [];

        if (userFavs.length === 0) {
            favContainer.innerHTML = `
                <div class="favorite-item">
                    <div class="favorite-item-info">
                        <p>You don't have liked items.</p>
                    </div>
                </div>`;
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
                    <div class="favorite-item-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="favorite-item-info">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <p><strong>Location:</strong> ${item.location}</p>
                        <p><strong>Seller:</strong> ${item.seller}</p>
                        ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                    </div>
                    <div class="favorite-item-actions">
                        <button class="heart-btn" data-itemid="${itemID}">
                            <img src="images/heartLiked.svg" alt="heart">
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

    function handleSearchFromIndex() {
        if (!currentPage.startsWith('index')) return;
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
                <div class="favorite-item">
                    <div class="favorite-item-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="favorite-item-info">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <p><strong>Location:</strong> ${item.location}</p>
                        <p><strong>Seller:</strong> ${item.seller}</p>
                        ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
                    </div>
                    <div class="favorite-item-actions">
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

    function handleItemDetailsPage() {
        if (!currentPage.startsWith('item_details')) return;
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

        const item = getItemByID(itemID);
        if (!item) {
            displayItemNotFound();
            return;
        }

        populateItemDetails(item);
    }

    fetchAndLoadItems().then(() => {
        try {
            updateHeaderLoginLink();
            handleRegisterPage();
            handleLoginPage();
            handleProfilePage();
            handlePostItemPage();
            handleCategoryPage();
            handleFavoritesPage();
            handleSearchFromIndex();
            handleItemDetailsPage();
        } catch (err) {
            console.error('[DEBUG] Error in fetchAndLoadItems chain:', err);
        }
    }).catch(err => {
        console.error('[DEBUG] Error in fetchAndLoadItems chain:', err);
    });
});


document.addEventListener("DOMContentLoaded", function () {
    console.log('[DEBUG] Second DOMContentLoaded fired - for price container logic');
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