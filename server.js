//Server.js
import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3001;

const API_ENDPOINT = import.meta.env.PUBLIC_API_ENDPOINT;
const API_BEARER_TOKEN = import.meta.env.PUBLIC_API_BEARER_TOKEN;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
    console.log('Request Body:', req.body);
    next();
});

async function makePostRequest(body) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_BEARER_TOKEN}`
    };

    try {
        return await axios.post(API_ENDPOINT, JSON.stringify(body), { headers });
    } catch (error) {
        console.error('Error in makePostRequest:', error);
        throw error;
    }
}

app.post('/api', async (req, res) => {
    try {
        const responseData = await makePostRequest(req.body);
        res.status(200).json(responseData.data);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while making the request.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
