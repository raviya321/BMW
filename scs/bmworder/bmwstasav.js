import fs from 'fs';
import config from '../../config.js';

const handleGreeting = async (m, gss) => {
  try {
    const textLower = m.body.toLowerCase();

    const triggerWords = [
      'send', 'දපන්', 'එවන්න', 'දනවා කො', 'දන්න', 'දියන්', 'ඔනි',
      'ඔනෙ', 'ඔනේ', 'oni', 'one', 'dpn', 'dnna', 'dana',  'මේ'
    ];

    if (triggerWords.some(trigger => textLower.includes(trigger))) {
      if (m.message && m.message.extendedTextMessage && m.message.extendedTextMessage.contextInfo) {
        const quotedMessage = m.message.extendedTextMessage.contextInfo.quotedMessage;

        if (quotedMessage) {
          // Process image and video in parallel using Promise.all for faster execution
          const mediaTasks = [];

          // Check if it's an image
          if (quotedMessage.imageMessage) {
            const imageCaption = quotedMessage.imageMessage.caption || '';
            const imageUrl = gss.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
            mediaTasks.push(imageUrl.then(url =>
              gss.sendMessage(m.from, {
                image: { url: url },
                caption: `${imageCaption}\\n\n *ᴅᴇxᴛᴇʀ ᴘʀᴏɢʀᴀᴍᴇʀ*`,
                contextInfo: {
                  mentionedJid: [m.sender], // Mention sender
                  isForwarded: false, // Mark as not forwarded
                },
              })
            ));
          }

          // Check if it's a video
          if (quotedMessage.videoMessage) {
            const videoCaption = quotedMessage.videoMessage.caption || '';
            const videoUrl = gss.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
            mediaTasks.push(videoUrl.then(url =>
              gss.sendMessage(m.from, {
                video: { url: url },
                caption: `${videoCaption}\n\n *ᴅᴇxᴛᴇʀ ᴘʀᴏɢʀᴀᴍᴇʀ* `,
                contextInfo: {
                  mentionedJid: [m.sender], // Mention sender
                  isForwarded: false, // Mark as not forwarded
                },
              })
            ));
          }

          // Execute all media tasks in parallel
          await Promise.all(mediaTasks);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    // Optionally add a retry mechanism or alert message
  }
};

export default handleGreeting;
