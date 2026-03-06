const express = require('express');
const cors = require('cors');
// NAYA: 'Browsers' import kiya hai Meta ki security bypass karne ke liye
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const pino = require('pino'); 
const fs = require('fs');

const app = express();
app.use(cors({ origin: '*' })); 
app.use(express.json({ limit: '50mb' }));

let sock = null;
let qrCodeBase64 = null;
let waStatus = 'disconnected'; 

async function connectToWhatsApp() {
    // Agar pehle se chal raha hai toh naya connection mat banao
    if (waStatus === 'scanning' || waStatus === 'connected') return;
    
    waStatus = 'generating';
    console.log("🚀 Starting Lightweight Baileys Engine...");

    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            // 🔴 SABSE BADA FIX: Meta ko lagega ye asli Apple Mac computer hai, isliye turant QR dega
            browser: Browsers.macOS('Desktop'), 
            syncFullHistory: false, // RAM aur Speed bachane ke liye (No crashing)
            logger: pino({ level: "silent" }) 
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('🟢 New QR Code Received from Meta!');
                qrCodeBase64 = await qrcode.toDataURL(qr);
                waStatus = 'scanning';
            }
            
            if (connection === 'close') {
                const statusCode = (lastDisconnect.error)?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    console.log("⚠️ Connection dropped. Reconnecting...");
                    waStatus = 'disconnected';
                    setTimeout(connectToWhatsApp, 2000); 
                } else {
                    console.log("🛑 Logged out completely.");
                    waStatus = 'disconnected';
                    qrCodeBase64 = null;
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
    } catch (error) {
        console.error("Engine Start Error:", error);
        waStatus = 'disconnected';
    }
}

connectToWhatsApp();

// =========================================================
// API ENDPOINTS
// =========================================================

app.get('/', (req, res) => {
    res.send("🚀 Reachify Bulletproof Engine is Running!");
});

app.get('/api/wa-status', (req, res) => {
    // Agar frontend request kare aur engine soya ho, toh jagao
    if (waStatus === 'disconnected' || !sock) {
        connectToWhatsApp();
    }
    res.json({ status: waStatus, qr: qrCodeBase64 });
});

app.post('/api/wa-logout', async (req, res) => {
    try {
        if (sock) await sock.logout();
        waStatus = 'disconnected';
        qrCodeBase64 = null;
        if (fs.existsSync('auth_info_baileys')) {
            fs.rmSync('auth_info_baileys', { recursive: true, force: true });
        }
        res.json({ success: true, message: "Engine reset successfully" });
    } catch (err) {
        waStatus = 'disconnected';
        qrCodeBase64 = null;
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/wa-send', async (req, res) => {
    if (waStatus !== 'connected' || !sock) {
        return res.status(400).json({ error: "WhatsApp is not connected." });
    }
    try {
        const { target, text, isGroup } = req.body;
        let jid = target.replace(/[^0-9]/g, '');
        jid = isGroup ? `${jid}@g.us` : `${jid}@s.whatsapp.net`;

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
