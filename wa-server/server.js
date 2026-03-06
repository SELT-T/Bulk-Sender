const express = require('express');
const cors = require('cors');
// NAYA FIX: fetchLatestBaileysVersion import kiya hai
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
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
    if (waStatus === 'scanning' || waStatus === 'connected') return;
    
    waStatus = 'generating';
    console.log("🚀 Starting Lightweight Baileys Engine...");

    try {
        // 🔥 SABSE BADA FIX: Ye line WhatsApp ka current version fetch karegi jisse server hang nahi hoga
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`Using WhatsApp v${version.join('.')}, isLatest: ${isLatest}`);

        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            version, // Latest version apply kar diya
            auth: state,
            printQRInTerminal: true,
            browser: Browsers.macOS('Desktop'), // Meta ko lagega ye asli Mac hai
            syncFullHistory: false, // RAM bachane ke liye
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

app.get('/', (req, res) => { res.send("🚀 Reachify Bulletproof Engine is Running!"); });

app.get('/api/wa-status', (req, res) => {
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
app.listen(PORT, () => { console.log(`🚀 Engine running on port ${PORT}`); });
