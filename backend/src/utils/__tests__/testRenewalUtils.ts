/**
 * Test script for renewal date calculations
 * Run with: npx ts-node src/utils/__tests__/testRenewalUtils.ts
 */

import { calculateNextRenewalDate, calculateNextFutureRenewalDate } from '../renewalUtils';
import { SubscriptionFrequency } from '@prisma/client';

// Test helper
function testCase(description: string, testFn: () => boolean) {
    try {
        const result = testFn();
        if (result) {
            console.log(`✅ PASS: ${description}`);
            return true;
        } else {
            console.log(`❌ FAIL: ${description}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ERROR: ${description}`, error);
        return false;
    }
}

// Date comparison helper
function datesEqual(date1: Date, date2: Date): boolean {
    return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
}

console.log('🧪 Testing Renewal Date Calculations\n');

let passCount = 0;
let totalCount = 0;

// Test WEEKLY frequency
console.log('📅 Testing WEEKLY frequency:');
totalCount++;
passCount += testCase('Weekly: Jan 15 → Jan 22', () => {
    const current = new Date('2024-01-15');
    const expected = new Date('2024-01-22');
    const result = calculateNextRenewalDate(current, 'WEEKLY');
    return datesEqual(result, expected);
}) ? 1 : 0;

// Test MONTHLY frequency
console.log('\n📅 Testing MONTHLY frequency:');
totalCount++;
passCount += testCase('Monthly: Jan 15 → Feb 15', () => {
    const current = new Date('2024-01-15');
    const expected = new Date('2024-02-15');
    const result = calculateNextRenewalDate(current, 'MONTHLY');
    return datesEqual(result, expected);
}) ? 1 : 0;

totalCount++;
passCount += testCase('Monthly edge case: Jan 31 → Feb 29 (leap year)', () => {
    const current = new Date('2024-01-31');
    const expected = new Date('2024-02-29');
    const result = calculateNextRenewalDate(current, 'MONTHLY');
    return datesEqual(result, expected);
}) ? 1 : 0;

totalCount++;
passCount += testCase('Monthly edge case: Jan 31 → Feb 28 (non-leap year)', () => {
    const current = new Date('2023-01-31');
    const expected = new Date('2023-02-28');
    const result = calculateNextRenewalDate(current, 'MONTHLY');
    return datesEqual(result, expected);
}) ? 1 : 0;

totalCount++;
passCount += testCase('Monthly edge case: May 31 → Jun 30', () => {
    const current = new Date('2024-05-31');
    const expected = new Date('2024-06-30');
    const result = calculateNextRenewalDate(current, 'MONTHLY');
    return datesEqual(result, expected);
}) ? 1 : 0;

// Test QUARTERLY frequency
console.log('\n📅 Testing QUARTERLY frequency:');
totalCount++;
passCount += testCase('Quarterly: Jan 15 → Apr 15', () => {
    const current = new Date('2024-01-15');
    const expected = new Date('2024-04-15');
    const result = calculateNextRenewalDate(current, 'QUARTERLY');
    return datesEqual(result, expected);
}) ? 1 : 0;

totalCount++;
passCount += testCase('Quarterly edge case: Jan 31 → Apr 30', () => {
    const current = new Date('2024-01-31');
    const expected = new Date('2024-04-30');
    const result = calculateNextRenewalDate(current, 'QUARTERLY');
    return datesEqual(result, expected);
}) ? 1 : 0;

// Test YEARLY frequency
console.log('\n📅 Testing YEARLY frequency:');
totalCount++;
passCount += testCase('Yearly: Jan 15 2024 → Jan 15 2025', () => {
    const current = new Date('2024-01-15');
    const expected = new Date('2025-01-15');
    const result = calculateNextRenewalDate(current, 'YEARLY');
    return datesEqual(result, expected);
}) ? 1 : 0;

totalCount++;
passCount += testCase('Yearly leap year: Feb 29 2024 → Feb 28 2025', () => {
    const current = new Date('2024-02-29');
    const expected = new Date('2025-02-28');
    const result = calculateNextRenewalDate(current, 'YEARLY');
    return datesEqual(result, expected);
}) ? 1 : 0;

// Test calculateNextFutureRenewalDate (multiple periods in the past)
console.log('\n📅 Testing Future Renewal Calculation:');
totalCount++;
passCount += testCase('Future renewal: Past date advances to future (MONTHLY)', () => {
    const pastDate = new Date('2024-01-15');
    const result = calculateNextFutureRenewalDate(pastDate, 'MONTHLY');
    const today = new Date();
    return result > today;
}) ? 1 : 0;

totalCount++;
passCount += testCase('Future renewal: Past date advances to future (WEEKLY)', () => {
    const pastDate = new Date('2024-01-01');
    const result = calculateNextFutureRenewalDate(pastDate, 'WEEKLY');
    const today = new Date();
    return result > today;
}) ? 1 : 0;

// Summary
console.log('\n' + '='.repeat(50));
console.log(`📊 Test Results: ${passCount}/${totalCount} passed`);
if (passCount === totalCount) {
    console.log('✅ All tests passed!');
    process.exit(0);
} else {
    console.log(`❌ ${totalCount - passCount} test(s) failed`);
    process.exit(1);
}
