const express = require('express');
const cors = require('cors');
const { AppConfigurationClient } = require("@azure/app-configuration");
const path = require('path');

const app = express();
const API_PORT = 3001; // or your desired port
const appConfigEndpoint = "Endpoint=https://vz-prod-appconfig.azconfig.io;Id=aMah;Secret=gdgUR0rIDKHOKA+cREnaDEAS9WbGsPxOU/XnmWfIwxU=";
const client = new AppConfigurationClient(appConfigEndpoint);

// Serve static files from Astro's build directory
app.use(cors());
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api/getSecret/:key', async (req, res) => {
    try {
        const key = req.params.key;
        console.log(key)
        const setting = await client.getConfigurationSetting({ key });
        res.json({ value: setting.value });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch secret" });
    }
});

app.listen(API_PORT, () => {
    console.log(`Server running at http://localhost:${API_PORT}/`);
});
