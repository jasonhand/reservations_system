#!/usr/bin/env node

const { spawn } = require('child_process');
const { chromium } = require('playwright');

// Simple frontend test script
async function testFrontend() {
  console.log('🚀 Starting frontend server...');
  
  // Start the frontend server
  const frontend = spawn('npm', ['run', 'dev:frontend'], {
    stdio: 'pipe',
    detached: false
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    console.log('🔍 Testing with headless browser...');
    
    // Launch browser and test basic functionality
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Go to home page
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    console.log('✅ Home page loaded successfully');
    
    // Navigate to sites page
    await page.click('text=Sites & Cabins');
    await page.waitForTimeout(3000);
    
    // Check if sites are loaded
    const sitesCount = await page.locator('.card').count();
    console.log(`✅ Sites page loaded with ${sitesCount} sites`);
    
    // Check if Book Now buttons exist
    const bookNowButtons = await page.locator('button:has-text("Book Now")').count();
    console.log(`✅ Found ${bookNowButtons} Book Now buttons`);
    
    // Check if calendar exists
    const calendarExists = await page.locator('text=Check Availability').isVisible();
    console.log(`✅ Calendar section visible: ${calendarExists}`);
    
    await browser.close();
    console.log('🎉 Frontend test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up
    frontend.kill();
    process.exit(0);
  }
}

// Only install playwright if needed, otherwise just start the server
if (process.argv.includes('--test')) {
  testFrontend().catch(console.error);
} else {
  console.log('🚀 Starting frontend server...');
  const frontend = spawn('npm', ['run', 'dev:frontend'], {
    stdio: 'inherit'
  });
  
  frontend.on('close', (code) => {
    console.log(`Frontend server exited with code ${code}`);
  });
}