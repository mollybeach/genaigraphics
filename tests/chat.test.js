// path: webapp/tests/chat.test.js
import { test, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/astro';
import Chat from '../src/components/messages/Chat.astro';
import ChatBar from '../src/components/messages/ChatBar.astro';
import ChatMessages from '../src/components/messages/ChatMessages.astro';
import ChatRecommendationBar from '../src/components/messages/ChatRecommendationBar.astro';
import { $historyMessages, updateMessagesStateEvent, $textAreaValue } from '../src/stores/store';

// Mock the updateMessagesStateEvent function
vi.mock('../src/stores/store', () => ({
  updateMessagesStateEvent: vi.fn(),
  $historyMessages: {
    subscribe: vi.fn(callback => callback([{ sender: 'you', message: 'Hello', image: '', name: '' }])),
  },
  $textAreaValue: {
    subscribe: vi.fn(callback => callback('')),
  },
}));

test('Chat component renders correctly', () => {
  render(<Chat />);
  
  expect(screen.getByText('Virtual Agent')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /Your message/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Send message/i })).toBeInTheDocument();
});

test('ChatBar sends message', async () => {
  render(<ChatBar page="agent" />);
  
  const textarea = screen.getByRole('textbox', { name: /Your message/i });
  const sendButton = screen.getByRole('button', { name: /Send message/i });

  // Simulate typing a message
  fireEvent.change(textarea, { target: { value: 'Test message' } });
  expect(textarea.value).toBe('Test message');

  // Simulate clicking the send button
  fireEvent.click(sendButton);
  expect(updateMessagesStateEvent).toHaveBeenCalledWith('Test message');
});

test('ChatMessages displays messages correctly', async () => {
  render(<ChatMessages />);
  
  // Check if the message from 'you' is displayed
  expect(screen.getByText('Hello')).toBeInTheDocument();
});

test('ChatRecommendationBar displays recommendations and handles clicks', async () => {
  render(<ChatRecommendationBar />);
  
  const recommendationButton = screen.getByRole('button', { name: 'Recommendation' });
  expect(recommendationButton).toBeInTheDocument();
  
  // Simulate clicking a recommendation button
  fireEvent.click(recommendationButton);
  expect($textAreaValue.set).toHaveBeenCalledWith('Recommendation');
});
