const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
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

// 🔥 Asli fix "Couldn't link device" ke liye (Kachra saaf karna)
function clearSession() {
    try {
        if (fs.existsSync('auth_info_baileys')) {
            fs.rmSync('auth_info_baileys', { recursive: true, force: true });
            console.log("🗑️ Session Wiped Clean.");
        }
    } catch (e) {}
}

async function connectToWhatsApp() {
    if (waStatus === 'scanning' || waStatus === 'connected') return;
    
    waStatus = 'generating';
    console.log("🚀 Starting Fast Original Engine...");

    try {
        // Wapas purana fast system
        const { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: true,
            browser: Browsers.macOS('Desktop'), // Original fast browser
            syncFullHistory: false, 
            logger: pino({ level: "silent" }) 
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log("✅ QR Code Ready!");
                qrCodeBase64 = await qrcode.toDataURL(qr);
                waStatus = 'scanning';
            }
            
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                console.log("⚠️ Connection Dropped. Code:", statusCode);
                
                // Agar sach me logout hua hai tabhi session delete karo
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
                    console.log("❌ Logged out. Resetting...");
                    waStatus = 'disconnected';
                    qrCodeBase64 = null;
                    sock = null;
                    clearSession();
                } else {
                    // Agar background me drop hua toh chupchap reconnect karo
                    console.log("🔄 Background Drop. Silently Reconnecting...");
                    waStatus = 'disconnected';
                    setTimeout(connectToWhatsApp, 2000); 
                }
            } else if (connection === 'open') {
                console.log("✅ WhatsApp Connected & Locked in!");
                waStatus = 'connected';
                qrCodeBase64 = null;
            }
        });

        sock.ev.on('creds.update', saveCreds);
    } catch (error) {
        console.log("❌ Engine Crash:", error);
        waStatus = 'disconnected';
        qrCodeBase64 = null;
        sock = null;
        clearSession();
    }
}

connectToWhatsApp();

app.get('/', (req, res) => { res.send("🚀 Reachify Engine Running!"); });

app.get('/api/wa-status', (req, res) => {
    if (waStatus === 'disconnected' && !sock) connectToWhatsApp();
    res.json({ status: waStatus, qr: qrCodeBase64 });
});

// 🛑 FORCE RESET ENDPOINT (Ye button dabaate hi sab thik hoga)
app.post('/api/wa-logout', async (req, res) => {
    try {
        if (sock) await sock.logout();
    } catch (err) {}
    waStatus = 'disconnected';
    qrCodeBase64 = null;
    sock = null;
    clearSession();
    res.json({ success: true });
});

// 🟢 1. SENDER API
app.post('/api/wa-send', async (req, res) => {
    if (waStatus !== 'connected' || !sock) return res.status(400).json({ error: "WhatsApp disconnected." });
    
    try {
        const { target, text, isGroup, mediaBase64, mediaType, fileName } = req.body;
        let jid = target.replace(/[^0-9]/g, '');

        if (!isGroup) {
            const [waResult] = await sock.onWhatsApp(jid);
            if (!waResult) return res.status(404).json({ error: "Not on WhatsApp" });
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
            else msgPayload = { document: buffer, mimetype: mediaType || 'application/pdf', fileName: fileName || 'Doc', caption: text || '' };
        } else {
            msgPayload = { text: text || '' };
        }

        await sock.sendMessage(jid, msgPayload);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 🟢 2. LIVE FETCH GROUPS API
app.get('/api/wa-get-groups', async (req, res) => {
    try {
        if (waStatus !== 'connected' || !sock) return res.status(400).json({ success: false, error: 'Disconnected' });
        const chats = await sock.groupFetchAllParticipating();
        if (!chats) return res.json({ success: true, groups: [] });
        const groups = Object.keys(chats).map(k => ({ id: chats[k].id, name: chats[k].subject || 'Group' }));
        res.json({ success: true, groups });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// 🟢 3. EXTRACT GROUP MEMBERS API (100% REAL NUMBERS FIX)
app.post('/api/wa-get-group-members', async (req, res) => {
    try {
        const { groupId } = req.body;
        if (waStatus !== 'connected' || !sock) return res.status(400).json({ success: false, error: 'Disconnected' });
        if (!groupId) return res.status(400).json({ success: false, error: 'Group ID needed' });

        const groupMetadata = await sock.groupMetadata(groupId);
        if (!groupMetadata || !groupMetadata.participants) return res.status(404).json({ success: false, error: 'No data.' });

        const participants = groupMetadata.participants.map((p, index) => {
            const rawId = p.id || '';
            let finalPhone = '';

            // ✅ Agar WhatsApp ne ASLI Number bheja hai
            if (rawId.includes('@s.whatsapp.net')) {
                finalPhone = `+${rawId.split('@')[0]}`;
            } 
            // 🔴 Agar WhatsApp ne Security ki wajah se number hide kiya hai (LID)
            else if (rawId.includes('@lid')) {
                finalPhone = '🔒 Hidden by WA API (Use Paste Text Method)';
            } 
            else {
                finalPhone = rawId;
            }

            return { 
                id: index + 1, 
                name: 'Group Member', 
                phone: finalPhone, 
                isAdmin: p.admin === 'admin' || p.admin === 'superadmin' 
            };
        });

        res.json({ success: true, members: participants });
    } catch (error) { 
        res.status(500).json({ success: false, error: error.message }); 
    }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { console.log(`🚀 Engine running on port ${PORT}`); });

setInterval(() => { fetch("https://reachify-wa-engine.onrender.com/").catch(() => {}); }, 10 * 60 * 1000);
