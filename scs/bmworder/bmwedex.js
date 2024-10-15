import fs from 'fs/promises';
import config from '../../config.cjs';

const stickerCommand = async (m, gss) => {
  const prefix = config.PREFIX;
  const [cmd, arg] = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ') : ['', ''];

  const packname = global.packname || "BMW-MD";
  const author = global.author || "🥵💫👿";

  const validCommands = ['sticker', 's', 'autosticker', 'dexter-vcf'];

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

  // Handle dexter-vcf command to create a VCF file for group members
  if (cmd === 'dexter-vcf') {
    if (m.isGroup) {
      const groupMetadata = await gss.groupMetadata(m.from); // Get group metadata
      const members = groupMetadata.participants; // List of group members

      // Create VCF content
      let vcfContent = '';
      for (const member of members) {
        const profileName = member.notify || member.id.split('@')[0]; // Get the display name or fallback to the ID
        const phoneNumber = member.id.replace('@c.us', ''); // Format the number without the WhatsApp suffix
        const formattedPhoneNumber = `${phoneNumber}@s.whatsapp.net`; // Format as required for VCF

        vcfContent += `BEGIN:VCARD\n`;
        vcfContent += `VERSION:3.0\n`;
        vcfContent += `FN:${profileName}\n`; // Full name set to profile name
        vcfContent += `TEL;TYPE=CELL:${formattedPhoneNumber}\n`; // Phone number formatted
        vcfContent += `END:VCARD\n\n`;
      }

      // Save VCF content to a file
      const vcfFilePath = `./group_contacts.vcf`;
      await fs.writeFile(vcfFilePath, vcfContent);

      // Send VCF file back to the group
      await gss.sendMessage(m.from, {
        document: { url: vcfFilePath },
        mimetype: 'text/vcard',
        caption: 'Here are the contacts of the group members.',
      });

      // Inform the user
      await m.reply('VCF file created and sent to the group.');
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

  // Sticker commands handling
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
