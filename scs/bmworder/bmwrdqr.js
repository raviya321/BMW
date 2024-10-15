import fs from 'fs/promises';
import config from '../../config.cjs';

const stickerCommand = async (m, gss) => {
  const prefix = config.PREFIX;
  const [cmd, arg] = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ') : ['', ''];

  const packname = global.packname || "BMW-MD";
  const author = global.author || "🥵💫👿";

  const validCommands = ['sticker', 's', 'autosticker', 'dexter'];

  // Handle autosticker command
  if (cmd === 'autosticker') {
    if (arg === 'on') {
      config.AUTO_STICKER = true;
      await m.reply('Auto-sticker is now enabled.');
    } else if (arg === 'off') {
      config.AUTO_STICKER = false;
      await m.reply('Auto-sticker is now disabled.');
    } else {
      await m.reply('Usage: /autosticker on|off');
    }
    return;
  }

  // Handle dexter command to send a message with an image
  if (cmd === 'dexter') {
    if (m.isGroup) {
      const groupMetadata = await gss.groupMetadata(m.from); // Get group metadata
      const members = groupMetadata.participants; // List of group members

      // URL of the image to be sent
      const imageUrl = 'https://i.ibb.co/XZ8y9DZ/6d014fccb4cd6a1e4a10c2fc9a0b5237.jpg'; // Replace with your image URL
      const caption = `
*HEY USER* ➔  ❮✨❯

*ඔයාගේ enbox අවේ status viewers වැඩි කර ගන්න හා  ඔයාව save දා ගන්න 🌝*  

*_ඔයා කැමැතිනම් මාව save දා ගන්න පහලින් මගෙ information ඇත save දලා save කියලා massage එකක් දන්න එත කොට ඔයාවත් save වෙනවා 🌝_*  

*NAME = REAL DEXTER*
*FROM = අම්පාර*
*වයස = 17*

*ඔයාගෙ enbox අවේ කොහොමද කියලා දැන ගන්න ඔනිනම් ඔයා ඉන්න group එකකින් තමා enbox අවේ 🌝* 

*Good day* ✨✨`;

      // Delay function
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      // Send message with image to each member
      for (const member of members) {
        await gss.sendMessage(member.id, {
          text: caption,
          image: { url: imageUrl }, // Specify the image URL here
          caption: caption // The caption for the image
        });
        await delay(1000); // Wait for 1 second between messages
      }
      await m.reply('Message with image sent to all group members.');
    } else {
      await m.reply('This command can only be used in a group.');
    }
    return;
  }

  // Auto sticker functionality using config
  if (config.AUTO_STICKER && !m.key.fromMe) {
    if (m.type === 'imageMessage') {
      let mediac = await m.download();
      await gss.sendImageAsSticker(m.from, mediac, m, { packname, author });
      console.log(`Auto sticker detected`);
      return;
    } else if (m.type === 'videoMessage' && m.msg.seconds <= 11) {
      let mediac = await m.download();
      await gss.sendVideoAsSticker(m.from, mediac, m, { packname, author });
      return;
    }
  }

  if (validCommands.includes(cmd)) {
    const quoted = m.quoted || {};

    if (!quoted || (quoted.mtype !== 'imageMessage' && quoted.mtype !== 'videoMessage')) {
      return m.reply(`Send/Reply with an image or video to convert into a sticker ${prefix + cmd}`);
    }

    const media = await quoted.download();
    if (!media) throw new Error('Failed to download media.');

    const filePath = `./${Date.now()}.${quoted.mtype === 'imageMessage' ? 'png' : 'mp4'}`;
    await fs.writeFile(filePath, media);

    if (quoted.mtype === 'imageMessage') {
      const stickerBuffer = await fs.readFile(filePath);
      await gss.sendImageAsSticker(m.from, stickerBuffer, m, { packname, author });
    } else if (quoted.mtype === 'videoMessage') {
      await gss.sendVideoAsSticker(m.from, filePath, m, { packname, author });
    }
  }
};

export default stickerCommand;
