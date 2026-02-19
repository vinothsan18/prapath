/* ===== ADMIN PANEL JAVASCRIPT ===== */

// ===== DATA HELPERS =====
function getData(key, defaults) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaults;
}
function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

function getRooms() { return getData('hostel_rooms', []); }
function getFoodPlans() { return getData('hostel_food_plans', []); }
function getBookings() { return getData('hostel_bookings', []); }
function getUsers() { return getData('hostel_users', []); }

// ===== SECTION NAVIGATION =====
function showSection(section, el) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById('sec-' + section).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');

    const titles = { dashboard: 'Dashboard', rooms: 'Room Management', bookings: 'Booking Management', food: 'Food Plans', customers: 'Customers' };
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';

    if (section === 'dashboard') renderDashboard();
    if (section === 'rooms') renderRoomsTable();
    if (section === 'bookings') renderBookingsTable();
    if (section === 'food') renderFoodAdmin();
    if (section === 'customers') renderCustomers();

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

// ===== TOAST =====
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== DASHBOARD =====
function renderDashboard() {
    const rooms = getRooms();
    const bookings = getBookings();
    const users = getUsers();
    const foodPlans = getFoodPlans();

    const totalRooms = rooms.length;
    const available = rooms.filter(r => r.status === 'available').length;
    const occupied = totalRooms - available;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalRevenue = bookings.filter(b => b.status === 'approved').reduce((s, b) => s + b.totalCost, 0);

    // Stats
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon blue"><i class="fas fa-bed"></i></div>
            <div class="stat-info">
                <h4>Total Rooms</h4>
                <div class="stat-value">${totalRooms}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-info">
                <h4>Total Bookings</h4>
                <div class="stat-value">${totalBookings}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
            <div class="stat-info">
                <h4>Pending Approvals</h4>
                <div class="stat-value">${pendingBookings}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon teal"><i class="fas fa-rupee-sign"></i></div>
            <div class="stat-info">
                <h4>Total Revenue</h4>
                <div class="stat-value">₹${totalRevenue.toLocaleString()}</div>
            </div>
        </div>
    `;

    // Recent bookings
    const recent = [...bookings].reverse().slice(0, 5);
    document.getElementById('recentBookings').innerHTML = recent.length
        ? recent.map(b => `
            <div class="recent-item">
                <div class="recent-info">
                    <h4>${b.userName || 'Guest'}</h4>
                    <span>${b.roomName} · ${b.checkin}</span>
                </div>
                <div>
                    <span class="status-badge status-${b.status}">${b.status}</span>
                    <span class="recent-amount" style="margin-left:12px;">₹${b.totalCost}</span>
                </div>
            </div>
        `).join('')
        : '<p style="color:var(--text-dim);text-align:center;padding:20px;">No bookings yet</p>';

    // Occupancy chart
    const occPercent = totalRooms ? Math.round((occupied / totalRooms) * 100) : 0;
    const availPercent = 100 - occPercent;
    document.getElementById('occupancyChart').innerHTML = `
        <div class="occupancy-bar">
            <div class="occupancy-label">
                <span>Available (${available})</span>
                <span>${availPercent}%</span>
            </div>
            <div class="bar-track"><div class="bar-fill green" style="width:${availPercent}%"></div></div>
        </div>
        <div class="occupancy-bar">
            <div class="occupancy-label">
                <span>Occupied (${occupied})</span>
                <span>${occPercent}%</span>
            </div>
            <div class="bar-track"><div class="bar-fill orange" style="width:${occPercent}%"></div></div>
        </div>
        <div style="margin-top:20px;padding:16px;background:var(--glass);border-radius:var(--radius-sm);">
            <div style="display:flex;justify-content:space-between;font-size:.85rem;color:var(--text-muted);">
                <span>Total Customers</span><span style="font-weight:700;color:var(--text)">${users.length}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:.85rem;color:var(--text-muted);margin-top:8px;">
                <span>Food Plans</span><span style="font-weight:700;color:var(--text)">${foodPlans.length}</span>
            </div>
        </div>
    `;
}

// ===== ROOMS TABLE =====
function renderRoomsTable() {
    const rooms = getRooms();
    document.getElementById('roomsBody').innerHTML = rooms.map(r => `
        <tr>
            <td><strong>${r.name}</strong></td>
            <td style="text-transform:capitalize">${r.type}</td>
            <td>₹${r.price}</td>
            <td><span class="status-badge status-${r.status}">${r.status}</span></td>
            <td>${r.amenities ? r.amenities.join(', ') : '-'}</td>
            <td>
                <button class="btn btn-outline btn-xs" onclick="editRoom('${r.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-xs" onclick="deleteRoom('${r.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ===== ROOM MODAL =====
function openRoomModal(roomId) {
    document.getElementById('roomModal').style.display = 'flex';
    document.getElementById('roomForm').reset();
    document.getElementById('editRoomId').value = '';
    document.getElementById('roomModalTitle').innerHTML = '<i class="fas fa-bed"></i> Add Room';
}

function closeRoomModal() { document.getElementById('roomModal').style.display = 'none'; }

function editRoom(id) {
    const rooms = getRooms();
    const r = rooms.find(rm => rm.id === id);
    if (!r) return;

    document.getElementById('editRoomId').value = r.id;
    document.getElementById('roomName').value = r.name;
    document.getElementById('roomType').value = r.type;
    document.getElementById('roomPrice').value = r.price;
    document.getElementById('roomDesc').value = r.desc || '';
    document.getElementById('roomAmenities').value = r.amenities ? r.amenities.join(', ') : '';
    document.getElementById('roomStatus').value = r.status;
    document.getElementById('roomModalTitle').innerHTML = '<i class="fas fa-bed"></i> Edit Room';
    document.getElementById('roomModal').style.display = 'flex';
}

function saveRoom(e) {
    e.preventDefault();
    const rooms = getRooms();
    const editId = document.getElementById('editRoomId').value;

    const roomData = {
        id: editId || 'r' + Date.now(),
        name: document.getElementById('roomName').value.trim(),
        type: document.getElementById('roomType').value,
        price: parseInt(document.getElementById('roomPrice').value),
        desc: document.getElementById('roomDesc').value.trim(),
        amenities: document.getElementById('roomAmenities').value.split(',').map(a => a.trim()).filter(Boolean),
        status: document.getElementById('roomStatus').value,
    };

    if (editId) {
        const idx = rooms.findIndex(r => r.id === editId);
        if (idx !== -1) rooms[idx] = roomData;
    } else {
        rooms.push(roomData);
    }

    saveData('hostel_rooms', rooms);
    closeRoomModal();
    renderRoomsTable();
    showToast(editId ? 'Room updated successfully!' : 'Room added successfully!');
}

function deleteRoom(id) {
    if (!confirm('Are you sure you want to delete this room?')) return;
    const rooms = getRooms().filter(r => r.id !== id);
    saveData('hostel_rooms', rooms);
    renderRoomsTable();
    showToast('Room deleted');
}

// ===== BOOKINGS TABLE =====
let bookingFilter = 'all';

function renderBookingsTable(filter) {
    if (filter) bookingFilter = filter;
    const bookings = getBookings();
    const filtered = bookingFilter === 'all' ? bookings : bookings.filter(b => b.status === bookingFilter);

    document.getElementById('bookingsBody').innerHTML = filtered.length
        ? [...filtered].reverse().map(b => `
            <tr>
                <td><strong>${b.id}</strong></td>
                <td>${b.userName || 'Guest'}</td>
                <td>${b.roomName}</td>
                <td>${b.checkin}</td>
                <td>${b.checkout}</td>
                <td>${b.foodPlanName || 'None'}</td>
                <td style="font-weight:700;color:var(--accent)">₹${b.totalCost}</td>
                <td><span class="status-badge status-${b.status}">${b.status}</span></td>
                <td>
                    ${b.status === 'pending' ? `
                        <button class="btn btn-success btn-xs" onclick="updateBookingStatus('${b.id}','approved')"><i class="fas fa-check"></i></button>
                        <button class="btn btn-danger btn-xs" onclick="updateBookingStatus('${b.id}','rejected')"><i class="fas fa-times"></i></button>
                    ` : '-'}
                </td>
            </tr>
        `).join('')
        : `<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-dim)">No bookings found</td></tr>`;
}

function filterBookings(status, btn) {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderBookingsTable(status);
}

function updateBookingStatus(id, status) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    booking.status = status;
    saveData('hostel_bookings', bookings);
    renderBookingsTable();
    showToast(`Booking ${status}!`);
}

// ===== FOOD PLAN ADMIN =====
function renderFoodAdmin() {
    const plans = getFoodPlans();
    document.getElementById('foodAdminGrid').innerHTML = plans.map(p => `
        <div class="food-admin-card">
            <div class="food-admin-header">
                <span class="food-emoji">${p.icon || '🍽️'}</span>
                <div style="flex:1;">
                    <h4>${p.name}</h4>
                    <span class="food-p">₹${p.price}/day</span>
                </div>
                ${p.popular ? '<span class="status-badge status-approved">Popular</span>' : ''}
            </div>
            <ul class="food-features-list">
                ${p.features ? p.features.map(f => `<li><i class="fas fa-check-circle"></i>${f}</li>`).join('') : '<li>No features listed</li>'}
            </ul>
            <div class="food-admin-actions">
                <button class="btn btn-outline btn-sm" onclick="editFoodPlan('${p.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteFoodPlan('${p.id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('') || '<p style="color:var(--text-dim);text-align:center;padding:40px;">No food plans yet. Click "Add Plan" to create one.</p>';
}

function openFoodModal() {
    document.getElementById('foodModal').style.display = 'flex';
    document.getElementById('foodForm').reset();
    document.getElementById('editFoodId').value = '';
    document.getElementById('foodModalTitle').innerHTML = '<i class="fas fa-utensils"></i> Add Food Plan';
}

function closeFoodModal() { document.getElementById('foodModal').style.display = 'none'; }

function editFoodPlan(id) {
    const plans = getFoodPlans();
    const p = plans.find(pl => pl.id === id);
    if (!p) return;

    document.getElementById('editFoodId').value = p.id;
    document.getElementById('foodName').value = p.name;
    document.getElementById('foodPrice').value = p.price;
    document.getElementById('foodIcon').value = p.icon || '';
    document.getElementById('foodPopular').value = p.popular ? 'true' : 'false';
    document.getElementById('foodFeatures').value = p.features ? p.features.join(', ') : '';
    document.getElementById('foodModalTitle').innerHTML = '<i class="fas fa-utensils"></i> Edit Food Plan';
    document.getElementById('foodModal').style.display = 'flex';
}

function saveFoodPlan(e) {
    e.preventDefault();
    const plans = getFoodPlans();
    const editId = document.getElementById('editFoodId').value;

    const planData = {
        id: editId || 'f' + Date.now(),
        name: document.getElementById('foodName').value.trim(),
        price: parseInt(document.getElementById('foodPrice').value),
        icon: document.getElementById('foodIcon').value.trim() || '🍽️',
        popular: document.getElementById('foodPopular').value === 'true',
        features: document.getElementById('foodFeatures').value.split(',').map(f => f.trim()).filter(Boolean),
    };

    if (editId) {
        const idx = plans.findIndex(p => p.id === editId);
        if (idx !== -1) plans[idx] = planData;
    } else {
        plans.push(planData);
    }

    saveData('hostel_food_plans', plans);
    closeFoodModal();
    renderFoodAdmin();
    showToast(editId ? 'Food plan updated!' : 'Food plan added!');
}

function deleteFoodPlan(id) {
    if (!confirm('Delete this food plan?')) return;
    const plans = getFoodPlans().filter(p => p.id !== id);
    saveData('hostel_food_plans', plans);
    renderFoodAdmin();
    showToast('Food plan deleted');
}

// ===== CUSTOMERS =====
function renderCustomers() {
    const users = getUsers();
    const bookings = getBookings();

    document.getElementById('customersBody').innerHTML = users.length
        ? users.map(u => {
            const userBookings = bookings.filter(b => b.userId === u.email);
            return `
                <tr>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td>${u.phone || '-'}</td>
                    <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                    <td>${userBookings.length}</td>
                </tr>
            `;
        }).join('')
        : `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-dim)">No customers registered yet</td></tr>`;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
});
