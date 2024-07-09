//path: server.js
import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {API_PORT} from '../config/config.js';

// Express setup
const app = express();
const port = API_PORT;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
    console.log('Request Body:', req.body);
    console.log('Response:', res);
    next();
});

// Helper function to make POST request to Azure ML API
async function makePostRequest(body) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.PUBLIC_API_BEARER_TOKEN}`
    };

    try {
        return await axios.post(import.meta.env.PUBLIC_API_ENDPOINT, JSON.stringify(body), { headers });
    } catch (error) {
        console.error('Error in makePostRequest:', error);
        throw error;
    }
}
// POST route for Azure ML API
app.post('/api', async (req, res) => {
    try {
        const responseData = await makePostRequest(req.body);
        res.status(200).json(responseData.data);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while making the request.' });
    }
});

// Listening for requests
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);  
});
