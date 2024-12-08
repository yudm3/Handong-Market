document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop();
    let loggedInUser = localStorage.getItem('loggedInUser') || null;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let postedItems = JSON.parse(localStorage.getItem('postedItems')) || {};

    function maskUserIdentifier(identifier) {
        if (!identifier) return '';
        // Simple masking: first 2 chars + '**' + last 2 chars
        if (identifier.length > 4) {
            return identifier.substring(0, 2) + '**' + identifier.substring(identifier.length - 2);
        } else {
            return identifier; // If too short to mask properly
        }
    }

    function updateHeaderLoginLink() {
        const container = document.getElementById('login-link-container');
        if (container) {
            if (loggedInUser) {
                // find user by email since we stored loggedInUser as email
                const user = users.find(u => u.email === loggedInUser);
                let identifierToMask;
                if (user) {
                    // Prefer showing username
                    identifierToMask = user.username;
                } else {
                    // fallback if user not found
                    identifierToMask = loggedInUser;
                }
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
        if(!window.allLoadedItems) return null;
        return window.allLoadedItems.find(i => encodeURIComponent(i.title + '_' + (i.category||'All')) === itemID);
    }

    function toggleFavorite(itemID) {
        if(!loggedInUser) return;
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        let userFavs = favs[loggedInUser] || [];

        const item = getItemByID(itemID);
        if(!item) return;

        const index = userFavs.findIndex(it => it.itemID === itemID);
        if(index >= 0) {
            // remove favorite
            userFavs.splice(index, 1);
        } else {
            // add to favorites
            userFavs.push({itemID: itemID, item: item});
        }

        favs[loggedInUser] = userFavs;
        localStorage.setItem('favorites', JSON.stringify(favs));
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
            alert('Registration successful! Please login.');
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

        const profileUsername = document.getElementById('profileUsername');
        const profileEmail = document.getElementById('profileEmail');
        const profileRegisterDate = document.getElementById('profileRegisterDate');

        if(profileUsername) profileUsername.textContent = user.username;
        if(profileEmail) profileEmail.textContent = user.email;
        if(profileRegisterDate) profileRegisterDate.textContent = new Date(user.registerDate).toLocaleString();

        const logoutBtn = document.getElementById('logoutBtn');
        if(logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                localStorage.removeItem('loggedInUser');
                window.location.href = 'index.html';
            });
        }

        const changePassForm = document.getElementById('changePasswordForm');
        if(changePassForm) {
            changePassForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const curPass = document.getElementById('currentPassword').value;
                const newPass = document.getElementById('newPassword').value.trim();
                const confirmPass = document.getElementById('confirmPassword').value.trim();
                
                if (curPass !== user.password) {
                    alert('Current password is wrong!');
                    return;
                }
                if(newPass !== confirmPass) {
                    alert('New password and confirm password do not match.');
                    return;
                }

                user.password = newPass;
                localStorage.setItem('users', JSON.stringify(users));
                alert('Password changed successfully!');
                window.location.href = 'index.html';
            });
        }
    }

    // Post item page
    function handlePostItemPage() {
        if (currentPage !== 'post_item.html') return;
        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }

        const form = document.getElementById('postItemForm');
        if(!form) return;

        const listingTypes = form.querySelectorAll('input[name="listingType"]');
        const priceInputContainer = document.getElementById('priceInputContainer');
        const priceInput = document.getElementById('postPrice');
        const openToOffersCheckbox = document.getElementById('openToOffers');

        if(listingTypes) {
            listingTypes.forEach(radio => {
                radio.addEventListener('change', function () {
                    if (this.value === 'forSale') {
                        priceInputContainer.style.display = 'inline-block';
                    } else {
                        priceInputContainer.style.display = 'none';
                    }
                });
            });
        }

        if(form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const title = document.getElementById('postTitle').value.trim();
                const category = document.getElementById('postCategory').value;
                const listingType = form.querySelector('input[name="listingType"]:checked') ? form.querySelector('input[name="listingType"]:checked').value : '';
                const description = document.getElementById('postDescription').value.trim();
                const location = document.getElementById('postLocation').value.trim();
                const images = document.getElementById('postImages').files;

                let imagePath = 'images/default.jpg';
                if (images.length > 0) {
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
    }

    // Handle category page
    function handleCategoryPage() {
        if (currentPage !== 'category.html') return;

        const urlParams = new URLSearchParams(window.location.search);
        let category = urlParams.get('cat') || '';

        const itemsContainer = document.getElementById('categoryItems');
        const categorySelect = document.getElementById('categorySelect');
        const sortSelect = document.getElementById('sortSelect');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');

        if(categorySelect) categorySelect.value = category;

        let allData = {}; 

        function loadItems() {
            fetch('./items.json')
                .then(res => {
                    if(!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    // data loaded
                    allData = data;
                    displayItems();
                })
                .catch(err => {
                    console.error('Failed to load items.json:', err);
                    allData = {}; // fallback empty
                    displayItems();
                });
        }

        function getAllItems() {
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

        function attachCategoryItemEventListeners() {
            const heartButtons = document.querySelectorAll('.heart-btn');
            const buyButtons = document.querySelectorAll('.buy-btn');
        
            heartButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemID = e.currentTarget.getAttribute('data-itemid');
                    if(!loggedInUser) {
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
                    const itemID = e.currentTarget.getAttribute('data-itemid');
                    if(!loggedInUser) {
                        window.location.href = 'login.html';
                        return;
                    }
                    window.location.href = `item_details.html?itemID=${itemID}`;
                });
            });
        }

        function displayItems() {
            const items = getAllItems();

            // store items in global for getItemByID
            window.allLoadedItems = items.map(it => {
                it.category = category ? category : 'All';
                return it;
            });

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
                const categoryForID = category ? category : 'All';
                const itemID = encodeURIComponent(item.title + '_' + categoryForID);
                const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW') 
                    : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';
            
                const isFavorited = isItemFavorited(itemID);
                const heartIcon = isFavorited ? 'heartLiked.svg' : 'heartUnliked.svg';
            
                htmlStr += `
                    <div class="item-card" data-itemid="${itemID}">
                        <img src="${item.image}" alt="${item.title}">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <p><strong>Location:</strong> ${item.location}</p>
                        <p><strong>Seller:</strong> ${item.seller}</p>
                        ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ``}
            
                        <div class="item-actions">
                            <button class="heart-btn" data-itemid="${itemID}">
                                <img src="images/${heartIcon}" alt="heart" width="24">
                            </button>
                            <button class="buy-btn" data-itemid="${itemID}">Buy</button>
                        </div>
                    </div>
                `;
            });
            itemsContainer.innerHTML = htmlStr;
            attachCategoryItemEventListeners();
        }

        if(applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', function () {
                category = categorySelect ? categorySelect.value : '';
                displayItems();
            });
        }

        loadItems();
    }

    function handleFavoritesPage() {
        if (currentPage !== 'favorites.html') return;
        if (!loggedInUser) {
            window.location.href = 'login.html';
            return;
        }
    
        const favContainer = document.getElementById('favoritesContainer');
        let favs = JSON.parse(localStorage.getItem('favorites')) || {};
        let userFavs = favs[loggedInUser] || [];
    
        if(userFavs.length === 0) {
            favContainer.innerHTML = "<p>You don't have liked items</p>";
            return;
        }
    
        let htmlStr = '';
        userFavs.forEach(f => {
            const item = f.item;
            const itemID = f.itemID;
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
                const itemID = e.currentTarget.getAttribute('data-itemid');
                if(!loggedInUser) {
                    window.location.href = 'login.html';
                    return;
                }
                toggleFavorite(itemID);
                e.currentTarget.closest('.favorite-item').remove();
                if(favContainer.children.length === 0) {
                    favContainer.innerHTML = "<p>You don't have liked items</p>";
                }
            });
        });
    
        buyButtons.forEach(btn => {
            btn.addEventListener('click', e => {
                const itemID = e.currentTarget.getAttribute('data-itemid');
                if(!loggedInUser) {
                    window.location.href = 'login.html';
                    return;
                }
                window.location.href = `item_details.html?itemID=${itemID}`;
            });
        });
    }

    function handleSearchFromIndex() {
        if (currentPage !== 'index.html') return;
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('searchResults');
        let allDataCache = null;

        function loadAllItemsForSearch() {
            return fetch('./items.json').then(res => {
                if(!res.ok) throw new Error('Network not ok');
                return res.json();
            }).then(data => {
                // Merge posted items
                for (let catKey in postedItems) {
                    if (!data[catKey]) data[catKey] = [];
                    data[catKey] = data[catKey].concat(postedItems[catKey]);
                }
                return data;
            }).catch(err => {
                console.error('Error loading items for search:', err);
                return {};
            });
        }

        if(searchForm) {
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
        }

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
                  </div>
                `;
            });
            htmlStr += '</div>';
            searchResults.innerHTML = htmlStr;
        }
    }

    function handleItemDetailsPage() {
        if (currentPage !== 'item_details.html') return;
        if(!loggedInUser) {
            window.location.href='login.html';
            return;
        }
    
        const urlParams = new URLSearchParams(window.location.search);
        const itemID = urlParams.get('itemID');
        if(!itemID) return;
    
        const item = getItemByID(itemID);
        if(!item) {
            // Item not found
            return;
        }
    
        const imgContainer = document.getElementById('itemImageContainer');
        const infoContainer = document.getElementById('itemInfoContainer');
        if(!imgContainer || !infoContainer) return;

        const priceInfo = (item.listingType === 'forSale') ? (item.price + ' KRW') 
            : (item.listingType === 'free' || item.listingType === 'lostAndFound') ? '0 KRW' : '';

        imgContainer.innerHTML = `<img src="${item.image}" alt="${item.title}" style="max-width:100%; height:auto;">`;
        infoContainer.innerHTML = `
            <h2>${item.title}</h2>
            <p>${item.description}</p>
            <p><strong>Location:</strong> ${item.location}</p>
            <p><strong>Seller:</strong> ${item.seller}</p>
            ${priceInfo ? `<p><strong>Price:</strong> ${priceInfo}</p>` : ''}
            <button id="messageSellerBtn">Message Seller</button>
        `;
    }

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


document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById("postCategory");
    const priceContainer = document.getElementById("priceContainer");

    function togglePriceVisibility() {
        if(!categorySelect || !priceContainer) return;
        const selectedCategory = categorySelect.value;
        if (selectedCategory === "Free" || selectedCategory === "LostnFound") {
            priceContainer.classList.add("hidden");
        } else {
            priceContainer.classList.remove("hidden");
        }
    }

    if(categorySelect) {
        categorySelect.addEventListener("change", togglePriceVisibility);
        togglePriceVisibility();
    }
});
