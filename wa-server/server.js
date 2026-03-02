const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const pino = require('pino'); 
const fs = require('fs');

const app = express();
app.use(cors({ origin: '*' })); 
app.use(express.json({ limit: '50mb' }));

let sock;
let qrCodeBase64 = null;
let waStatus = 'disconnected'; 

// 🚀 NAYA LIGHTWEIGHT ENGINE (Bina Chrome ke chalega)
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ["Reachify Pro", "Chrome", "1.0.0"], // Meta ko lagega chrome hai, par nahi hai!
        logger: pino({ level: "silent" }) // Faltu logs band
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('🟢 New QR Code Generated!');
            qrCodeBase64 = await qrcode.toDataURL(qr);
            waStatus = 'scanning';
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                connectToWhatsApp(); // Agar net tute toh apne aap judega
            } else {
                waStatus = 'disconnected';
                qrCodeBase64 = null;
                // Session delete
                if (fs.existsSync('auth_info_baileys')) {
                    fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                }
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp Linked Successfully!');
            waStatus = 'connected';
            qrCodeBase64 = null;
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// Start Engine
connectToWhatsApp();

// =========================================================
// API ENDPOINTS (Tere Frontend ke liye)
// =========================================================

app.get('/', (req, res) => {
    res.send("🚀 Reachify Light Engine is Running!");
});

app.get('/api/wa-status', (req, res) => {
    res.json({ status: waStatus, qr: qrCodeBase64 });
});

app.post('/api/wa-logout', async (req, res) => {
    try {
        await sock.logout();
        waStatus = 'disconnected';
        qrCodeBase64 = null;
        res.json({ success: true, message: "Logged out" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/wa-send', async (req, res) => {
    if (waStatus !== 'connected') {
        return res.status(400).json({ error: "WhatsApp is not connected." });
    }

    try {
        const { target, text, isGroup } = req.body;
        
        // Format Phone Number for Baileys
        let jid = target.replace(/[^0-9]/g, '');
        jid = isGroup ? `${jid}@g.us` : `${jid}@s.whatsapp.net`;

        // Send Text Message
        await sock.sendMessage(jid, { text: text });
        res.json({ success: true, message: "Message sent successfully!" });

    } catch (err) {
        console.error("Send Error:", err);
        res.status(500).json({ error: "Failed to send message: " + err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Reachify Light Engine running on port ${PORT}`);
});
