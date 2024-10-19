import fs from 'fs/promises';
import config from '../../config.cjs';

let antideleteEnabled = false; // By default, antidelete is off

const stickerCommand = async (m, gss) => {
  const prefix = config.PREFIX;
  const [cmd, ...args] = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ') : ['', ''];
  const customMessage = args.join(' '); // Combine all arguments into a message

  const imageUrl = 'https://i.ibb.co/XZ8y9DZ/6d014fccb4cd6a1e4a10c2fc9a0b5237.jpg'; // Your image URL

  // Handle dexter command to send a message with an image and custom message
  if (cmd === 'dexter-id') {
    if (m.isGroup) {
      const groupMetadata = await gss.groupMetadata(m.from); // Get group metadata
      const groupName = groupMetadata.subject; // Get the group name
      const defaultMessage = `
*HEY USER* ➔  ❮✨❯

*Group Name:* ${groupName}
*Group එකේ නම:* ${groupName}

*ඔයාගේ enbox අවේ status viewers වැඩි කර ගන්න හා ඔයාව save දා ගන්න 🌝*

*_ඔයා කැමතිනම් මාව save දා ගන්න පහලින් මගෙ information ඇත save දලා save කියලා massage එකක් දන්න එත කොට ඔයාවත් save වෙනවා 🌝_*
*╭────────────⊶*
*│* *ɪ ᴀᴍ  ʀᴇᴀʟ ᴅᴇxᴛᴇʀ*
*╰────────────⊶*

*╭────────────⊶*
*│* ○ *ɴᴀᴍᴇ   │ DEXTER*
*│* ○ *ꜰʀᴏᴍ     │ᴀᴍᴘᴀʀᴀ*
*│* ○ *ᴀɢᴇ     │+17*
*╰─────────────⊶*
*────────────⊶*`;

      // If customMessage is provided, use it; otherwise, use the default message
      const messageToSend = customMessage || defaultMessage;

      // Send the message along with the image as a caption to all group members
      const members = groupMetadata.participants; // List of group members
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)); // Delay function

      // Send message with image to each member
      for (const member of members) {
        await gss.sendMessage(member.id, {
          image: { url: imageUrl }, // Specify the image URL
          caption: messageToSend // Include the message as the caption of the image
        });
        await delay(1000); // Wait for 1 second between messages
      }

      await m.reply('Message with image sent to all group members.');
    } else {
      await m.reply('This command can only be used in a group.');
    }
    return;
  }

  // Other commands can go here

  // Antidelete command to toggle the feature on or off
  if (cmd === 'antidelete') {
    if (args[0] === 'on') {
      antideleteEnabled = true;
      await m.reply('Antidelete feature is now enabled.');
    } else if (args[0] === 'off') {
      antideleteEnabled = false;
      await m.reply('Antidelete feature is now disabled.');
    } else {
      await m.reply('Usage: /antidelete on|off');
    }
    return;
  }

  // Handle deleted messages (monitor the delete event)
  if (m.isDeleted && antideleteEnabled) {
    const originalMessage = m.messageStubParameters; // The deleted message details
    const sender = originalMessage.participant; // The person who deleted the message

    if (originalMessage) {
      const deletedMessage = originalMessage.text || '[Deleted Media]'; // Handle media deletion

      // Resend the deleted message back to the user who deleted it
      await gss.sendMessage(sender, {
        text: `You deleted this message: "${deletedMessage}"`,
      });
    }
  }
};

export default stickerCommand;
