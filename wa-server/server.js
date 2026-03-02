const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const pino = require('pino'); 
const fs = require('fs');

const app = express();
app.use(cors({ origin: '*' })); 
app.use(express.json({ limit: '50mb' }));

let sock = null;
let qrCodeBase64 = null;
let waStatus = 'disconnected'; // disconnected, generating, scanning, connected

// 🚀 AUTO-WAKEUP FUNCTION (Ye engine ko kabhi marne nahi dega)
async function connectToWhatsApp() {
    // Agar pehle se chal raha hai toh dobara start mat karo
    if (waStatus === 'generating' || waStatus === 'scanning' || waStatus === 'connected') {
        return; 
    }
    
    waStatus = 'generating';
    console.log("🚀 Starting Baileys Engine...");

    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            browser: ["Reachify Pro", "Chrome", "1.0.0"], 
            logger: pino({ level: "silent" }) // Faltu logs band kiye hain
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
                    console.log("⚠️ Connection broken. Reconnecting automatically...");
                    waStatus = 'disconnected';
                    setTimeout(connectToWhatsApp, 2000); 
                } else {
                    console.log("🛑 Logged out completely by user.");
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

// Pehli baar server start hone par chalega
connectToWhatsApp();

// =========================================================
// API ENDPOINTS (Tere Frontend ke liye)
// =========================================================

app.get('/', (req, res) => {
    res.send("🚀 Reachify Immortal Engine is Running!");
});

// 🔴 THE MAGIC ROUTE: Agar server soya hai, toh ye usko jaga dega!
app.get('/api/wa-status', (req, res) => {
    if (waStatus === 'disconnected' || !sock) {
        console.log("🔄 Frontend requested QR, waking up Engine...");
        connectToWhatsApp();
    }
    res.json({ status: waStatus, qr: qrCodeBase64 });
});

app.post('/api/wa-logout', async (req, res) => {
    try {
        if (sock) {
            await sock.logout();
        }
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
