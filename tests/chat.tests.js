// tests/chat.test.js

const puppeteer = require('puppeteer');

describe('GenAiGraphics Chat AI', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('AI responds with the correct answer', async () => {
    await page.goto('http://localhost:3000/agent'); // Replace with your app's URL

    // Simulate user input
    await page.type('#chat-input', 'How do I set up my router?'); // Replace with actual chat input selector
    await page.click('#send-button'); // Replace with actual send button selector

    // Wait for the AI response
    await page.waitForSelector('#chat-response'); // Replace with actual response selector

    // Verify the response
    const response = await page.$eval('#chat-response', el => el.textContent);
    expect(response).toContain('To set up your router, first...'); // Replace with expected response
  });
});
