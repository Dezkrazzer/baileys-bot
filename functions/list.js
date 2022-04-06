module.exports.commandList = (prefix) => {
  const more = String.fromCharCode(8206);
  const readMore = more.repeat(4001);

  return `*─【 🤖 DEZKRAZZER BOT 🤖 】─*
Some commands may not work due to maintenance
${readMore}
General Commands
📛 *${prefix}help*
    - _Displays a list of available commands_
    Alias: *${prefix}h*, *${prefix}list*

📛 *${prefix}ping*
    - _Check the client's response to the server_  

📛 *${prefix}sticker*
    - _Create sticker from a media_
    Alias: *${prefix}s*

📛 *${prefix}image*
    - _Create image from sticker_
    Alias: *${prefix}toimg*
    
📛 *${prefix}steal*
    - _Stealing watermarks on certain stickers_

📛 *${prefix}text*
    - _Retrieve text on a given image_

📛 *${prefix}gender*
    - _Guess someone's gender from name_

Downloader Commands
📛 *${prefix}ytv url*
    - _Youtube videos downloader!_

📛 *${prefix}yta url*
    - _Youtube audio downloader!_

📛 *${prefix}insta url [⚠]*
    - _Instagram media downloader!_
    
📛 *${prefix}song*
    - _Download the song of the given title_   

Admin Group Commands
📛 *${prefix}add <phone number>*
    - _Add new member!_
    [or reply message of removed member with *${prefix}add*]
    
📛 *${prefix}kick <mention>*
    - _Kick member from group!_
    Alias: *${prefix}ban*, *${prefix}remove*
    [or reply message of member with *${prefix}kick*]

📛 *${prefix}mute | ${prefix}unmute*
    - _Mute and Unmute the group!_

📛 *${prefix}warning*
    - _Give warning to user!_
    Alias: *${prefix}warn*

 ✔️ another cool command is coming soon...`;
};

// 📛 *${prefix}drive query_name*
//     - _Get direct links of files from PVX team drive!_
