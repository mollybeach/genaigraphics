// path: webapp/src/data/text/sampleMessageData.js
import {BASE_URL} from '../../../config/config'
export const sampleMessagesData =  [
  {
    "name": "AI Agent",
    "sender": "you",
    "message": "Hello and welcome to Telehero Support. Whether you're seeking guidance on router set up, need technical assistance, or have general inquiries about our services, I'm here to help. How can I assist you today?",
    "image":`${BASE_URL}/images/svg/ai-logo.svg`,
    "timestamp": "10:00"
  }
];

export const sampleMessagesDataLocal = {
  "Hi there! I'm having trouble with my router setup. It doesn't seem to connect to the internet.": {
    "name": "AI Agent",
    "sender": "you",
    "message": "Hello! Let's troubleshoot your router setup together. First, ensure all cables are securely connected. Are the power and internet cables plugged in correctly?",
    "image": `${BASE_URL}/images/svg/ai-logo.svg`,
    "timestamp": "10:00"
  },
  "Hello! I'm interested in learning more about the additional services Telehero offers.":
  {
    "name": "AI Agent",
    "sender": "you",
    "message": "Hello! Thank you for your interest in learning more about the additional phone services Telehero offers. We provide various enhancements to improve your phone communications, such as call recording for quality assurance, advanced call routing options for efficient handling, and integration with leading CRM systems to streamline customer interactions. Would you like more details on any specific phone service or feature?",
    "image": `${BASE_URL}/images/svg/ai-logo.svg`,
    "timestamp": "10:00"
  },
  "I've been experiencing some technical issues with my connection dropping intermittently.":
  {
    "name": "AI Agent",
    "sender": "you",
    "message": "Hello! I'm sorry to hear about the technical issues you're experiencing with your connection. To diagnose the problem, let's start by checking the status of your internet connection. Please verify if the issue occurs on all devices or just a specific device. Additionally, try restarting your modem and router to refresh the connection. Let me know if the issue persists after these steps.",
    "image":`${BASE_URL}/images/svg/ai-logo.svg`,
    "timestamp": "10:00"
  }
};