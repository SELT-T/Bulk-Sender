const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const pino = require('pino'); 
const fs = require('fs');

const app = express();
app.use(cors({ origin: '*' })); 

// 🔥 BADI FILES KE LIYE LIMIT BADHAI
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

let sock = null;
let qrCodeBase64 = null;
let waStatus = 'disconnected'; 

async function connectToWhatsApp() {
    if (waStatus === 'scanning' || waStatus === 'connected') return;
    
    waStatus = 'generating';
    console.log("🚀 Starting Lightweight Baileys Engine...");

    try {
        const { version } = await fetchLatestBaileysVersion();
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

// 🟢 🔥 100% PERFECT SENDER & NUMBER VERIFICATION 🔥 🟢
app.post('/api/wa-send', async (req, res) => {
    // Check if socket is actually alive
    if (waStatus !== 'connected' || !sock || !sock.user) {
        return res.status(400).json({ error: "WhatsApp Engine is disconnected. Please scan QR again." });
    }
    
    try {
        const { target, text, isGroup, mediaBase64, mediaType, fileName } = req.body;
        let jid = target.replace(/[^0-9]/g, '');

        // 🛡️ BHEJNE SE PEHLE WHATSAPP PAR NUMBER CHECK KARO
        if (!isGroup) {
            const [waResult] = await sock.onWhatsApp(jid);
            if (!waResult) {
                return res.status(404).json({ error: "Number is not on WhatsApp" });
            }
            jid = waResult.jid; // Meta ka exact ID use karo
        } else {
            // Check if user is sending to a group directly via ID (for Live Fetch feature)
            if (target.includes('@g.us')) {
                jid = target; // Use exactly as passed if it already has @g.us
            } else {
                jid = `${jid}@g.us`;
            }
        }

        let msgPayload = {};

        // Agar File aayi hai toh process karo
        if (mediaBase64) {
            const base64Data = mediaBase64.includes(';base64,') ? mediaBase64.split(';base64,').pop() : mediaBase64;
            const buffer = Buffer.from(base64Data, 'base64');

            if (mediaType && mediaType.startsWith('image/')) {
                msgPayload = { image: buffer, caption: text || '' };
            } else if (mediaType && mediaType.startsWith('video/')) {
                msgPayload = { video: buffer, caption: text || '' };
            } else {
                msgPayload = { document: buffer, mimetype: mediaType || 'application/pdf', fileName: fileName || 'Document', caption: text || '' };
            }
        } else {
            msgPayload = { text: text || '' };
        }

        await sock.sendMessage(jid, msgPayload);
        res.json({ success: true });
    } catch (err) {
        console.log("Send Error:", err);
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// 🟢 NEW ROUTES: LIVE GROUP FETCHING & EXTRACTION
// ==========================================

// 1. Fetch All Active Groups
app.get('/api/wa-get-groups', async (req, res) => {
    try {
        if (waStatus !== 'connected' || !sock || !sock.user) {
            return res.status(400).json({ success: false, error: 'WhatsApp disconnected' });
        }
        
        // Retrieve all chats
        const chats = await sock.groupFetchAllParticipating();
        
        if (!chats || Object.keys(chats).length === 0) {
             return res.json({ success: true, groups: [] });
        }

        const groups = Object.keys(chats).map(key => ({
            id: chats[key].id,
            name: chats[key].subject || 'Unnamed Group'
        }));
        
        res.json({ success: true, groups });
    } catch (error) {
        console.log("Group Fetch Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Extract Members from a specific Group
app.post('/api/wa-get-group-members', async (req, res) => {
    try {
        const { groupId } = req.body;
        if (waStatus !== 'connected' || !sock || !sock.user) {
            return res.status(400).json({ success: false, error: 'WhatsApp disconnected' });
        }
        
        if (!groupId) return res.status(400).json({ success: false, error: 'Group ID is required' });

        const groupMetadata = await sock.groupMetadata(groupId);
        if (!groupMetadata || !groupMetadata.participants) {
            return res.status(404).json({ success: false, error: 'Group data not found. You may not be a participant.' });
        }

        const participants = groupMetadata.participants.map((p, index) => {
            // Convert participant ID (e.g., 919876543210@s.whatsapp.net) to phone number
            const phoneStr = p.id.split('@')[0];
            return {
                id: index + 1,
                name: 'Group Member', // Note: WhatsApp web doesn't send the names of unsaved contacts automatically
                phone: `+${phoneStr}`,
                isAdmin: p.admin === 'admin' || p.admin === 'superadmin'
            };
        });

        res.json({ success: true, members: participants });
    } catch (error) {
        console.log("Group Extract Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { console.log(`🚀 Engine running on port ${PORT}`); });

// Anti-Sleep System
setInterval(() => { fetch("https://reachify-wa-engine.onrender.com").catch(() => {}); }, 8 * 60 * 1000);
