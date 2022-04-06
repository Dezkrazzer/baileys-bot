module.exports.commandListOwner = (prefix) => {
  const more = String.fromCharCode(8206);
  const readMore = more.repeat(4001);

  return `*─【 🤖 DEZKRAZZER BOT 🤖 】─*
  ${readMore}
  _Restricted command for owner only!_  

  📛 *${prefix}delete*
  - _Delete messages sent by bots_`;
};
