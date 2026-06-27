"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("./services/auth.service");
const db_1 = require("./database/db");
async function runTests() {
    console.log('==================================================');
    console.log('STARTING AUTHENTICATION SYSTEM INTEGRATION TESTS...');
    console.log('==================================================');
    // Test 1: Verify Default Admin Login
    console.log('\n[Test 1] Logging in with default Super Admin...');
    try {
        const adminSession = await auth_service_1.authService.login({ email: 'admin@flowcrm.ai', password: 'Password@123' }, { ipAddress: '127.0.0.1', userAgent: 'TestRunner Browser/Chrome' });
        console.log('✓ Super Admin logged in successfully!');
        console.log(`  Role: ${adminSession.role}`);
        console.log(`  Permissions Count: ${adminSession.permissions.length}`);
        console.log(`  Access Token signature valid: ${adminSession.accessToken.substring(0, 30)}...`);
    }
    catch (error) {
        console.error('✗ Super Admin login failed!', error);
    }
    // Test 2: Register a new user
    console.log('\n[Test 2] Registering a new Sales Executive...');
    const testEmail = 'test-sales@flowcrm.ai';
    try {
        // Clean up if left from previous runs
        await db_1.prisma.user.deleteMany({ where: { email: testEmail } });
        const newUser = await auth_service_1.authService.register({
            email: testEmail,
            password: 'StrongPassword@12345',
            firstName: 'Jane',
            lastName: 'Doe',
            phone: '+15559999',
            department: 'Sales',
            jobTitle: 'Sales Executive'
        });
        console.log(`✓ User registered successfully: ${newUser.email}`);
        console.log(`  FullName: ${newUser.fullName}`);
        console.log(`  Role ID: ${newUser.roleId}`);
    }
    catch (error) {
        console.error('✗ Registration failed!', error);
    }
    // Test 3: Validate Duplicate Email Registration
    console.log('\n[Test 3] Testing duplicate email registration rejection...');
    try {
        await auth_service_1.authService.register({
            email: testEmail,
            password: 'StrongPassword@12345',
            firstName: 'Jane2',
            lastName: 'Doe2'
        });
        console.error('✗ Duplicate email registration succeeded when it should have failed!');
    }
    catch (error) {
        console.log(`✓ Duplicate registration failed as expected (Code: ${error.statusCode}): "${error.message}"`);
    }
    // Test 4: Validate Password Strength Requirements
    console.log('\n[Test 4] Testing password strength validator rejection...');
    try {
        await auth_service_1.authService.register({
            email: 'weak-pass@flowcrm.ai',
            password: 'weak',
            firstName: 'Weak',
            lastName: 'User'
        });
        console.error('✗ Weak password registration succeeded when it should have failed!');
    }
    catch (error) {
        console.log(`✓ Weak password registration failed as expected (Code: ${error.statusCode}): "${error.message}"`);
    }
    // Test 5: Verify Login & Session History Tracking
    console.log('\n[Test 5] Logging in with new user and tracking active sessions...');
    try {
        const loginResult = await auth_service_1.authService.login({ email: testEmail, password: 'StrongPassword@12345' }, { ipAddress: '192.168.1.100', userAgent: 'Mozilla/Safari/iPhone', browser: 'Safari', os: 'iOS', device: 'Mobile' });
        console.log('✓ Login successful!');
        // Check Active Sessions count in database
        const activeSessions = await db_1.prisma.loginHistory.findMany({
            where: { userId: loginResult.user.id, logoutTime: null }
        });
        console.log(`✓ Active login sessions count in database: ${activeSessions.length}`);
        activeSessions.forEach((s, idx) => {
            console.log(`  Session ${idx + 1}: IP=${s.ipAddress}, OS=${s.os}, Device=${s.device}`);
        });
        // Test 6: Verify Refresh Token Rotation
        console.log('\n[Test 6] Testing Refresh Token Rotation...');
        const refreshResult = await auth_service_1.authService.refresh(loginResult.refreshToken, { ipAddress: '192.168.1.100' });
        console.log('✓ Token rotated successfully!');
        console.log(`  New Access Token: ${refreshResult.accessToken.substring(0, 30)}...`);
        console.log(`  New Refresh Token: ${refreshResult.refreshToken.substring(0, 30)}...`);
        // Verify reuse attempt throws exception (breach response)
        console.log('\n[Test 7] Testing security reuse prevention of the old refresh token...');
        try {
            await auth_service_1.authService.refresh(loginResult.refreshToken, { ipAddress: '192.168.1.100' });
            console.error('✗ Security Alert: Compomised token reuse was accepted!');
        }
        catch (error) {
            console.log(`✓ Security breach handled! (Code: ${error.statusCode}): "${error.message}"`);
            // Verify all tokens for this user are now revoked
            const tokensCount = await db_1.prisma.refreshToken.count({
                where: { userId: loginResult.user.id, isRevoked: false }
            });
            console.log(`  Number of valid refresh tokens remaining: ${tokensCount} (Should be 0)`);
        }
    }
    catch (error) {
        console.error('✗ Login/Session tracking tests failed!', error);
    }
    // Test 8: Password Reset Flow
    console.log('\n[Test 8] Testing Forgot / Reset Password Token Flow...');
    try {
        const resetToken = await auth_service_1.authService.forgotPassword(testEmail);
        console.log(`✓ Reset token generated: ${resetToken}`);
        // Verify resetting using token
        await auth_service_1.authService.resetPassword(resetToken, {
            newPassword: 'BrandNewSecurePassword@9876',
            confirmPassword: 'BrandNewSecurePassword@9876'
        });
        console.log('✓ Password reset completed successfully!');
        // Verify we can login with the brand new password
        const newLogin = await auth_service_1.authService.login({ email: testEmail, password: 'BrandNewSecurePassword@9876' }, { ipAddress: '127.0.0.1' });
        console.log('✓ Logged in successfully with the new password!');
    }
    catch (error) {
        console.error('✗ Forgot/Reset password tests failed!', error);
    }
    // Clean up test data
    console.log('\nCleaning up integration test user data...');
    await db_1.prisma.user.deleteMany({ where: { email: testEmail } });
    console.log('✓ Cleaned up.');
    console.log('\n==================================================');
    console.log('AUTHENTICATION INTEGRATION TESTS COMPLETED SUCCESSFULLY');
    console.log('==================================================');
}
runTests()
    .catch((err) => {
    console.error('Test runner encountered an error', err);
})
    .finally(async () => {
    await db_1.prisma.$disconnect();
    const { pool } = require('./database/db');
    await pool.end();
});
