const express = require('express');
const cors = require('cors');
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
        const { version, isLatest } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: true,
            browser: Browsers.macOS('Desktop'), 
            syncFullHistory: false, 
            logger: pino({ level: "silent" }) 
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                qrCodeBase64 = await qrcode.toDataURL(qr);
                waStatus = 'scanning';
            }
            
            if (connection === 'close') {
                const statusCode = (lastDisconnect.error)?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    waStatus = 'disconnected';
                    setTimeout(connectToWhatsApp, 2000); 
                } else {
                    waStatus = 'disconnected';
                    qrCodeBase64 = null;
                    if (fs.existsSync('auth_info_baileys')) fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                }
            } else if (connection === 'open') {
                waStatus = 'connected';
                qrCodeBase64 = null;
            }
        });

        sock.ev.on('creds.update', saveCreds);
    } catch (error) {
        waStatus = 'disconnected';
    }
}

connectToWhatsApp();

app.get('/', (req, res) => { res.send("🚀 Reachify Engine Running!"); });

app.get('/api/wa-status', (req, res) => {
    if (waStatus === 'disconnected' || !sock) connectToWhatsApp();
    res.json({ status: waStatus, qr: qrCodeBase64 });
});

app.post('/api/wa-logout', async (req, res) => {
    try {
        if (sock) await sock.logout();
        waStatus = 'disconnected';
        qrCodeBase64 = null;
        if (fs.existsSync('auth_info_baileys')) fs.rmSync('auth_info_baileys', { recursive: true, force: true });
        res.json({ success: true });
    } catch (err) {
        waStatus = 'disconnected';
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/wa-send', async (req, res) => {
    if (waStatus !== 'connected' || !sock) return res.status(400).json({ error: "WhatsApp not connected." });
    try {
        const { target, text, isGroup } = req.body;
        let jid = target.replace(/[^0-9]/g, '');
        jid = isGroup ? `${jid}@g.us` : `${jid}@s.whatsapp.net`;
        await sock.sendMessage(jid, { text: text });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { console.log(`🚀 Engine running on port ${PORT}`); });

// =========================================================
// 🛡️ ANTI-SLEEP SYSTEM (SERVER KO SONE NAHI DEGA)
// =========================================================
const ENGINE_URL = "https://reachify-wa-engine.onrender.com";
setInterval(() => {
    fetch(ENGINE_URL).catch(() => {});
    console.log("💓 Heartbeat sent. Server kept awake.");
}, 8 * 60 * 1000); // Har 8 minute me khud ko ping karega
