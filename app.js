/* ===== DATA & STATE ===== */

// Default rooms
const DEFAULT_ROOMS = [
    { id: 'r1', name: 'Sunrise Single', type: 'single', price: 500, status: 'available',
      desc: 'A cozy single room with natural sunlight, study desk, and wardrobe.',
      amenities: ['Wi-Fi','AC','Study Desk','Wardrobe'] },
    { id: 'r2', name: 'Classic Single', type: 'single', price: 450, status: 'available',
      desc: 'Comfortable single room ideal for focused study and peaceful living.',
      amenities: ['Wi-Fi','Fan','Study Desk','Bookshelf'] },
    { id: 'r3', name: 'Deluxe Double', type: 'double', price: 800, status: 'available',
      desc: 'Spacious double sharing room with attached bathroom and balcony.',
      amenities: ['Wi-Fi','AC','Balcony','Bathroom'] },
    { id: 'r4', name: 'Comfort Double', type: 'double', price: 700, status: 'available',
      desc: 'Well-furnished double sharing room with large windows and storage.',
      amenities: ['Wi-Fi','Fan','Storage','Mirror'] },
    { id: 'r5', name: 'Economy Shared', type: 'shared', price: 350, status: 'available',
      desc: '4-bed shared dormitory with individual lockers and common area.',
      amenities: ['Wi-Fi','Fan','Locker','Common Area'] },
    { id: 'r6', name: 'Premium Shared', type: 'shared', price: 400, status: 'available',
      desc: '3-bed shared room with AC, personal locker, and study space.',
      amenities: ['Wi-Fi','AC','Locker','Study Area'] },
    { id: 'r7', name: 'Royal Suite Single', type: 'single', price: 650, status: 'available',
      desc: 'Premium single room with mini-fridge, attached bath, and city view.',
      amenities: ['Wi-Fi','AC','Mini-Fridge','City View'] },
    { id: 'r8', name: 'Garden Double', type: 'double', price: 750, status: 'available',
      desc: 'Double room overlooking the garden area with fresh ventilation.',
      amenities: ['Wi-Fi','AC','Garden View','Wardrobe'] },
];

// Default food plans
const DEFAULT_FOOD_PLANS = [
    { id: 'f1', name: 'Basic Plan', price: 100, icon: '🍞', popular: false,
      features: ['Breakfast Only','2 Tea/Coffee','Weekend Snack','Basic Menu Rotation'] },
    { id: 'f2', name: 'Standard Plan', price: 200, icon: '🍛', popular: true,
      features: ['Breakfast + Lunch + Dinner','Daily Fruits','Evening Snack','Variety Menu','Weekend Special'] },
    { id: 'f3', name: 'Premium Plan', price: 350, icon: '🥗', popular: false,
      features: ['All 3 Meals + Snacks','Custom Diet Options','Premium Ingredients','Dessert Daily','Room Service','Midnight Snack'] },
];

// Initialize data from localStorage or defaults
function getData(key, defaults) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaults;
}
function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

function getRooms() { return getData('hostel_rooms', DEFAULT_ROOMS); }
function getFoodPlans() { return getData('hostel_food_plans', DEFAULT_FOOD_PLANS); }
function getBookings() { return getData('hostel_bookings', []); }
function getUsers() { return getData('hostel_users', []); }
function getCurrentUser() {
    const u = localStorage.getItem('hostel_current_user');
    return u ? JSON.parse(u) : null;
}

// ===== PAGE NAVIGATION =====
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');

    if (page === 'rooms') renderRooms();
    if (page === 'food') renderFoodPlans();
    if (page === 'mybookings') renderMyBookings();
    if (page === 'booking') populateBookingFood();

    // Close mobile menu
    document.getElementById('navLinks').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

// ===== TOAST =====
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== RENDER ROOMS =====
function renderRooms(filter = 'all') {
    const rooms = getRooms();
    const grid = document.getElementById('roomsGrid');
    const filtered = filter === 'all' ? rooms : rooms.filter(r => r.type === filter);

    grid.innerHTML = filtered.map(room => {
        const icons = {
            'Wi-Fi': 'fas fa-wifi', 'AC': 'fas fa-snowflake', 'Fan': 'fas fa-fan',
            'Study Desk': 'fas fa-desktop', 'Wardrobe': 'fas fa-door-closed',
            'Bookshelf': 'fas fa-book', 'Balcony': 'fas fa-columns',
            'Bathroom': 'fas fa-bath', 'Storage': 'fas fa-box',
            'Mirror': 'fas fa-border-all', 'Locker': 'fas fa-lock',
            'Common Area': 'fas fa-couch', 'Study Area': 'fas fa-pencil-alt',
            'Mini-Fridge': 'fas fa-temperature-low', 'City View': 'fas fa-city',
            'Garden View': 'fas fa-leaf', 'Room Service': 'fas fa-concierge-bell'
        };
        const roomIcon = room.type === 'single' ? 'fa-bed' : room.type === 'double' ? 'fa-bed' : 'fa-bunk-bed';

        return `
        <div class="room-card" data-type="${room.type}">
            <div class="room-image">
                <i class="fas ${roomIcon}"></i>
                <span class="room-type-badge">${room.type}</span>
                <span class="room-badge ${room.status === 'available' ? 'badge-available' : 'badge-occupied'}">
                    ${room.status === 'available' ? '● Available' : '● Occupied'}
                </span>
            </div>
            <div class="room-info">
                <h3>${room.name}</h3>
                <p class="room-desc">${room.desc}</p>
                <div class="room-amenities">
                    ${room.amenities.map(a => `<span class="amenity"><i class="${icons[a] || 'fas fa-check'}"></i>${a}</span>`).join('')}
                </div>
                <div class="room-footer">
                    <span class="room-price">₹${room.price}<small>/day</small></span>
                    ${room.status === 'available'
                        ? `<button class="btn btn-primary btn-sm" onclick="bookRoom('${room.id}')">Book Now</button>`
                        : `<button class="btn btn-outline btn-sm" disabled>Unavailable</button>`}
                </div>
            </div>
        </div>`;
    }).join('');
}

function filterRooms(type, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderRooms(type);
}

// ===== RENDER FOOD PLANS =====
function renderFoodPlans() {
    const plans = getFoodPlans();
    const grid = document.getElementById('foodGrid');
    grid.innerHTML = plans.map(plan => `
        <div class="food-card ${plan.popular ? 'popular' : ''}">
            <div class="food-header">
                <div class="food-icon">${plan.icon}</div>
                <h3>${plan.name}</h3>
                <div class="food-price">₹${plan.price}<small>/day</small></div>
            </div>
            <ul class="food-features">
                ${plan.features.map(f => `<li><i class="fas fa-check-circle"></i>${f}</li>`).join('')}
            </ul>
            <button class="btn ${plan.popular ? 'btn-primary' : 'btn-glass'} btn-block" onclick="selectFoodPlan('${plan.id}')">
                Select Plan
            </button>
        </div>
    `).join('');
}

function selectFoodPlan(planId) {
    if (!getCurrentUser()) {
        showToast('Please login to select a food plan');
        showPage('login');
        return;
    }
    showToast('Food plan selected! Choose a room to complete booking.');
    localStorage.setItem('hostel_selected_food', planId);
    showPage('rooms');
}

// ===== BOOKING =====
function bookRoom(roomId) {
    if (!getCurrentUser()) {
        showToast('Please login to book a room');
        showPage('login');
        return;
    }
    const rooms = getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    document.getElementById('bookRoom').value = room.name + ' (₹' + room.price + '/day)';
    document.getElementById('bookRoomId').value = roomId;

    // Set default dates
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.getElementById('bookCheckin').value = today.toISOString().split('T')[0];
    document.getElementById('bookCheckout').value = nextMonth.toISOString().split('T')[0];
    document.getElementById('bookCheckin').min = today.toISOString().split('T')[0];

    populateBookingFood();
    updateTotal();
    showPage('booking');
}

function populateBookingFood() {
    const select = document.getElementById('bookFoodPlan');
    const plans = getFoodPlans();
    const selectedFoodId = localStorage.getItem('hostel_selected_food');

    select.innerHTML = '<option value="">No Food Plan</option>';
    plans.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name + ' (₹' + p.price + '/day)';
        if (p.id === selectedFoodId) opt.selected = true;
        select.appendChild(opt);
    });
    updateTotal();
}

function updateTotal() {
    const roomId = document.getElementById('bookRoomId').value;
    const rooms = getRooms();
    const room = rooms.find(r => r.id === roomId);
    const foodPlanId = document.getElementById('bookFoodPlan').value;
    const plans = getFoodPlans();
    const food = plans.find(p => p.id === foodPlanId);

    const checkin = new Date(document.getElementById('bookCheckin').value);
    const checkout = new Date(document.getElementById('bookCheckout').value);
    let days = Math.max(1, Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24)));
    if (isNaN(days) || days < 1) days = 1;

    const roomCost = room ? room.price * days : 0;
    const foodCost = food ? food.price * days : 0;

    document.getElementById('summaryRoom').textContent = '₹' + roomCost;
    document.getElementById('summaryFood').textContent = food ? '₹' + foodCost : '₹0';
    document.getElementById('summaryDuration').textContent = days + ' day' + (days > 1 ? 's' : '');
    document.getElementById('summaryTotal').textContent = '₹' + (roomCost + foodCost);
}

// Listen for date changes
document.getElementById('bookCheckin').addEventListener('change', updateTotal);
document.getElementById('bookCheckout').addEventListener('change', updateTotal);

function submitBooking(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) { showPage('login'); return; }

    const roomId = document.getElementById('bookRoomId').value;
    const rooms = getRooms();
    const room = rooms.find(r => r.id === roomId);
    const foodPlanId = document.getElementById('bookFoodPlan').value;
    const plans = getFoodPlans();
    const food = plans.find(p => p.id === foodPlanId);

    const checkin = document.getElementById('bookCheckin').value;
    const checkout = document.getElementById('bookCheckout').value;
    const notes = document.getElementById('bookNotes').value;

    const days = Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)));
    const roomCost = room.price * days;
    const foodCost = food ? food.price * days : 0;
    const totalCost = roomCost + foodCost;

    const booking = {
        id: 'BK' + Date.now(),
        userId: user.email,
        userName: user.name,
        roomId: roomId,
        roomName: room.name,
        roomType: room.type,
        roomPrice: room.price,
        foodPlanId: foodPlanId || null,
        foodPlanName: food ? food.name : 'None',
        foodPrice: food ? food.price : 0,
        checkin, checkout, days,
        roomCost, foodCost, totalCost,
        notes,
        status: 'pending',
        bookedAt: new Date().toISOString()
    };

    const bookings = getBookings();
    bookings.push(booking);
    saveData('hostel_bookings', bookings);

    // Clear selected food
    localStorage.removeItem('hostel_selected_food');

    // Show confirmation
    document.getElementById('confirmDetails').innerHTML = `
        <div><span>Room</span><span>${room.name}</span></div>
        <div><span>Food Plan</span><span>${food ? food.name : 'None'}</span></div>
        <div><span>Check-in</span><span>${checkin}</span></div>
        <div><span>Check-out</span><span>${checkout}</span></div>
        <div><span>Duration</span><span>${days} days</span></div>
        <div style="font-weight:700;color:var(--accent)"><span>Total</span><span>₹${totalCost}</span></div>
    `;
    document.getElementById('confirmModal').style.display = 'flex';

    showToast('Booking submitted successfully!');
}

function closeModal() { document.getElementById('confirmModal').style.display = 'none'; }

// ===== MY BOOKINGS =====
function renderMyBookings() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Please login to view bookings');
        showPage('login');
        return;
    }

    const bookings = getBookings().filter(b => b.userId === user.email);
    const list = document.getElementById('myBookingsList');
    const empty = document.getElementById('noBookings');

    if (bookings.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    list.innerHTML = bookings.reverse().map(b => `
        <div class="booking-item">
            <div class="booking-header">
                <div>
                    <h3>${b.roomName}</h3>
                    <span style="font-size:.8rem;color:var(--text-dim)">Booking #${b.id}</span>
                </div>
                <span class="status-badge status-${b.status}">
                    ${b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                </span>
            </div>
            <div class="booking-details">
                <div class="booking-detail">
                    <span class="label">Room Type</span>
                    <span class="value">${b.roomType}</span>
                </div>
                <div class="booking-detail">
                    <span class="label">Check-in</span>
                    <span class="value">${b.checkin}</span>
                </div>
                <div class="booking-detail">
                    <span class="label">Check-out</span>
                    <span class="value">${b.checkout}</span>
                </div>
                <div class="booking-detail">
                    <span class="label">Duration</span>
                    <span class="value">${b.days} days</span>
                </div>
                <div class="booking-detail">
                    <span class="label">Food Plan</span>
                    <span class="value">${b.foodPlanName}</span>
                </div>
                <div class="booking-detail">
                    <span class="label">Total Amount</span>
                    <span class="value" style="color:var(--accent);font-weight:700">₹${b.totalCost}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== AUTH =====
function toggleAuth() {
    const login = document.getElementById('loginCard');
    const register = document.getElementById('registerCard');
    login.style.display = login.style.display === 'none' ? 'block' : 'none';
    register.style.display = register.style.display === 'none' ? 'block' : 'none';
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;

    if (password.length < 6) { showToast('Password must be at least 6 characters'); return; }

    const users = getUsers();
    if (users.find(u => u.email === email)) { showToast('Email already registered'); return; }

    const user = { name, email, phone, password, createdAt: new Date().toISOString() };
    users.push(user);
    saveData('hostel_users', users);

    localStorage.setItem('hostel_current_user', JSON.stringify(user));
    updateAuthUI();
    showToast('Registration successful! Welcome, ' + name);
    showPage('home');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) { showToast('Invalid email or password'); return; }

    localStorage.setItem('hostel_current_user', JSON.stringify(user));
    updateAuthUI();
    showToast('Welcome back, ' + user.name + '!');
    showPage('home');
}

function logout() {
    localStorage.removeItem('hostel_current_user');
    updateAuthUI();
    showToast('Logged out successfully');
    showPage('home');
}

function updateAuthUI() {
    const user = getCurrentUser();
    const greeting = document.getElementById('userGreeting');
    const loginBtn = document.getElementById('loginBtn');

    if (user) {
        greeting.style.display = 'flex';
        document.getElementById('userName').textContent = user.name;
        loginBtn.style.display = 'none';
    } else {
        greeting.style.display = 'none';
        loginBtn.style.display = 'inline-flex';
    }
}

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    renderRooms();

    // Initialize rooms/food if not yet stored
    if (!localStorage.getItem('hostel_rooms')) {
        saveData('hostel_rooms', DEFAULT_ROOMS);
    }
    if (!localStorage.getItem('hostel_food_plans')) {
        saveData('hostel_food_plans', DEFAULT_FOOD_PLANS);
    }
});
