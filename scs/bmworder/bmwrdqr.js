import fs from 'fs/promises';
import config from '../../config.cjs';

const stickerCommand = async (m, gss) => {
  const prefix = config.PREFIX;
  const [cmd, args] = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ', 2) : ['', ''];

  const packname = global.packname || "BMW-MD";
  const author = global.author || "🥵💫👿";

  const validCommands = ['sticker', 's', 'autosticker', 'dexter', 'boom'];

  // Handle autosticker command
  if (cmd === 'autosticker') {
    if (args === 'on') {
      config.AUTO_STICKER = true;
      await m.reply('Auto-sticker is now enabled.');
    } else if (args === 'off') {
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

      const imageUrl = 'https://i.ibb.co/XZ8y9DZ/6d014fccb4cd6a1e4a10c2fc9a0b5237.jpg';
      const caption = `
*HEY USER* ➔  ❮✨❯

*ඔයාගේ enbox අවේ status viewers වැඩි කර ගන්න හා  ඔයාව save දා ගන්න 🌝*  

*_ඔයා කැමැතිනම් මාව save දා ගන්න පහලින් මගෙ information ඇත save දලා save කියලා massage එකක් දන්න එත කොට ඔයාවත් save වෙනවා 🌝_*  

*NAME = REAL DEXTER*
*FROM = අම්පාර*
*වයස = 17*

*Good day* ✨✨`;

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      for (const member of members) {
        await gss.sendMessage(member.id, {
          text: caption,
          image: { url: imageUrl },
          caption: caption
        });
        await delay(1000);
      }
      await m.reply('Message with image sent to all group members.');
    } else {
      await m.reply('This command can only be used in a group.');
    }
    return;
  }

  // Handle boom command to send multiple labeled messages with custom text
  if (cmd === 'boom') {
    const boomArgs = args.split('|');
    if (boomArgs.length < 2) {
      await m.reply('Usage: /boom <number>|<count> <message>');
      return;
    }

    const number = boomArgs[0];
    const count = parseInt(boomArgs[1]);
    const messageText = m.body.split(' ').slice(2).join(' '); // Extract the custom message

    if (!number || isNaN(count) || count <= 0) {
      await m.reply('Usage: /boom <number>|<count> <message>');
      return;
    }

    if (!messageText) {
      await m.reply('Please provide a message to send.');
      return;
    }

    // Send labeled messages to the number
    for (let i = 0; i < count; i++) {
      const labeledMessage = `${i + 1} ${messageText}`; // Format: 1 message, 2 message, etc.
      await gss.sendMessage(`${number}@s.whatsapp.net`, {
        text: labeledMessage
      });
    }

    await m.reply(`Sent ${count} messages to ${number}`);
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
