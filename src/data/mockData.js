export const donors = [
  { id: 'd1', name: 'Fresh Bakery KL', initials: 'FB', email: 'donor@food.com', trustScore: 98, donationCount: 145, points: 2900, rank: 1, vouchers: ['v1', 'v2'], certificates: ['c1'] },
  { id: 'd2', name: 'Green Grocers', initials: 'GG', email: 'green@food.com', trustScore: 85, donationCount: 89, points: 1780, rank: 2, vouchers: ['v3'], certificates: [] },
  { id: 'd3', name: 'Mama Nasi Lemak', initials: 'MN', email: 'mama@food.com', trustScore: 92, donationCount: 76, points: 1520, rank: 3, vouchers: [], certificates: [] },
  { id: 'd4', name: 'Cafe 1920', initials: 'C1', email: 'cafe@food.com', trustScore: 78, donationCount: 45, points: 900, rank: 4, vouchers: [], certificates: [] },
  { id: 'd5', name: 'SuperMart Subang', initials: 'SS', email: 'super@food.com', trustScore: 65, donationCount: 32, points: 640, rank: 5, vouchers: [], certificates: [] },
  { id: 'd6', name: 'Healthy Bowls', initials: 'HB', email: 'healthy@food.com', trustScore: 88, donationCount: 28, points: 560, rank: 6, vouchers: [], certificates: [] },
  { id: 'd7', name: 'Bento Express', initials: 'BE', email: 'bento@food.com', trustScore: 95, donationCount: 25, points: 500, rank: 7, vouchers: [], certificates: [] },
  { id: 'd8', name: 'Fruit Ninja', initials: 'FN', email: 'fruit@food.com', trustScore: 70, donationCount: 18, points: 360, rank: 8, vouchers: [], certificates: [] },
  { id: 'd9', name: 'Kopitiam Classic', initials: 'KC', email: 'kopi@food.com', trustScore: 82, donationCount: 15, points: 300, rank: 9, vouchers: [], certificates: [] },
  { id: 'd10', name: 'Dim Sum House', initials: 'DS', email: 'dimsum@food.com', trustScore: 90, donationCount: 10, points: 200, rank: 10, vouchers: [], certificates: [] },
];

export const foodListings = [
  { id: 'f1', donorId: 'd1', name: 'Assorted Breads & Pastries', category: 'Bakery', quantity: 15, unit: 'pieces', expiry: new Date(Date.now() + 3 * 3600000).toISOString(), allergyTags: ['Gluten', 'Dairy'], distance: 1.2, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', status: 'Active', pickupSlots: [{ date: 'Today', start: '14:00', end: '16:00' }] },
  { id: 'f2', donorId: 'd3', name: 'Nasi Lemak Biasa', category: 'Cooked Meal', quantity: 8, unit: 'portions', expiry: new Date(Date.now() + 1.5 * 3600000).toISOString(), allergyTags: ['Nuts'], distance: 0.8, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', status: 'Claimed', pickupSlots: [{ date: 'Today', start: '12:00', end: '13:00' }] },
  { id: 'f3', donorId: 'd2', name: 'Mixed Vegetables', category: 'Raw Produce', quantity: 5, unit: 'kg', expiry: new Date(Date.now() + 24 * 3600000).toISOString(), allergyTags: ['None'], distance: 3.4, imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80', status: 'Active', pickupSlots: [{ date: 'Today', start: '17:00', end: '19:00' }] },
  { id: 'f4', donorId: 'd7', name: 'Chicken Teriyaki Bento', category: 'Cooked Meal', quantity: 4, unit: 'portions', expiry: new Date(Date.now() + 1 * 3600000).toISOString(), allergyTags: ['Soy'], distance: 2.1, imageUrl: 'https://images.unsplash.com/photo-1580959336723-080fa14e5080?w=400&q=80', status: 'Active', pickupSlots: [{ date: 'Today', start: '13:00', end: '15:00' }] },
  { id: 'f5', donorId: 'd5', name: 'Canned Beans & Soups', category: 'Canned Goods', quantity: 20, unit: 'pieces', expiry: new Date(Date.now() + 720 * 3600000).toISOString(), allergyTags: ['None'], distance: 5.5, imageUrl: 'https://images.unsplash.com/photo-1557004652-32a24cbf6df8?w=400&q=80', status: 'Completed', pickupSlots: [{ date: 'Yesterday', start: '10:00', end: '12:00' }] },
  { id: 'f6', donorId: 'd6', name: 'Vegan Salad Bowls', category: 'Cooked Meal', quantity: 3, unit: 'portions', expiry: new Date(Date.now() + 2 * 3600000).toISOString(), allergyTags: ['Vegan-safe'], distance: 1.8, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', status: 'Active', pickupSlots: [{ date: 'Today', start: '11:00', end: '14:00' }] },
  { id: 'f7', donorId: 'd8', name: 'Overripe Bananas', category: 'Raw Produce', quantity: 3, unit: 'kg', expiry: new Date(Date.now() + 12 * 3600000).toISOString(), allergyTags: ['None'], distance: 4.2, imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&q=80', status: 'Expired', pickupSlots: [{ date: 'Yesterday', start: '16:00', end: '18:00' }] },
  { id: 'f8', donorId: 'd10', name: 'Dim Sum Platter', category: 'Cooked Meal', quantity: 5, unit: 'portions', expiry: new Date(Date.now() + 4 * 3600000).toISOString(), allergyTags: ['Shellfish', 'Soy'], distance: 2.7, imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', status: 'Active', pickupSlots: [{ date: 'Today', start: '15:00', end: '17:00' }] },
];

export const receivers = [
  { id: 'r1', name: 'Ahmad Ali', initials: 'AA', email: 'receiver@food.com', trustScore: 92, completedPickups: 45, allergyProfile: ['Nuts'] },
  { id: 'r2', name: 'Sarah Lee', initials: 'SL', email: 'sarah@food.com', trustScore: 88, completedPickups: 32, allergyProfile: [] },
  { id: 'r3', name: 'Pusat Jagaan Kasih', initials: 'PJ', email: 'kasih@food.com', trustScore: 99, completedPickups: 156, allergyProfile: ['Shellfish'] },
  { id: 'r4', name: 'Kavita Singh', initials: 'KS', email: 'kavita@food.com', trustScore: 75, completedPickups: 18, allergyProfile: ['Dairy', 'Gluten'] },
  { id: 'r5', name: 'Rumah Titian', initials: 'RT', email: 'titian@food.com', trustScore: 95, completedPickups: 89, allergyProfile: [] },
];

export const bookings = [
  { id: 'b1', receiverId: 'r1', foodId: 'f2', donorId: 'd3', status: 'Upcoming', pickupSlot: { date: 'Today', start: '12:00', end: '13:00' }, qrValue: 'FB-b1-XYZ987', reviewSubmitted: false },
  { id: 'b2', receiverId: 'r2', foodId: 'f5', donorId: 'd5', status: 'Completed', pickupSlot: { date: 'Yesterday', start: '10:00', end: '12:00' }, qrValue: 'FB-b2-ABC123', reviewSubmitted: true },
  { id: 'b3', receiverId: 'r3', foodId: 'f1', donorId: 'd1', status: 'Upcoming', pickupSlot: { date: 'Today', start: '14:00', end: '16:00' }, qrValue: 'FB-b3-DEF456', reviewSubmitted: false },
  { id: 'b4', receiverId: 'r1', foodId: 'f7', donorId: 'd8', status: 'Missed', pickupSlot: { date: 'Yesterday', start: '16:00', end: '18:00' }, qrValue: 'FB-b4-GHI789', reviewSubmitted: false },
  { id: 'b5', receiverId: 'r4', foodId: 'f4', donorId: 'd7', status: 'Cancelled', pickupSlot: { date: 'Yesterday', start: '13:00', end: '15:00' }, qrValue: 'FB-b5-JKL012', reviewSubmitted: false },
  { id: 'b6', receiverId: 'r5', foodId: 'f8', donorId: 'd10', status: 'Completed', pickupSlot: { date: 'Last Week', start: '15:00', end: '17:00' }, qrValue: 'FB-b6-MNO345', reviewSubmitted: true },
];

export const vouchers = [
  { id: 'v1', partner: 'GrabFood', discount: 'RM10 Off Delivery', expiry: '2026-12-31', code: 'GRABFB10', redeemed: false },
  { id: 'v2', partner: 'Jaya Grocer', discount: '5% Off Bill', expiry: '2026-10-31', code: 'JAYA5FB', redeemed: false },
  { id: 'v3', partner: 'Tealive', discount: 'Free Upsize', expiry: '2026-08-31', code: 'TLFBUP', redeemed: true },
  { id: 'v4', partner: 'Foodpanda', discount: 'RM5 Off', expiry: '2026-11-30', code: 'PANDAFB5', redeemed: false },
  { id: 'v5', partner: 'Bask Bear', discount: '10% Off Coffee', expiry: '2026-09-30', code: 'BBFB10', redeemed: true },
];

export const certificates = [
  { id: 'c1', donorName: 'Fresh Bakery KL', dateRange: 'Jan 2026 - Mar 2026', totalDonations: 45, satisfactionScore: 4.8 },
  { id: 'c2', donorName: 'Green Grocers', dateRange: 'Oct 2025 - Dec 2025', totalDonations: 30, satisfactionScore: 4.5 },
  { id: 'c3', donorName: 'Mama Nasi Lemak', dateRange: 'Jan 2026 - Mar 2026', totalDonations: 52, satisfactionScore: 4.9 },
  { id: 'c4', donorName: 'Cafe 1920', dateRange: 'Oct 2025 - Dec 2025', totalDonations: 20, satisfactionScore: 4.2 },
];

export const reviews = [
  { id: 'rev1', bookingId: 'b2', rating: 5, comment: 'Food was well packed and still warm. Thank you!', date: '2026-05-15' },
  { id: 'rev2', bookingId: 'b6', rating: 4, comment: 'Great quality, very friendly staff during pickup.', date: '2026-05-10' },
  { id: 'rev3', bookingId: 'old1', rating: 5, comment: 'Always reliable and fresh produce.', date: '2026-04-28' },
  { id: 'rev4', bookingId: 'old2', rating: 3, comment: 'Pickup was a bit confusing, but food was good.', date: '2026-04-15' },
  { id: 'rev5', bookingId: 'old3', rating: 5, comment: 'Highly recommended donor!', date: '2026-04-02' },
  { id: 'rev6', bookingId: 'old4', rating: 4, comment: 'Good portions.', date: '2026-03-20' },
];

export const adminUsers = [
  { id: 'a1', name: 'Admin Syaza', initials: 'AS', email: 'admin@food.com', role: 'Superadmin', trustScore: 100, status: 'Active' },
  { id: 'a2', name: 'Mod Kevin', initials: 'MK', email: 'modk@food.com', role: 'Moderator', trustScore: 100, status: 'Active' },
  { id: 'a3', name: 'Mod Aisyah', initials: 'MA', email: 'moda@food.com', role: 'Moderator', trustScore: 100, status: 'Active' },
  { id: 'a4', name: 'Admin Wong', initials: 'AW', email: 'wong@food.com', role: 'Admin', trustScore: 100, status: 'Offline' },
];

export const weeklyStats = [
  { week: 'W1', donations: 120, pickups: 115, kgSaved: 350 },
  { week: 'W2', donations: 135, pickups: 130, kgSaved: 410 },
  { week: 'W3', donations: 150, pickups: 142, kgSaved: 480 },
  { week: 'W4', donations: 140, pickups: 138, kgSaved: 420 },
  { week: 'W5', donations: 180, pickups: 175, kgSaved: 590 },
  { week: 'W6', donations: 195, pickups: 188, kgSaved: 630 },
  { week: 'W7', donations: 210, pickups: 205, kgSaved: 710 },
  { week: 'W8', donations: 230, pickups: 225, kgSaved: 800 },
];
