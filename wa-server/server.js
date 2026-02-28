const express = require('express');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
app.use(cors({ origin: '*' })); 
app.use(express.json({ limit: '50mb' })); // Badi images handle karne ke liye

let qrCodeBase64 = null;
let waStatus = 'disconnected'; 

// Initialize WhatsApp Web Engine (Optimized for Free Servers like Render)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true, 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process' // Saves RAM on free servers
        ] 
    }
});

// 1. QR Code Event
client.on('qr', async (qr) => {
    console.log('QR Code Received! Generating Base64...');
    qrCodeBase64 = await qrcode.toDataURL(qr); 
    waStatus = 'scanning';
});

// 2. Ready Event
client.on('ready', () => {
    console.log('✅ WhatsApp Client is Ready and Connected!');
    qrCodeBase64 = null;
    waStatus = 'connected';
});

// 3. Disconnect Event
client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Disconnected', reason);
    waStatus = 'disconnected';
    qrCodeBase64 = null;
});

// 4. Auth Failure Event
client.on('auth_failure', msg => {
    console.error('⚠️ AUTHENTICATION FAILURE', msg);
    waStatus = 'disconnected';
    qrCodeBase64 = null;
});

client.initialize();

// Utility function for delay (Anti-Ban)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// =========================================================
// API ENDPOINTS (Cloudflare Worker inko call karega)
// =========================================================

// Health Check
app.get('/', (req, res) => {
    res.send("🚀 Reachify WhatsApp Node Engine is Running 24/7!");
});

// Get QR Code or Status
app.get('/api/wa-status', (req, res) => {
    res.json({ status: waStatus, qr: qrCodeBase64 });
});

// Logout User
app.post('/api/wa-logout', async (req, res) => {
    try {
        await client.logout();
        waStatus = 'disconnected';
        qrCodeBase64 = null;
        res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// SEND MESSAGE ROUTE (Text & Image)
app.post('/api/wa-send', async (req, res) => {
    if (waStatus !== 'connected') {
        return res.status(400).json({ error: "WhatsApp is not connected. Please scan QR first." });
    }

    try {
        const { target, text, media, isGroup, antiBan } = req.body;
        
        // Format Phone Number for WhatsApp (e.g. 919876543210@c.us)
        let chatId = target.replace(/[^0-9]/g, '');
        chatId = isGroup ? `${chatId}@g.us` : `${chatId}@c.us`;

        // ANTI-BAN: Simulate Typing Status
        if (antiBan && antiBan.typing) {
            const chat = await client.getChatById(chatId);
            await chat.sendStateTyping();
            
            // Calculate typing time based on message length (Min 1 sec, Max 4 secs)
            const typingTime = Math.min(Math.max((text || "").length * 50, 1000), 4000);
            await sleep(typingTime);
            
            await chat.clearState();
        }

        // Send Message
        if (media) {
            // Media message (Photo/Video)
            const base64Data = media.includes(',') ? media.split(',')[1] : media;
            const mediaObj = new MessageMedia('image/png', base64Data);
            await client.sendMessage(chatId, mediaObj, { caption: text });
        } else {
            // Text message
            await client.sendMessage(chatId, text);
        }

        // Return success immediately. 
        // Note: The actual "Delay between messages" is handled by Cloudflare so this server doesn't timeout.
        res.json({ success: true, message: "Message sent successfully!" });

    } catch (err) {
        console.error("Send Error:", err);
        res.status(500).json({ error: "Failed to send message: " + err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Reachify WhatsApp Engine running on port ${PORT}`);
});
