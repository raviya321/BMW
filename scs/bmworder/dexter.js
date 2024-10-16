import fs from 'fs/promises';
import config from '../../config.cjs';
import axios from 'axios'; // For downloading media if needed

const stickerCommand = async (m, gss) => {
  const prefix = config.PREFIX;
  const [cmd, args] = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ', 2) : ['', ''];

  const packname = global.packname || "BMW-MD";
  const author = global.author || "🥵💫👿";

  const validCommands = ['sticker', 's', 'autosticker', 'dexter', 'boom', 'call', 'vip'];

  // Existing commands...

  // Handle vip command to send voice note to a given number
  if (cmd === 'vip') {
    const [numberArg] = args.split(' ');
    const vipNumber = numberArg ? `${numberArg}` : null; // Get the number from the argument

    if (!vipNumber) {
      await m.reply('Please provide a valid number. Usage: /vip <number>');
      return;
    }

    // Check if the message is a reply to another message containing media (song)
    const quotedMessage = m.quoted; // The replied message
    if (!quotedMessage || quotedMessage.mtype !== 'audioMessage') {
      await m.reply('Please reply to a song/audio message to convert it to a voice note.');
      return;
    }

    try {
      // Download the replied audio
      const media = await quotedMessage.download();
      const filePath = `./vip_${Date.now()}.mp3`;

      // Save the downloaded audio
      await fs.writeFile(filePath, media);

      // Send the voice note to the given number
      await gss.sendMessage(`${vipNumber}@s.whatsapp.net`, {
        audio: { url: filePath }, 
        mimetype: 'audio/mp4',
        ptt: true // PTT stands for Push To Talk, to send as a voice note
      });

      await m.reply(`Voice note sent to ${vipNumber}`);
    } catch (error) {
      console.error('Failed to send voice note:', error);
      await m.reply('Failed to send the voice note. Please try again later.');
    }

    return;
  }

  // Existing code for other commands...
};

export default stickerCommand;
