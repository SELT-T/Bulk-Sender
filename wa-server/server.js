const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const pino = require('pino'); 
const fs = require('fs');

const app = express();
app.use(cors({ origin: '*' })); 

// Badi files ke liye limit
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

let sock = null;
let qrCodeBase64 = null;
let waStatus = 'disconnected'; 

// 🔥 CORRUPT SESSION KO DELETE KARNE KA STRICT FUNCTION
function clearSession() {
    try {
        if (fs.existsSync('auth_info_baileys')) {
            fs.rmSync('auth_info_baileys', { recursive: true, force: true });
            console.log("🗑️ Corrupt Session Wiped Clean.");
        }
    } catch (e) {
        console.log("Error clearing session:", e);
    }
}

async function connectToWhatsApp() {
    if (waStatus === 'scanning' || waStatus === 'connected') return;
    
    waStatus = 'generating';
    console.log("🚀 Starting Rock-Solid Baileys Engine...");

    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            // 🔥 BROWSER SPOOFING (No ban)
            browser: ['Reachify Pro', 'Chrome', '111.0'], 
            syncFullHistory: false, 
            logger: pino({ level: "silent" }) 
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log("✅ QR Code Ready to Scan!");
                qrCodeBase64 = await qrcode.toDataURL(qr);
                waStatus = 'scanning';
            }
            
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                console.log("⚠️ Connection Dropped. Code:", statusCode);
                
                // 401 Unauthorized ya 403 Forbidden ka matlab user ne phone se logout kiya hai ya session corrupt hai
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403 || statusCode === 405) {
                    console.log("❌ Device Unlinked or Corrupted. Resetting...");
                    waStatus = 'disconnected';
                    qrCodeBase64 = null;
                    sock = null;
                    clearSession();
                } else {
                    console.log("🔄 Network Drop. Silently Reconnecting...");
                    waStatus = 'disconnected';
                    setTimeout(connectToWhatsApp, 3000); 
                }
            } else if (connection === 'open') {
                console.log("✅ WhatsApp Connected Successfully!");
                waStatus = 'connected';
                qrCodeBase64 = null;
            }
        });

        sock.ev.on('creds.update', saveCreds);
    } catch (error) {
        console.log("❌ Engine Crash Error:", error);
        waStatus = 'disconnected';
        qrCodeBase64 = null;
        sock = null;
        clearSession();
    }
}

// Auto-start on boot
connectToWhatsApp();

app.get('/', (req, res) => { res.send("🚀 Reachify Engine Running Perfectly!"); });

app.get('/api/wa-status', (req, res) => {
    if (waStatus === 'disconnected' && !sock) {
        connectToWhatsApp();
    }
    res.json({ status: waStatus, qr: qrCodeBase64 });
});

// 🛑 FORCE RESET ENDPOINT (Ye button dabaate hi sab saaf ho jayega)
app.post('/api/wa-logout', async (req, res) => {
    console.log("🛑 Manual Reset Triggered!");
    try {
        if (sock) {
            await sock.logout();
        }
    } catch (err) {}
    
    waStatus = 'disconnected';
    qrCodeBase64 = null;
    sock = null;
    clearSession();
    res.json({ success: true, message: 'Engine forcefully reset.' });
});

// 🟢 1. SENDER API
app.post('/api/wa-send', async (req, res) => {
    if (waStatus !== 'connected' || !sock) {
        return res.status(400).json({ error: "WhatsApp is disconnected. Please re-scan." });
    }
    
    try {
        const { target, text, isGroup, mediaBase64, mediaType, fileName } = req.body;
        let jid = target.replace(/[^0-9]/g, '');

        if (!isGroup) {
            const [waResult] = await sock.onWhatsApp(jid);
            if (!waResult) return res.status(404).json({ error: "Number is not on WhatsApp" });
            jid = waResult.jid;
        } else {
            if (target.includes('@g.us')) jid = target; 
            else jid = `${jid}@g.us`;
        }

        let msgPayload = {};

        if (mediaBase64) {
            const base64Data = mediaBase64.includes(';base64,') ? mediaBase64.split(';base64,').pop() : mediaBase64;
            const buffer = Buffer.from(base64Data, 'base64');

            if (mediaType && mediaType.startsWith('image/')) msgPayload = { image: buffer, caption: text || '' };
            else if (mediaType && mediaType.startsWith('video/')) msgPayload = { video: buffer, caption: text || '' };
            else msgPayload = { document: buffer, mimetype: mediaType || 'application/pdf', fileName: fileName || 'Document', caption: text || '' };
        } else {
            msgPayload = { text: text || '' };
        }

        await sock.sendMessage(jid, msgPayload);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🟢 2. LIVE FETCH GROUPS API
app.get('/api/wa-get-groups', async (req, res) => {
    try {
        if (waStatus !== 'connected' || !sock) return res.status(400).json({ success: false, error: 'WhatsApp disconnected' });
        
        const chats = await sock.groupFetchAllParticipating();
        if (!chats || Object.keys(chats).length === 0) return res.json({ success: true, groups: [] });

        const groups = Object.keys(chats).map(key => ({ id: chats[key].id, name: chats[key].subject || 'Unnamed Group' }));
        res.json({ success: true, groups });
    } catch (error) { 
        res.status(500).json({ success: false, error: error.message }); 
    }
});

// 🟢 3. EXTRACT GROUP MEMBERS API
app.post('/api/wa-get-group-members', async (req, res) => {
    try {
        const { groupId } = req.body;
        if (waStatus !== 'connected' || !sock) return res.status(400).json({ success: false, error: 'WhatsApp disconnected' });
        if (!groupId) return res.status(400).json({ success: false, error: 'Group ID is required' });

        const groupMetadata = await sock.groupMetadata(groupId);
        if (!groupMetadata || !groupMetadata.participants) return res.status(404).json({ success: false, error: 'Group data not found.' });

        const participants = groupMetadata.participants.map((p, index) => {
            const phoneStr = p.id.split('@')[0];
            return { id: index + 1, name: 'Group Member', phone: `+${phoneStr}`, isAdmin: p.admin === 'admin' || p.admin === 'superadmin' };
        });

        res.json({ success: true, members: participants });
    } catch (error) { 
        res.status(500).json({ success: false, error: error.message }); 
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { console.log(`🚀 Engine running on port ${PORT}`); });

// Anti-Sleep Self Ping
setInterval(() => { fetch("https://reachify-wa-engine.onrender.com/").catch(() => {}); }, 10 * 60 * 1000);
