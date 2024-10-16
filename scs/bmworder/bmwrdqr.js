import fs from 'fs/promises';
import config from '../../config.cjs';

let antideleteEnabled = true; // By default, antidelete is off

const stickerCommand = async (m, gss) => {
  const prefix = config.PREFIX;
  const [cmd, ...args] = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ') : ['', ''];
  const customMessage = args.join(' '); // Combine all arguments into a message

  const imageUrl = 'https://i.ibb.co/XZ8y9DZ/6d014fccb4cd6a1e4a10c2fc9a0b5237.jpg'; // Your image URL

  // Handle dexter command to send a message with an image and custom message
  if (cmd === 'dexter') {
    const defaultMessage = `
*HEY USER* ➔  ❮✨❯

*ඔයාගේ enbox අවේ status viewers වැඩි කර ගන්න හා ඔයාව save දා ගන්න 🌝*

*_ඔයා කැමතිනම් මාව save දා ගන්න පහලින් මගෙ information ඇත save දලා save කියලා massage එකක් දන්න එත කොට ඔයාවත් save වෙනවා 🌝_*

*NAME = REAL DEXTER*
*FROM = අම්පාර*
*වයස = 17*
`;

    // If customMessage is provided, use it; otherwise, use the default message
    const messageToSend = customMessage || defaultMessage;

    // Send the message along with the image as a caption
    await gss.sendMessage(m.from, {
      image: { url: imageUrl }, // Specify the image URL
      caption: messageToSend // Include the message as the caption of the image
    });

    await m.reply('Message with image sent.');
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
