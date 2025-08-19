const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8000/api';
let adminToken = '';
let studentToken = '';

// Test data
const testData = {
	mess: { name: 'Test Mess', location: 'Test Location' },
	mealSlot: { type: 'Dinner', startTime: '18:00', endTime: '20:00' },
	student: { mobile: '1234567890', password: 'pass123' },
	admin: { username: 'admin', password: 'admin123' }
};

// Helper function to log test results
function logTest(testName, success, response = null, error = null) {
	const status = success ? '✅ PASS' : '❌ FAIL';
	console.log(`${status} ${testName}`);
	if (error) {
		console.log(`   Error: ${error.message || error}`);
	}
	if (response && response.data) {
		console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
	}
	console.log('');
}

// Test authentication endpoints
async function testAuthentication() {
	console.log('🔐 Testing Authentication Endpoints\n');

	try {
		// Test student login
		const studentResponse = await axios.post(`${BASE_URL}/auth/student/login`, testData.student);
		studentToken = studentResponse.data.data.token;
		logTest('Student Login', true, studentResponse);

		// Test admin login
		const adminResponse = await axios.post(`${BASE_URL}/auth/admin/login`, testData.admin);
		adminToken = studentResponse.data.data.token;
		logTest('Admin Login', true, adminResponse);

		// Test token verification
		const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Token Verification', true, verifyResponse);

	} catch (error) {
		logTest('Authentication Tests', false, null, error);
	}
}

// Test mess management endpoints
async function testMessManagement() {
	console.log('🏢 Testing Mess Management Endpoints\n');

	try {
		// Create mess
		const createResponse = await axios.post(`${BASE_URL}/mess`, testData.mess, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		const messId = createResponse.data.data.id;
		logTest('Create Mess', true, createResponse);

		// Get all messes
		const getAllResponse = await axios.get(`${BASE_URL}/mess`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Get All Messes', true, getAllResponse);

		// Get mess by ID
		const getByIdResponse = await axios.get(`${BASE_URL}/mess/${messId}`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Get Mess by ID', true, getByIdResponse);

		// Update mess
		const updateResponse = await axios.put(`${BASE_URL}/mess/${messId}`,
			{ name: 'Updated Test Mess' }, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		logTest('Update Mess', true, updateResponse);

	} catch (error) {
		logTest('Mess Management Tests', false, null, error);
	}
}

// Test meal slot management endpoints
async function testMealSlotManagement() {
	console.log('⏰ Testing Meal Slot Management Endpoints\n');

	try {
		// Create meal slot
		const createResponse = await axios.post(`${BASE_URL}/meal-slot`, testData.mealSlot, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		const slotId = createResponse.data.data.id;
		logTest('Create Meal Slot', true, createResponse);

		// Get all meal slots
		const getAllResponse = await axios.get(`${BASE_URL}/meal-slot`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Get All Meal Slots', true, getAllResponse);

		// Get meal slot by ID
		const getByIdResponse = await axios.get(`${BASE_URL}/meal-slot/${slotId}`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Get Meal Slot by ID', true, getByIdResponse);

		// Update meal slot
		const updateResponse = await axios.put(`${BASE_URL}/meal-slot/${slotId}`,
			{ startTime: '18:30' }, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		logTest('Update Meal Slot', true, updateResponse);

	} catch (error) {
		logTest('Meal Slot Management Tests', false, null, error);
	}
}

// Test booking endpoints
async function testBookingManagement() {
	console.log('📅 Testing Booking Management Endpoints\n');

	try {
		// Get meal slots for booking
		const slotsResponse = await axios.get(`${BASE_URL}/meal-slot`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		const slotId = slotsResponse.data.data[0].id;

		// Book meal
		const bookResponse = await axios.post(`${BASE_URL}/booking`, {
			studentId: '123',
			mealSlotId: slotId
		}, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		const bookingId = bookResponse.data.data.id;
		logTest('Book Meal', true, bookResponse);

		// View availability
		const availabilityResponse = await axios.get(`${BASE_URL}/booking/availability`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('View Availability', true, availabilityResponse);

		// Get all bookings
		const getAllResponse = await axios.get(`${BASE_URL}/booking`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		logTest('Get All Bookings', true, getAllResponse);

		// Get booking by ID
		const getByIdResponse = await axios.get(`${BASE_URL}/booking/${bookingId}`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Get Booking by ID', true, getByIdResponse);

		// Cancel booking
		const cancelResponse = await axios.delete(`${BASE_URL}/booking/${bookingId}`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Cancel Booking', true, cancelResponse);

	} catch (error) {
		logTest('Booking Management Tests', false, null, error);
	}
}

// Test coupon endpoints
async function testCouponManagement() {
	console.log('🎫 Testing Coupon Management Endpoints\n');

	try {
		// Get meal slots for coupon generation
		const slotsResponse = await axios.get(`${BASE_URL}/meal-slot`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		const slotId = slotsResponse.data.data[0].id;

		// Generate coupon
		const generateResponse = await axios.post(`${BASE_URL}/coupon`, {
			studentId: '123',
			slotId: slotId
		}, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		const couponCode = generateResponse.data.data.couponCode;
		logTest('Generate Coupon', true, generateResponse);

		// Get all coupons
		const getAllResponse = await axios.get(`${BASE_URL}/coupon`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		logTest('Get All Coupons', true, getAllResponse);

		// Get student coupons
		const studentCouponsResponse = await axios.get(`${BASE_URL}/coupon/student/123`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Get Student Coupons', true, studentCouponsResponse);

		// Validate coupon
		const validateResponse = await axios.post(`${BASE_URL}/coupon/validate`, {
			couponCode: couponCode
		}, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		logTest('Validate Coupon', true, validateResponse);

	} catch (error) {
		logTest('Coupon Management Tests', false, null, error);
	}
}

// Test notification endpoints
async function testNotificationManagement() {
	console.log('🔔 Testing Notification Management Endpoints\n');

	try {
		// Send notification
		const sendResponse = await axios.post(`${BASE_URL}/notifications`, {
			title: 'Test Notification',
			message: 'This is a test notification'
		}, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		const notificationId = sendResponse.data.data.id;
		logTest('Send Notification', true, sendResponse);

		// Get all notifications
		const getAllResponse = await axios.get(`${BASE_URL}/notifications`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		logTest('Get All Notifications', true, getAllResponse);

		// Get recent notifications
		const recentResponse = await axios.get(`${BASE_URL}/notifications/recent`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Get Recent Notifications', true, recentResponse);

		// Get notification by ID
		const getByIdResponse = await axios.get(`${BASE_URL}/notifications/${notificationId}`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		logTest('Get Notification by ID', true, getByIdResponse);

	} catch (error) {
		logTest('Notification Management Tests', false, null, error);
	}
}

// Test report endpoints
async function testReportEndpoints() {
	console.log('📊 Testing Report Endpoints\n');

	try {
		// Generate mess usage report
		const reportResponse = await axios.get(`${BASE_URL}/report/mess-usage`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		logTest('Generate Mess Usage Report', true, reportResponse);

		// Get dashboard statistics
		const dashboardResponse = await axios.get(`${BASE_URL}/report/dashboard`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		logTest('Get Dashboard Statistics', true, dashboardResponse);

	} catch (error) {
		logTest('Report Endpoints Tests', false, null, error);
	}
}

// Test history endpoints
async function testHistoryEndpoints() {
	console.log('📈 Testing History Endpoints\n');

	try {
		// Get booking history
		const historyResponse = await axios.get(`${BASE_URL}/history/123`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Get Booking History', true, historyResponse);

		// Get recent activity
		const recentResponse = await axios.get(`${BASE_URL}/history/123/recent`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Get Recent Activity', true, recentResponse);

		// Get student statistics
		const statsResponse = await axios.get(`${BASE_URL}/history/123/stats`, {
			headers: { Authorization: `Bearer ${studentToken}` }
		});
		logTest('Get Student Statistics', true, statsResponse);

	} catch (error) {
		logTest('History Endpoints Tests', false, null, error);
	}
}

// Test audit log endpoints
async function testAuditLogEndpoints() {
	console.log('📝 Testing Audit Log Endpoints\n');

	try {
		// Get all audit logs
		const logsResponse = await axios.get(`${BASE_URL}/audit-logs`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		logTest('Get All Audit Logs', true, logsResponse);

		// Get audit statistics
		const statsResponse = await axios.get(`${BASE_URL}/audit-logs/stats/summary`, {
			headers: { Authorization: `Bearer ${adminToken}` }
		});
		logTest('Get Audit Statistics', true, statsResponse);

	} catch (error) {
		logTest('Audit Log Endpoints Tests', false, null, error);
	}
}

// Test health endpoint
async function testHealthEndpoint() {
	console.log('🏥 Testing Health Endpoint\n');

	try {
		const healthResponse = await axios.get(`${BASE_URL}/health`);
		logTest('Health Check', true, healthResponse);
	} catch (error) {
		logTest('Health Endpoint Test', false, null, error);
	}
}

// Main test runner
async function runAllTests() {
	console.log('🚀 Starting Mess Management System API Tests\n');
	console.log('='.repeat(50));

	try {
		await testHealthEndpoint();
		await testAuthentication();
		await testMessManagement();
		await testMealSlotManagement();
		await testBookingManagement();
		await testCouponManagement();
		await testNotificationManagement();
		await testReportEndpoints();
		await testHistoryEndpoints();
		await testAuditLogEndpoints();

		console.log('='.repeat(50));
		console.log('🎉 All tests completed!');
		console.log('📝 Check the results above for any failures.');

	} catch (error) {
		console.error('❌ Test suite failed:', error.message);
	}
}

// Run tests if this file is executed directly
if (require.main === module) {
	runAllTests();
}

module.exports = {
	runAllTests,
	testAuthentication,
	testMessManagement,
	testMealSlotManagement,
	testBookingManagement,
	testCouponManagement,
	testNotificationManagement,
	testReportEndpoints,
	testHistoryEndpoints,
	testAuditLogEndpoints,
	testHealthEndpoint
}; 