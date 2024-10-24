const { cmd } = require('../command')
const fs = require('fs');
const path = require('path');
const {readEnv} = require('../lib/database')
const config = require('../config')
// List of bad words to check against
 // Replace with actual words
cmd({
  on: "body"
},
async (conn,mek, m, { from, body, isGroup, isAdmins, isBotAdmins, reply, sender }) => {
    try {
        const config = await readEnv();
        const badWords = ["wtf", "mia", "xxx","fuck","sex","huththa","pakaya","ponnaya","hutto"]
        if (!isGroup || isAdmins || !isBotAdmins) return; // Skip if not in group, or sender is admin, or bot is not admin
      
        const lowerCaseMessage = body.toLowerCase();
        const containsBadWord = badWords.some(word => lowerCaseMessage.includes(word));
        
        if (containsBadWord & config.ANTI_BAD_WORD === 'true') {
          await conn.sendMessage(from, { delete: mek.key }, { quoted: mek });
          await conn.sendMessage(from, { text: "🚫 ⚠️BAD WORDS NOT ALLOWED⚠️ 🚫" }, { quoted: mek });
        }
    } catch (error) {
        console.error(error)
        reply("An error occurred while processing the message.")
    }
})
// Regular expression to detect WhatsApp links
const whatsappLinkPattern = /https?:\/\/(chat\.whatsapp\.com|wa\.me)\/\S+/gi;
cmd({
  on: "body"
},
async (conn, mek, m, { from, body, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        const config = await readEnv();
        if (!isGroup || isAdmins || !isBotAdmins) return; // Skip if not in group, or sender is admin, or bot is not admin
        if (whatsappLinkPattern.test(body) & config.ANTI_LINK === 'true') {
                  await conn.sendMessage(from, { delete: mek.key }, { quoted: mek });
                  await conn.sendMessage(from, { text: "⚠️ LINK NOT ALLOWED IN THIS GROUP 🚫" }, { quoted: mek }); 
        }
    }catch (error) {
        console.error(error)
        reply("An error occurred while processing the message.")
    }
});

cmd({ on: ["delete", "delete-many"] }, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
  try {
    const config = await readEnv();

    if (config.ANTI_DELETE === 'true') {
      if (isGroup) {
        // Group delete detection
        if (!isAdmins || isBotAdmins) {
          await conn.sendMessage(from, { text: "DETECTED! Someone deleted a message." }, { quoted: mek });
          await conn.sendMessage(config.LOG_GROUP, { text: `Delete detected by @${from.split('@')[0]} in ${from}.` });
        }
      } else {
        // Inbox delete detection
        await conn.sendMessage(from, { text: "DETECTED! Someone deleted a message." });
        await conn.sendMessage(config.LOG_GROUP, { text: `Delete detected in inbox by @${from.split('@')[0]}.` });
      }
    }
  } catch (error) {
    console.error(error)
    reply("An error occurred while processing the message.")
  }
});