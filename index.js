/* --------------------------------- SERVER --------------------------------- */
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 8000;
app.get("/", (req, res) => {
  res.send("The client is running normally");
});
app.listen(port, () => {
  // console.clear();
  console.log("\nWeb-server running!\n");
});

/* ---------------------------------- SONG ---------------------------------- */
const downloadSong = async (randomName, query) => {
  try {
    const INFO_URL = "https://slider.kz/vk_auth.php?q=";
    const DOWNLOAD_URL = "https://slider.kz/download/";
    let { data } = await axios.get(INFO_URL + query);

    if (data["audios"][""].length <= 1) {
      console.log("==[ SONG NOT FOUND! ]==");
      return "NOT";
    }

    //avoid remix,revisited,mix
    let i = 0;
    let track = data["audios"][""][i];
    while (/remix|revisited|mix/i.test(track.tit_art)) {
      i += 1;
      track = data["audios"][""][i];
    }
    //if reach the end then select the first song
    if (!track) {
      track = data["audios"][""][0];
    }

    let link = DOWNLOAD_URL + track.id + "/";
    link = link + track.duration + "/";
    link = link + track.url + "/";
    link = link + track.tit_art + ".mp3" + "?extra=";
    link = link + track.extra;
    link = encodeURI(link); //to replace unescaped characters from link

    let songName = track.tit_art;
    songName =
      songName =
      songName =
        songName.replace(/\?|<|>|\*|"|:|\||\/|\\/g, ""); //removing special characters which are not allowed in file name
    // console.log(link);
    // download(songName, link);
    const res = await axios({
      method: "GET",
      url: link,
      responseType: "stream",
    });
    data = res.data;
    const path = `./${randomName}`;
    const writer = fs.createWriteStream(path);
    data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(songName));
      writer.on("error", () => reject);
    });
  } catch (err) {
    console.log(err);
    return "ERROR";
  }
};

/* ------------------------------------ INSTA -----------------------------------  */
const saveInstaVideo = async (randomName, videoDirectLink) => {
  const response = await axios({
    url: videoDirectLink,
    method: "GET",
    responseType: "stream",
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
      "cache-control": "max-age=0",
      "sec-ch-ua":
        '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
      "sec-ch-ua-mobile": "?1",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
  });

  const path = `./${randomName}`;
  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

/* ------------------------------------ Baiileys ----------------------------------- */
const {
  WAConnection,
  MessageType,
  Presence,
  Mimetype,
  GroupSettingChange,
  MessageOptions,
  WALocationMessage,
  WA_MESSAGE_STUB_TYPES,
  ReconnectMode,
  ProxyAgent,
  waChatKey,
  mentionedJid,
  processTime,
} = require("@adiwajshing/baileys");

// LOAD ADDITIONAL NPM PACKAGES
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const WSF = require("wa-sticker-formatter");
const Tesseract = require("tesseract.js");
const axios = require("axios");

//importing function files
const { getCricketScore } = require("./functions/cricket");
const { getScoreCard } = require("./functions/cricketScoreCard");
const { button } = require("./functions/button");
const { commandList } = require("./functions/list");
const { commandListOwner } = require("./functions/listOwner");
const { countToday, getcount } = require("./DB/countDB");
const {
  addBlacklist,
  removeBlacklist,
  getBlacklist,
} = require("./DB/blacklistDB");
const { addDonation, getDonation } = require("./DB/donationDB");
const {
  setCountMember,
  getCountGroups,
  getCountGroupMembers,
  getCountIndividual,
  getCountIndividualAllGroup,
  getCountIndividualAllGroupWithName,
  getCountTop,
} = require("./DB/countMemberDB");
const { dropAuth } = require("./DB/dropauthDB");
const { setCountWarning, getCountWarning } = require("./DB/warningDB");
const { storeNewsTech } = require("./DB/postTechDB");
const { storeNewsStudy } = require("./DB/postStudyDB");
const { storeNewsSport } = require("./DB/postSportDB");
const { storeNewsMovie } = require("./DB/postMovieDB");
const { setCountVideo, getCountVideo } = require("./DB/countVideoDB");
const { getNews } = require("./functions/news");
const { getInstaVideo } = require("./functions/insta");
const { getFbVideo } = require("./functions/fb");
const { getGender } = require("./functions/gender");
const { getQuote } = require("./functions/quote");
const { takeGroupbackup } = require("./DB/backupDB");
const {
  getVotingData,
  setVotingData,
  stopVotingData,
} = require("./DB/VotingDB");
const {
  getVotingAllData,
  setVotingAllData,
  stopVotingAllData,
} = require("./DB/votingAllDB");
const { setGroupName } = require("./DB/groupNameDB");

let Parser = require("rss-parser");
let parser = new Parser();

const ytdl = require("ytdl-core");
const AdmZip = require("adm-zip");
const { replicationStart } = require("pg-protocol/dist/messages");
let stickertg = false;
let setIntervaltg;

// BASIC SETTINGS
prefix = "!";
require("dotenv").config();
const myNumber = "6282337130026";
const pvx = process.env.pvx;
const zeksapi = "W59BFCtwydp2TPJJv0D0UIICzwS";

//CRICKET variables
let matchIdGroups = {}; //to store every group name with its match ID
let cricSetIntervalGroups = {}; //to store every group name with its setInterval value so that it can be stopped
let cricStartedGroups = {}; //to store every group name with boolean value to know if cricket score is already started or not

// LOAD CUSTOM FUNCTIONS
const getGroupAdmins = (participants) => {
  admins = [];
  for (let i of participants) {
    i.isAdmin ? admins.push(i.jid) : "";
  }
  return admins;
};

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

const getRandom = (text) => {
  return `${Math.floor(Math.random() * 10000)}${text}`;
};

let pvxcommunity = "919557666582-1467533860@g.us";
let pvxprogrammer = "919557666582-1584193120@g.us";
let pvxadmin = "919557666582-1498394056@g.us";
let pvxstudy = "919557666582-1617595892@g.us";
let pvxmano = "19016677357-1630334490@g.us";
let pvxtech = "919557666582-1551290369@g.us";
let pvxsport = "919557666582-1559476348@g.us";
let pvxmovies = "919557666582-1506690003@g.us";

/* ------------------------------ MAIN FUNCTION ----------------------------- */
const main = async () => {
  const { connectToWA } = require("./DB/authDB");
  const conn = await connectToWA(WAConnection);
  let botNumberJid = conn.user.jid;

  /* -------------------------------- BIRTHDAY -------------------------------- */
  let usedDate = new Date()
    .toLocaleString("en-GB", { timeZone: "Asia/kolkata" })
    .split(",")[0];

  const checkTodayBday = async (todayDate) => {
    console.log("CHECKING TODAY BDAY...", todayDate);
    todayDate = todayDate.split("/");
    let d = todayDate[0];
    d = d.startsWith("0") ? d[1] : d;
    let m = todayDate[1];
    m = m.startsWith("0") ? m[1] : m;
    let url = "https://pvxgroup.herokuapp.com/api/bday";
    let { data } = await axios.get(url);
    let bday = [];

    data.data.forEach((member) => {
      if (member.month == m && member.date == d) {
        bday.push(
          `${member.name.toUpperCase()} (${member.username.toUpperCase()})`
        );
        console.log(`Today is ${member.name} Birthday!`);
      }
    });
    if (bday.length) {
      let bdayComb = bday.join(" & ");
      conn.sendMessage(
        pvxcommunity,
        `*─【 🤖 DEZKRAZZER BOT 🤖 】─* \n\nToday is ${bdayComb} Birthday 🍰 🎉🎉`,
        MessageType.text
      );
    } else {
      console.log("NO BIRTHDAY!");
      conn.sendMessage(
        pvxcommunity,
        `*─【 🤖 DEZKRAZZER BOT 🤖 】─* \n\nThere is no Birthday today!`,
        MessageType.text
      );
    }
    try {
      await conn.groupUpdateSubject(pvxcommunity, "DEZKRAZZER ❤️");
    } catch (err) {
      console.log(err);
    }
  };

  const postTechNews = async (count) => {
    if (count > 20) {
      //20 times already posted news came
      return;
    }
    console.log(`TECH NEWS FUNCTION ${count} times!`);

    let url = "https://news-pvx.herokuapp.com/";
    let { data } = await axios.get(url);
    delete data.about;

    let newsWeb = [
      "gadgets-ndtv",
      "gadgets-now",
      "xda-developers",
      "inshorts",
      "beebom",
      "india",
      "mobile-reuters",
      "techcrunch",
      "engadget",
    ];

    let randomWeb = newsWeb[Math.floor(Math.random() * newsWeb.length)]; //random website
    let index = Math.floor(Math.random() * data[randomWeb].length);

    let news = data[randomWeb][index];
    let techRes = await storeNewsTech(news);
    if (techRes) {
      console.log("NEW TECH NEWS!");
      conn.sendMessage(pvxtech, `📰 ${news}`, MessageType.text);
    } else {
      console.log("OLD TECH NEWS!");
      postTechNews(count + 1);
    }
  };

  const postStudyInfo = async (count) => {
    if (count > 20) {
      //20 times already posted news came
      return;
    }
    console.log(`STUDY NEWS FUNCTION ${count} times!`);
    let feed;
    // let random = Math.floor(Math.random() * 2);
    feed = await parser.parseURL(
      "https://www.thehindu.com/news/national/feeder/default.rss"
    );

    let li = feed.items.map((item) => {
      return { title: item.title, link: item.link };
    });

    let index = Math.floor(Math.random() * li.length);

    let news = li[index];

    let techRes = await storeNewsStudy(news.title);
    if (techRes) {
      console.log("NEW STUDY NEWS!");
      conn.sendMessage(pvxstudy, `📰 ${news.title}`, MessageType.text, {
        detectLinks: false,
      });
    } else {
      console.log("OLD STUDY NEWS!");
      postStudyInfo(count + 1);
    }
  };

  if (pvx) {
    setInterval(() => {
      console.log("SET INTERVAL.");
      let todayDate = new Date().toLocaleDateString("en-GB", {
        timeZone: "Asia/kolkata",
      });

      let hour = Number(
        new Date()
          .toLocaleTimeString("en-GB", {
            timeZone: "Asia/kolkata",
          })
          .split(":")[0]
      );
      //8 to 24 ON
      if (hour >= 8) {
        postTechNews(0);
        postStudyInfo(0);
      }

      if (usedDate !== todayDate) {
        usedDate = todayDate;
        checkTodayBday(todayDate);
      }
    }, 1000 * 60 * 20); //20 min
  }

  // member left or join
  conn.on("group-participants-update", async (anu) => {
    try {
      const groupMetadata = await conn.groupMetadata(anu.jid);
      let groupDesc = groupMetadata.desc;
      let groupSubject = groupMetadata.subject;
      let blockCommandsInDesc = []; //commands to be blocked
      if (groupDesc) {
        let firstLineDesc = groupDesc.split("\n")[0];
        blockCommandsInDesc = firstLineDesc.split(",");
      }
      let blacklistRes = await getBlacklist();
      blacklistRes = blacklistRes.map((num) => num.number);
      // console.log(blacklistRes);

      let from = anu.jid;
      let numJid = anu.participants[0];
      let num_split = `${numJid.split("@s.whatsapp.net")[0]}`;

      if (anu.action == "add") {
        // other than 91 are blocked from joining when description have written in first line -> only91
        if (
          !num_split.startsWith(91) &&
          blockCommandsInDesc.includes("only91")
        ) {
          conn.sendMessage(
            from,
            `*─【 🤖 DEZKRAZZER BOT 🤖 】─* \n\nOnly 91 numbers are allowed !!!!`,
            MessageType.text
          );
          conn.groupRemove(from, anu.participants);
          conn.sendMessage(
            myNumber + "@s.whatsapp.net",
            `${num_split} is removed from ${groupSubject}. Not 91!`,
            MessageType.text
          );
          return;
        }

        //if number is blacklisted
        if (blacklistRes.includes(num_split)) {
          conn.sendMessage(
            from,
            `*─【 🤖 DEZKRAZZER BOT 🤖 】─* \n\nNumber is blacklisted !!!!`,
            MessageType.text
          );
          conn.groupRemove(from, anu.participants);
          conn.sendMessage(
            myNumber + "@s.whatsapp.net",
            `${num_split} is removed from ${groupSubject}. Blacklisted!`,
            MessageType.text
          );
          return;
        }

        //for study group
        if (from === pvxstudy) {
          conn.sendMessage(
            from,
            `Welcome @${num_split} to PVX Study group.\nhttps://pvxcommunity.com/\n\nKindly fill the Biodata form (mandatory for all)\n\n👇🏻👇🏻👇🏻👇🏻👇🏻\nhttps://forms.gle/uuvUwV5fTk8JAjoTA`,
            MessageType.extendedText,
            {
              contextInfo: { mentionedJid: [numJid] },
              detectLinks: false,
            }
          );
        }

        //for movies group
        if (from === pvxmovies) {
          conn.sendMessage(
            from,
            `Welcome @${num_split} to PVX Movies.\nhttps://pvxcommunity.com/\n\nWhat are your currently watching..?`,
            MessageType.extendedText,
            {
              contextInfo: { mentionedJid: [numJid] },
              detectLinks: false,
            }
          );
        }

        //for community group
        if (from === pvxcommunity) {
          conn.sendMessage(
            from,
            `Welcome @${num_split} to PVX COMMUNITY.\nhttps://pvxcommunity.com/\n\nPlease follow the rules. Send ${prefix}rules to know all rules of PVX\nBe active and Don't spam`,
            MessageType.extendedText,
            {
              contextInfo: { mentionedJid: [numJid] },
              detectLinks: false,
            }
          );
        }

        //for mano
        if (from === pvxmano) {
          conn.sendMessage(
            from,
            `Welcome  @${num_split} to PVX MANORANJAN 🔥\n\n1) Send videos regularly especially new members.\n2) Don't Send CP or any other illegal videos.\n 3) A group bot will be counting the number of videos you've sent. \nSend ?pvxv to know video count.\nInactive members will be kicked time to time.`,
            MessageType.extendedText,
            {
              contextInfo: { mentionedJid: [numJid] },
            }
          );
        }

        //for programmer group
        if (from === pvxprogrammer) {
          conn.sendMessage(
            from,
            `Welcome @${num_split} to PVX Programmers Group.\nhttps://pvxcommunity.com/\n\n*Kindly give your intro like*\nName:\nCollege/Degree:\nInterest:\nSkills:\nCompany(if working):`,
            MessageType.extendedText,
            {
              contextInfo: { mentionedJid: [numJid] },
              detectLinks: false,
            }
          );
        }

        if (numJid === botNumberJid) {
          console.log("Bot is added to new group!");
          conn.sendMessage(
            from,
            `*─【 🤖 DEZKRAZZER BOT 🤖 】─* \n\nGreetings! You can send *${prefix}help* for bot commands`,
            MessageType.text
          );
        }
        console.log(`[GROUP] ${groupSubject} [JOINED] ${numJid}`);
      }
      if (anu.action == "remove") {
        console.log(`[GROUP] ${groupSubject} [LEAVED] ${numJid}`);
      }
    } catch (err) {
      console.log(err);
    }
  });

  // new message
  conn.on("chat-update", async (mek) => {
    try {
      if (!mek.hasNewMessage) return;
      try {
        mek = JSON.parse(JSON.stringify(mek)).messages[0];
      } catch {
        return;
      }
      if (!mek.message) return;
      if (mek.key && mek.key.remoteJid == "status@broadcast") return;
      // if (mek.key.fromMe) return;
      const content = JSON.stringify(mek.message);
      global.prefix;
      const from = mek.key.remoteJid;
      const type = Object.keys(mek.message)[0];

      const {
        text,
        extendedText,
        contact,
        location,
        liveLocation,
        image,
        video,
        sticker,
        document,
        audio,
        product,
      } = MessageType;

      //body will have the text message
      let body =
        type === "conversation" && mek.message.conversation.startsWith(prefix)
          ? mek.message.conversation
          : type == "imageMessage" &&
            mek.message.imageMessage.caption &&
            mek.message.imageMessage.caption.startsWith(prefix)
          ? mek.message.imageMessage.caption
          : type == "videoMessage" &&
            mek.message.videoMessage.caption &&
            mek.message.videoMessage.caption.startsWith(prefix)
          ? mek.message.videoMessage.caption
          : type == "extendedTextMessage" &&
            mek.message.extendedTextMessage.text &&
            mek.message.extendedTextMessage.text.startsWith(prefix)
          ? mek.message.extendedTextMessage.text
          : "";

      if (body[1] == " ") body = body[0] + body.slice(2); //remove space when space btw prefix and commandName like "! help"
      const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
      const args = body.trim().split(/ +/).slice(1);
      const isCmd = body.startsWith(prefix);

      //count video
      //  if (isGroup && mek.message.videoMessage && from == pvxmano) {
      //   setCountVideo(sender, from);
      // }

      //send all sticker message to given group
      // if (
      //   mek.message.stickerMessage &&
      //   mek.key.fromMe == false &&
      //   from.endsWith("@g.us")
      // ) {
      //   console.log(mek);
      //   const mediaSticker = await conn.downloadAndSaveMediaMessage({
      //     message: mek.message,
      //   });
      //   const webpWithMetadataSticker = await WSF.setMetadata(
      //     "<{PVX}> BOT 🤖",
      //     "",
      //     mediaSticker
      //   );
      //   //sticker only 1.0 -> "919557666582-1580308963@g.us"
      //   await conn.sendMessage(
      //     "919557666582-1628610549@g.us",
      //     webpWithMetadataSticker,
      //     MessageType.sticker
      //   );
      //   console.log("Sticker Sent!");
      // }

      /* [INFO] 
      1) quoted == tagged messages 
      
      2) when normal text received
      mek = {
        key: {
          remoteJid: "91955782-1559476348@g.us",
          fromMe: false,
          id: "B98FBDD5A762DEA9F4DD733",
        },
        message: { conversation: "!help" },
        messageTimestamp: "1632654425",
        participant: "919836014@s.whatsapp.net",
        ephemeralOutOfSync: false,
      };

      3) type = "conversation" , "imageMessage" , "videoMessage" , "extendedTextMessage"
        -> extendedTextMessage are tagged messages
      */
      if (!isCmd) return;
      errors = {
        admin_error: "❌ I'm not Admin here!",
      };

      const isGroup = from.endsWith("@g.us");
      //if (!isGroup) return;
      const groupMetadata = isGroup ? await conn.groupMetadata(from) : "";
      const groupName = isGroup ? groupMetadata.subject : "";
      let sender = isGroup ? mek.participant : from;

      // if (isGroup && groupName.toUpperCase().includes("<{PVX}>")) {
      //   let user = conn.contacts[sender];
      //   let username = user
      //     ? user.notify ||
      //       user.vname ||
      //       user.name ||
      //       sender.split("@")[0]
      //     : sender.split("@")[0];
      //   setCountMember(sender, from, username);
      // }

      // console.log(mek);
      if (mek.key.fromMe) sender = botNumberJid;

      const groupDesc = isGroup ? groupMetadata.desc : "";
      const groupMembers = isGroup ? groupMetadata.participants : "";
      const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : "";
      const isBotGroupAdmins = groupAdmins.includes(botNumberJid) || false;
      const isGroupAdmins = groupAdmins.includes(sender) || false;

      const isMedia = type === "imageMessage" || type === "videoMessage"; //image or video
      const isTaggedImage =
        type === "extendedTextMessage" && content.includes("imageMessage");
      const isTaggedVideo =
        type === "extendedTextMessage" && content.includes("videoMessage");
      const isTaggedSticker =
        type === "extendedTextMessage" && content.includes("stickerMessage");
      const isTaggedDocument =
        type === "extendedTextMessage" && content.includes("documentMessage");

      // Display every command info
      console.log(
        "[COMMAND]",
        command,
        "[FROM]",
        sender.split("@")[0],
        "[IN]",
        groupName
      );

      const reply = (message) => {
        conn.sendMessage(from, message, MessageType.text, {
          quoted: mek,
        });
      };

      const sendText = (message) => {
        conn.sendMessage(from, message, MessageType.text);
      };

      // send every command info to my whatsapp, won't work when i send something for bot
      if (myNumber && myNumber + "@s.whatsapp.net" !== sender) {
        let count = await countToday();
        await conn.sendMessage(
          myNumber + "@s.whatsapp.net",
          `${count}) [${prefix}${command}] [${groupName}]`,
          MessageType.text
        );
      }

      /* -------------------------- CRICKET HELPING FUNCTIONS ------------------------- */
      const stopcHelper = () => {
        reply("✔️ Stopping Cricket scores for this group !");
        console.log("Stopping Cricket scores for " + groupName);
        clearInterval(cricSetIntervalGroups[groupName]);
        cricStartedGroups[groupName] = false;
      };

      //return false when stopped in middle. return true when run fully
      const startcHelper = async (commandName, isFromSetInterval = false) => {
        if (!groupDesc) {
          conn.sendMessage(
            from,
            `❌
- Group description is empty.
- Put match ID in starting of group description. 
- Get match ID from cricbuzz today match url.
- example: https://www.cricbuzz.com/live-cricket-scores/37572/mi-vs-kkr-34th-match-indian-premier-league-2021 
- so match ID is 37572 !

# If you've put correct match ID in description starting and still facing this error then contact developer by !dev`,
            MessageType.text,
            {
              quoted: mek,
              detectLinks: false,
            }
          );
          return false;
        }

        matchIdGroups[groupName] = groupDesc.slice(0, 5);
        if (commandName === "startc" && !isFromSetInterval) {
          reply(
            "✔️ Starting Cricket scores for matchID: " +
              matchIdGroups[groupName] +
              " (taken from description)"
          );
        }

        let response = await getCricketScore(
          matchIdGroups[groupName],
          commandName
        );

        //response.info have "MO" only when command is startc
        if (commandName === "startc" && response.info === "MO") {
          sendText(response.message);
          reply("✔️ Match over! Stopping Cricket scores for this group !");
          console.log("Match over! Stopping Cricket scores for " + groupName);
          clearInterval(cricSetIntervalGroups[groupName]);
          cricStartedGroups[groupName] = false;
          return false;
        } else if (commandName === "startc" && response.info === "IO") {
          sendText(response.message);
          reply(
            "✔️ Inning over! Open again live scores later when 2nd inning will start by !startc"
          );
          stopcHelper();
          return false;
        } else if (response.info === "ER") {
          conn.sendMessage(
            from,
            `❌
- Group description starting is "${matchIdGroups[groupName]}"
- Put match ID in starting of group description. 
- Get match ID from cricbuzz today match url.
- example: https://www.cricbuzz.com/live-cricket-scores/37572/mi-vs-kkr-34th-match-indian-premier-league-2021 
- so match ID is 37572 !

# If you've put correct match ID in description starting and still facing this error then contact developer by !dev`,
            MessageType.text,
            {
              quoted: mek,
              detectLinks: false,
            }
          );
          return false;
        }
        sendText(response.message);
        return true;
      };

      // give command name with comma seperated to be blocked for particular group in first line of description like (82132 is matchid for cricket scores)
      //82132,score,add,remove
      let blockCommandsInDesc = []; //commands to be blocked
      if (groupDesc) {
        let firstLineDesc = groupDesc.split("\n")[0];
        blockCommandsInDesc = firstLineDesc.split(",");
      }

      if (blockCommandsInDesc.includes(command)) {
        reply("❌ Command blocked for this group!");
        return;
      }

      let pvxadminsMem;
      try {
        let pvxadminsGroup = await conn.groupMetadata(pvxadmin);
        pvxadminsMem = pvxadminsGroup.participants.map((mem) => mem.jid);
      } catch (err) {
        pvxadminsMem = [];
      }

      /* ------------------------------------ - ----------------------------------- */
      /* -------------------------------- COMMANDS -------------------------------- */
      /* ------------------------------------ - ----------------------------------- */
      switch (command) {
        /* ------------------------------- CASE: HELP ------------------------------ */
        case "help":
        case "h":
          const resHelp = await conn.sendMessage(
            from,
            commandList(prefix),
            MessageType.text
          );

          //delete after 5 min
          // setTimeout(async () => {
          //   await conn.deleteMessage(from, {
          //     id: resHelp.key.id,
          //     remoteJid: from,
          //     fromMe: true,
          //   });
          // }, 1000 * 60 * 5);
          break;

        /* ------------------------------- CASE: helpr ------------------------------ */
        case "helpr":
          reply(commandListOwner(prefix));
          break;

        /* ------------------------------- CASE: countstats ------------------------------ */
        case "countstats":
          if (myNumber + "@s.whatsapp.net" !== sender) {
            reply(`❌ Owner only command!`);
            return;
          }
          let countRes = await getcount();
          let countMsg = `COMMAND USED STATS:\n${readMore}`;

          countRes.forEach((r) => {
            countMsg += `\n${r.to_char} - ${r.times} times`;
          });
          reply(countMsg);
          break;

        /* ------------------------------- CASE: blacklist ------------------------------ */
        case "blacklist":
          let blacklistRes = await getBlacklist();
          let blacklistMsg = "Blacklisted Numbers\n";
          blacklistRes.forEach((num) => {
            blacklistMsg += `\n${num.number}`;
          });

          reply(blacklistMsg);
          break;

        /* ------------------------------- CASE: blacklistremove ------------------------------ */
        case "blacklistremove":
        case "blr":
          if (!pvxadminsMem.includes(sender)) {
            reply(`❌ Admin only command!`);
            return;
          }
          if (!isGroupAdmins) {
            reply("❌ Admin command!");
            return;
          }

          let blacklistNumb1 = args[0];
          if (!Number(blacklistNumb1)) {
            reply(
              `❌ Give number to remove from blacklist by ${prefix}blr number!`
            );
            return;
          }
          if (blacklistNumb1.startsWith("+")) {
            blacklistNumb1 = blacklistNumb1.slice(1);
          }
          if (
            blacklistNumb1.length === 10 &&
            !blacklistNumb1.startsWith("91")
          ) {
            blacklistNumb1 = "91" + blacklistNumb1;
          }

          let blacklistRes1 = await removeBlacklist(blacklistNumb1);
          if (blacklistRes1) reply("✔️ Removed from blacklist!");
          else reply("❌ Error!");
          break;

        /* ------------------------------- CASE: blacklistadd ------------------------------ */
        case "blacklistadd":
        case "bla":
          if (!pvxadminsMem.includes(sender)) {
            reply(`❌ Admin only command!`);
            return;
          }
          if (!isGroupAdmins) {
            reply("❌ Admin command!");
            return;
          }

          let blacklistNumb2 = args[0];
          if (!Number(blacklistNumb2)) {
            reply(`❌ Give number to add in blacklist by ${prefix}bla number!`);
            return;
          }
          if (blacklistNumb2.startsWith("+")) {
            blacklistNumb2 = blacklistNumb2.slice(1);
          }

          if (
            blacklistNumb2.length === 10 &&
            !blacklistNumb2.startsWith("91")
          ) {
            blacklistNumb2 = "91" + blacklistNumb2;
          }

          let blacklistRes2 = await addBlacklist(blacklistNumb2);
          if (blacklistRes2) reply("✔️ Added to blacklist!");
          else reply("❌ Error!");

          break;

        /* ------------------------------- CASE: warning ------------------------------ */
        case "warning":
        case "warn":
          // if (!pvxadminsMem.includes(sender)) {
          //   reply(`❌ PVX admin only command!`);
          //   return;
          // }
          if (!isGroupAdmins) {
            reply("❌ Admin command!");
            return;
          }
          if (!mek.message.extendedTextMessage) {
            reply("❌ Tag someone!");
            return;
          }
          try {
            let mentioned =
              mek.message.extendedTextMessage.contextInfo.mentionedJid;
            if (mentioned) {
              //when member are mentioned with command
              if (mentioned.length === 1) {
                let warnCount = await getCountWarning(mentioned[0], from);
                let num_split = mentioned[0].split("@s.whatsapp.net")[0];
                let warnMsg = `@${num_split} ,You have been warned. Warning status (${
                  warnCount + 1
                }/3). Don't repeat this type of behaviour again or you'll be banned from the group!`;
                conn.sendMessage(from, warnMsg, MessageType.extendedText, {
                  contextInfo: { mentionedJid: mentioned },
                });
                await setCountWarning(mentioned[0], from);
                if (warnCount >= 2) {
                  if (!isBotGroupAdmins) {
                    reply("❌ I'm not Admin here!");
                    return;
                  }
                  if (groupAdmins.includes(mentioned[0])) {
                    reply("❌ Cannot remove admin!");
                    return;
                  }
                  conn.groupRemove(from, mentioned);
                  reply("_✔ Number removed from group!_");
                }
              } else {
                //if multiple members are tagged
                reply("❌ Mention only 1 member!");
              }
            } else {
              //when message is tagged with command
              let taggedMessageUser = [
                mek.message.extendedTextMessage.contextInfo.participant,
              ];
              let warnCount = await getCountWarning(taggedMessageUser[0], from);
              let num_split = taggedMessageUser[0].split("@s.whatsapp.net")[0];
              let warnMsg = `@${num_split} ,Your have been warned. Warning status (${
                warnCount + 1
              }/3). Don't repeat this type of behaviour again or you'll be banned from group!`;
              conn.sendMessage(from, warnMsg, MessageType.extendedText, {
                contextInfo: { mentionedJid: taggedMessageUser },
              });
              await setCountWarning(taggedMessageUser[0], from);
              if (warnCount >= 2) {
                if (!isBotGroupAdmins) {
                  reply("❌ I'm not Admin here!");
                  return;
                }
                if (groupAdmins.includes(taggedMessageUser[0])) {
                  reply("❌ Cannot remove admin!");
                  return;
                }
                conn.groupRemove(from, taggedMessageUser);
                reply("_✔ Number removed from group!_");
              }
            }
          } catch (err) {
            console.log(err);
            reply(`❌ Error!`);
          }
          break;

        /* ------------------------------- CASE: donationadd ------------------------------ */
        // !donationadd #name #amount
        case "donationadd":
          if (myNumber + "@s.whatsapp.net" !== sender) {
            reply(`❌ Owner only command!`);
            return;
          }
          let donaList = body
            .trim()
            .replace(/ +/, ",")
            .split(",")[1]
            .split("#");
          let donaName = donaList[1].trim();
          let donaAmount = Number(donaList[2].trim());
          if (donaName && donaAmount) {
            let addDonaRes = await addDonation(donaName, donaAmount);
            if (addDonaRes) reply("✔️ Added!");
            else reply("❌ Error!");
          } else reply(`❌ Error! Add by ${prefix}adddonation #name #amount`);

          break;

        /* ------------------------------ CASE: DONATION ------------------------------ */
        case "donation":
        case "donate":
          let donaResult = await getDonation();
          // console.log(donaResult);
          let totalDona = 0;
          let donaMsgTemp = "";
          donaResult.forEach((dona, index) => {
            totalDona += dona.amount;
            donaMsgTemp += `\n❤️ Rs ${dona.amount} - ${dona.name}`;
          });

          let donaMsg = `Helping DEZKRAZZER DEVELOPMENT${readMore} to grow and provide good stuff for all members.\nUse cases: domain name for DEZKRAZZER website, tournaments in future, server for all bots and website, etc etc.\n\n*Any amount is appreciated.*\n\n*LINK: https://trakteer.id/dezkrazzer/tip*\n\nAfter sending donation, take a screenshot and send to https://wa.me/6282337130026 with your name. [Your name will be shown here after that]\n\n*Total Donations: Rs ${totalDona}*`;

          donaMsg += donaMsgTemp;
          conn.sendMessage(
            from,
            fs.readFileSync("./assert/donation.jpg"),
            MessageType.image,
            {
              mimetype: Mimetype.png,
              quoted: mek,
              caption: donaMsg,
              detectLinks: false,
            }
          );
          break;

        /* --------------------------------- zero --------------------------------- */
        case "zero":
          try {
            if (!isGroup) {
              reply("❌ Group command only!");
              return;
            }
            // if (!pvxadminsMem.includes(sender)) {
            //   reply(`❌ PVX admin only command!`);
            //   return;
            // }
            if (!isGroupAdmins) {
              reply("❌ Admin command!");
              return;
            }
            let resultCountGroupIndi = await getCountGroupMembers(from);
            let memWithMsg = new Set();
            for (let member of resultCountGroupIndi) {
              memWithMsg.add(member.memberjid);
            }
            let zeroMsg = `${groupName}\nMembers with 0 message from 24 NOV:${readMore}\n`;
            groupMembers.forEach((mem) => {
              if (!memWithMsg.has(mem.jid)) {
                zeroMsg += `\n${mem.jid.split("@")[0]}`;
              }
            });
            reply(zeroMsg);
          } catch (err) {
            console.log(err);
          }

          break;

        /* ------------------------------- CASE: tagall ------------------------------ */
        case "tagall":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (
            groupName.toUpperCase().includes("PVX") &&
            ![myNumber + "@s.whatsapp.net", botNumberJid].includes(sender)
          ) {
            reply(`❌ Owner only command for avoiding spam in PVX Groups!`);
            return;
          }
          if (!isGroupAdmins) {
            reply("❌ Admin command!");
            return;
          }
          let jids = [];
          let mesaj = "ALL: ";
          if (
            mek.message.extendedTextMessage &&
            mek.message.extendedTextMessage.contextInfo.quotedMessage
              .conversation
          ) {
            mesaj +=
              mek.message.extendedTextMessage.contextInfo.quotedMessage
                .conversation + "\n\n";
          } else {
            mesaj += args.length ? args.join(" ") + "\n\n" : "";
          }

          for (let i of groupMembers) {
            mesaj += "@" + i.id.split("@")[0] + " ";
            jids.push(i.id.replace("c.us", "s.whatsapp.net"));
          }
          await conn.sendMessage(from, mesaj, MessageType.extendedText, {
            contextInfo: { mentionedJid: jids },
            quoted: mek,
          });

          break;

        /* ------------------------------- CASE: DELETE ------------------------------ */
        case "delete":
        case "d":
          try {
            if (!mek.message.extendedTextMessage) {
              reply(`❌ Tag message of bot to delete.`);
              return;
            }
            if (
              botNumberJid ==
              mek.message.extendedTextMessage.contextInfo.participant
            ) {
              const chatId =
                mek.message.extendedTextMessage.contextInfo.stanzaId;
              await conn.deleteMessage(from, {
                id: chatId,
                remoteJid: from,
                fromMe: true,
              });
            } else {
              reply(`❌ Tag message of bot to delete.`);
            }
          } catch (err) {
            console.log(err);
            reply(`❌ Error!`);
          }
          break;

        /* ------------------------------- CASE: DELETEAUTH ------------------------------ */
        case "deleteauth":
          if (myNumber + "@s.whatsapp.net" !== sender) {
            reply(`❌ Command only for owner!`);
            return;
          }
          try {
            await dropAuth();
            reply(`✔ auth data deleted!`);
          } catch (err) {
            console.log(err);
            reply(`❌ Error!`);
          }
          break;

        /* ------------------------------- CASE: TG sticker ------------------------------ */
        case "stg":
          if (myNumber + "@s.whatsapp.net" !== sender) {
            reply(`❌ Owner only command for avoiding spam!`);
            return;
          }
          if (!stickertg) {
            reply(`❌ tg stickers download is not started!`);
            return;
          }

          clearInterval(setIntervaltg);
          stickertg = false;
          reply(`✔ Stopped tg stickers download!`);

          break;

        case "tg":
          if (myNumber + "@s.whatsapp.net" !== sender) {
            reply(`❌ Owner only command for avoiding spam!`);
            return;
          }
          if (!isTaggedDocument) {
            reply(`❌ Send zip document file!`);
            return;
          }
          if (stickertg) {
            reply(`❌ Another process is going on. wait till it finish!`);
            return;
          }
          try {
            stickertg = true;
            const encmediatg = JSON.parse(
              JSON.stringify(mek).replace("quotedM", "m")
            ).message.extendedTextMessage.contextInfo;

            console.log("downloading...");
            const mediatg = await conn.downloadAndSaveMediaMessage(encmediatg);
            console.log("downloaded", mediatg);

            // reading zip
            let zip = new AdmZip(`./${mediatg}`);
            // extracts everything
            zip.extractAllTo(`./`, true);
            let zipEntries = zip.getEntries(); // an array of ZipEntry records

            // let filestg = fs.readdirSync(dirNametg);
            let stickerCounttg = zipEntries.length;
            console.log("extracted: files " + stickerCounttg);

            reply(`✔ Sending all ${stickerCounttg} stickers`);
            let itg = -1;
            setIntervaltg = setInterval(async () => {
              itg += 1;

              //last file
              if (itg >= stickerCounttg - 1) {
                stickertg = false;
                clearInterval(setIntervaltg);
                reply(`✔ Finished!`);
              }
              console.log("Sending sticker ", itg);
              if (zipEntries[itg].entryName.endsWith(".webp")) {
                let filepath = `${__dirname}`;
                //add slash of not present
                filepath += zipEntries[itg].entryName.startsWith("/")
                  ? ""
                  : "/";
                filepath += `${zipEntries[itg].entryName}`;

                //"<{PVX}> BOT 🤖"
                //"https://pvxcommunity.com"
                const webpWithMetadatatg = await WSF.setMetadata(
                  "BOT 🤖",
                  "pvxcommunity.com",
                  filepath
                );
                await conn.sendMessage(
                  from,
                  webpWithMetadatatg,
                  MessageType.sticker
                );
              }
            }, 0);
          } catch (err) {
            console.log(err);
            reply(`❌ Some error came!`);
            stickertg = false;
          }
          break;

          /* ------------------------------- CASE: SONG ------------------------------ */
        case "song":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (args.length === 0) {
            reply(`❌ Query is empty! \nSend ${prefix}song query`);
            return;
          }
          try {
            let randomName = getRandom(".mp3");
            let query = args.join("%20");
            let response = await downloadSong(randomName, query);
            if (response == "NOT") {
              reply(
                `❌ Song not found!\nTry to put correct spelling of song along with singer name.\n[Better use ${prefix}yta command to download correct song from youtube]`
              );
              return;
            }
            console.log(`song saved-> ./${randomName}`, response);

            await conn.sendMessage(
              from,
              fs.readFileSync(`./${randomName}`),
              MessageType.document,
              {
                mimetype: "audio/mpeg",
                filename: response + ".mp3",
                quoted: mek,
              }
            );
            fs.unlinkSync(`./${randomName}`);
          } catch (err) {
            console.log(err);
            reply(`❌ There is some problem.`);
          }
          break;

        /* ------------------------------- CASE: YTA ------------------------------ */
        case "yta":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (args.length === 0) {
            reply(`❌ URL is empty! \nSend ${prefix}yta url`);
            return;
          }
          try {
            let urlYt = args[0];
            if (!urlYt.startsWith("http")) {
              reply(`❌ Give youtube link!`);
              return;
            }
            let infoYt = await ytdl.getInfo(urlYt);
            //30 MIN
            if (infoYt.videoDetails.lengthSeconds >= 1800) {
              reply(`❌ Video too big!`);
              return;
            }
            let titleYt = infoYt.videoDetails.title;
            let randomName = getRandom(".mp3");

            const stream = ytdl(urlYt, {
              filter: (info) =>
                info.audioBitrate == 160 || info.audioBitrate == 128,
            }).pipe(fs.createWriteStream(`./${randomName}`));
            console.log("Audio downloading ->", urlYt);
            // reply("Downloading.. This may take upto 5 min!");
            await new Promise((resolve, reject) => {
              stream.on("error", reject);
              stream.on("finish", resolve);
            });

            let stats = fs.statSync(`./${randomName}`);
            let fileSizeInBytes = stats.size;
            // Convert the file size to megabytes (optional)
            let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
            console.log("Audio downloaded ! Size: " + fileSizeInMegabytes);
            if (fileSizeInMegabytes <= 40) {
              await conn.sendMessage(
                from,
                fs.readFileSync(randomName),
                MessageType.document,
                {
                  mimetype: "audio/mpeg",
                  filename: titleYt + ".mp3",
                  quoted: mek,
                }
              );
            } else {
              reply(`❌ File size bigger than 40mb.`);
            }

            fs.unlinkSync(`./${randomName}`);
          } catch (err) {
            console.log(err);
            reply(`❌ There is some problem.`);
          }

          break;
        /* ------------------------------- CASE: YT ------------------------------ */
        case "ytv":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (args.length === 0) {
            reply(`❌ URL is empty! \nSend ${prefix}ytv url`);
            return;
          }
          try {
            let urlYt = args[0];
            if (!urlYt.startsWith("http")) {
              reply(`❌ Give youtube link!`);
              return;
            }
            let infoYt = await ytdl.getInfo(urlYt);
            //30 MIN
            if (infoYt.videoDetails.lengthSeconds >= 1800) {
              reply(`❌ Video too big!`);
              return;
            }
            let titleYt = infoYt.videoDetails.title;
            let randomName = getRandom(".mp4");

            const stream = ytdl(urlYt, {
              filter: (info) => info.itag == 22 || info.itag == 18,
            }).pipe(fs.createWriteStream(`./${randomName}`));
            //22 - 1080p/720p and 18 - 360p
            console.log("Video downloading ->", urlYt);
            // reply("Downloading.. This may take upto 5 min!");
            await new Promise((resolve, reject) => {
              stream.on("error", reject);
              stream.on("finish", resolve);
            });

            let stats = fs.statSync(`./${randomName}`);
            let fileSizeInBytes = stats.size;
            // Convert the file size to megabytes (optional)
            let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
            console.log("Video downloaded ! Size: " + fileSizeInMegabytes);
            if (fileSizeInMegabytes <= 40) {
              await conn.sendMessage(
                from,
                fs.readFileSync(`./${randomName}`),
                MessageType.video,
                {
                  mimetype: Mimetype.mp4,
                  caption: `${titleYt}`,
                  quoted: mek,
                }
              );
            } else {
              reply(`❌ File size bigger than 30mb.`);
            }

            fs.unlinkSync(`./${randomName}`);
          } catch (err) {
            console.log(err);
            reply(`❌ There is some problem.`);
          }
          break;

        /* ----------------------------------- FB ----------------------------------- */
        case "fb":
          //not working in heroku
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (args.length === 0) {
            reply(`❌ URL is empty! \nSend ${prefix}fb url`);
            return;
          }
          let urlFb = args[0];
          let randomName = getRandom(".mp4");
          try {
            let { videoDirectLinkFb } = await getFbVideo(urlFb);
            if (videoDirectLinkFb) {
              await saveInstaVideo(randomName, videoDirectLinkFb);
              console.log(`video saved-> ./${randomName}`);
              await conn.sendMessage(
                from,
                fs.readFileSync(`./${randomName}`), // can send mp3, mp4, & ogg
                MessageType.video,
                { mimetype: Mimetype.mp4, quoted: mek }
              );
              fs.unlinkSync(`./${randomName}`);
            } else {
              //TODO: throw err
              reply(`❌ There is some problem!`);
            }
          } catch (err) {
            console.log(err);
            reply(`❌ There is some problem.`);
          }
          break;

        /* ------------------------------- CASE: INSTA ------------------------------ */
        case "insta":
        case "i":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (args.length === 0) {
            reply(`❌ URL is empty! \nSend ${prefix}insta url`);
            return;
          }
          let urlInsta = args[0];

          // if (
          //   !(
          //     urlInsta.includes("instagram.com/p/") ||
          //     urlInsta.includes("instagram.com/reel/") ||
          //     urlInsta.includes("instagram.com/tv/")
          //   )
          // ) {
          //   reply(
          //     `❌ Wrong URL! Only Instagram posted videos, tv and reels can be downloaded.`
          //   );
          //   return;
          // }

          try {
            console.log("Video downloading ->", urlInsta);
            // console.log("Trying saving", urlInsta);
            let { imgDirectLink, videoDirectLink } = await getInstaVideo(
              urlInsta
            );
            if (videoDirectLink) {
              let randomName = getRandom(".mp4");
              await saveInstaVideo(randomName, videoDirectLink);
              let stats = fs.statSync(`./${randomName}`);
              let fileSizeInBytes = stats.size;
              // Convert the file size to megabytes (optional)
              let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
              console.log("Video downloaded ! Size: " + fileSizeInMegabytes);

              //  { caption: "hello there!", mimetype: Mimetype.mp4 }
              // quoted: mek for tagged
              if (fileSizeInMegabytes <= 40) {
                await conn.sendMessage(
                  from,
                  fs.readFileSync(`./${randomName}`), // can send mp3, mp4, & ogg
                  MessageType.video,
                  {
                    mimetype: Mimetype.mp4,
                    quoted: mek,
                  }
                );
              } else {
                reply(`❌ File size bigger than 40mb.`);
              }
              fs.unlinkSync(`./${randomName}`);
            } else if (imgDirectLink) {
              await conn.sendMessage(
                from,
                { url: imgDirectLink },
                MessageType.image,
                { quoted: mek }
              );
            } else {
              reply(
                `❌ There is some problem. Also stories and private account media can't be downloaded!`
              );
            }
          } catch (err) {
            console.log(err);
            reply(
              `❌ There is some problem. Also stories and private account media can't be downloaded.`
            );
          }
          break;

        /* ------------------------------- CASE: QUOTES ------------------------------ */
        case "quote":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          let quote = await getQuote();
          reply(quote);
          break;

        /* ------------------------------- CASE: GENDER ------------------------------ */
        case "gender":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (args.length === 0) {
            reply(`❌ Name is not given! \nSend ${prefix}gender firstname`);
            return;
          }
          let namePerson = args[0];
          if (namePerson.includes("@")) {
            reply(`❌ Don't tag! \nSend ${prefix}gender firstname`);
            return;
          }
          let genderText = await getGender(namePerson);
          reply(genderText);
          break;

        /* ------------------------------- CASE: TEXT ------------------------------ */
        case "text":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }

          if (type === "imageMessage" || isTaggedImage) {
            const encmedia = isTaggedImage
              ? JSON.parse(JSON.stringify(mek).replace("quotedM", "m")).message
                  .extendedTextMessage.contextInfo
              : mek;
            reply("Processing image to text...");
            const media = await conn.downloadAndSaveMediaMessage(encmedia);
            let dataText = await Tesseract.recognize(`./${media}`, "eng");
            fs.unlinkSync(`./${media}`);
            let message = dataText.data.text;
            message = message.replace(/\s{2,}/g, " ").trim(); //remove multiple spaces
            message = message.replace(/(\n){2,}/g, "\n").trim(); //remove multiple \n

            reply(message);
          } else {
            reply("❌ Give image having text!");
          }
          break;

        /* ------------------------------- CASE: steal ------------------------------ */
        case "steal":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (!isTaggedSticker) {
            reply(`❌ Tag a sticker with ${prefix}steal command!`);
            return;
          }
          try {
            const mediaSteal = await conn.downloadAndSaveMediaMessage({
              message:
                mek.message.extendedTextMessage.contextInfo.quotedMessage,
            });
            const webpWithMetadata = await WSF.setMetadata(
              "DEZKRAZZER BOT",
              "lazuardiakbar.me",
              mediaSteal
            );
            fs.unlinkSync(`./${mediaSteal}`);
            await conn.sendMessage(
              from,
              webpWithMetadata,
              MessageType.sticker,
              {
                quoted: mek,
              }
            );
          } catch (err) {
            console.log(err);
            reply("❌ There is some problem!");
          }
          break;

        /* ------------------------------- CASE: TOIMG ------------------------------ */
        case "toimg":
        case "image":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (!isTaggedSticker) {
            reply(`❌ Tag a sticker with ${prefix}toimg command!`);
            return;
          }

          if (
            !mek.message.extendedTextMessage.contextInfo.quotedMessage
              .stickerMessage.isAnimated
          ) {
            const mediaToImg = await conn.downloadAndSaveMediaMessage({
              message:
                mek.message.extendedTextMessage.contextInfo.quotedMessage,
            });
            ffmpeg(`./${mediaToImg}`)
              .fromFormat("webp_pipe")
              .save("result.png")
              .on("error", (err) => {
                console.log(err);
                reply(
                  "❌ There is some problem!\nOnly non-animated stickers can be convert to image!"
                );
              })
              .on("end", () => {
                conn.sendMessage(
                  from,
                  fs.readFileSync("result.png"),
                  MessageType.image,
                  {
                    mimetype: Mimetype.png,
                    quoted: mek,
                  }
                );
                fs.unlinkSync("result.png");
              });
          } else {
            reply(
              "❌ There is some problem!\nOnly non-animated stickers can be convert to image!"
            );
          }
          break;

        case "slist":
          reply(
            `📛 MAKE COOL STICKERS FROM TEXT\n\n ${prefix}wall text\n ${prefix}matrix text\n ${prefix}flame text\n ${prefix}fire text\n ${prefix}city text\n ${prefix}3d text\n ${prefix} text\n ${prefix}light text\n ${prefix}ff text\n ${prefix}neon text\n ${prefix}flower text\n${prefix}sand text`
          );
          break;

        /* -------------------------------- CASE: WALL ------------------------------- */
        /*case "wall":
        case "matrix":
        case "flame":
        case "fire":
        case "city":
        case "3d":
        case "logo":
        case "light":
        case "ff":
        case "neon":
        case "flower":
        case "sand":
          let zeksType;
          if (command === "wall") zeksType = "breakwall";
          else if (command === "matrix") zeksType = "matrix";
          else if (command === "flame") zeksType = "flametext";
          else if (command === "fire") zeksType = "tfire";
          else if (command === "city") zeksType = "lithgtext";
          else if (command === "3d") zeksType = "text3dbox";
          else if (command === "logo") zeksType = "logobp";
          else if (command === "light") zeksType = "tlight";
          else if (command === "ff") zeksType = "epep";
          else if (command === "neon") zeksType = "bneon";
          else if (command === "flower") zeksType = "flowertext";
          else if (command === "sand") zeksType = "sandw";
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (args.length === 0) {
            reply(`❌ Give some text.`);
            return;
          }
          try {
            let msg = body.trim().replace(/ +/, ",").split(",")[1];
            let url = encodeURI(
              "https://api.zeks.me/api/" +
                zeksType +
                "?apikey=" +
                zeksapi +
                "&text=" +
                msg
            );

            let packName = "BOT 🤖";
            let authorName = "pvxcommunity.com";
            let ran = getRandom(".webp");

            let outputOptions = [
              `-vcodec`,
              `libwebp`,
              `-vf`,
              `scale=600:600:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=600:600:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1`,
              `-loop`,
              `0`,
              `-ss`,
              `00:00:00.0`,
              `-t`,
              `00:00:10.0`,
              `-preset`,
              `default`,
              `-an`,
              `-vsync`,
              `0`,
              `-s`,
              `512:512`,
            ];

            ffmpeg(url)
              .addOutputOptions(outputOptions)
              .on("error", (err) => {
                console.log(err);
                reply(
                  "❌ ERROR!\nOnly english and No emoji.\nMaybe the api/website is down."
                );
              })
              .on("end", async () => {
                const webpWithMetadata = await WSF.setMetadata(
                  packName,
                  authorName,
                  ran
                );
                await conn.sendMessage(
                  from,
                  webpWithMetadata,
                  MessageType.sticker,
                  {
                    quoted: mek,
                  }
                );
                try {
                  fs.unlinkSync(ran);
                } catch (err) {
                  console.log(err);
                }
              })
              .toFormat("webp")
              .save(ran);
          } catch (err) {
            console.log(err);
            reply("❌ ERROR!");
          }

          break;*/

        /* ------------------------------- CASE: STICKER ------------------------------ */
        case "sticker":
        case "s":
          if (isMedia || isTaggedImage || isTaggedVideo) {
            let packName = "DEZKRAZZER BOT";
            let authorName = "lazuardiakbar.me";
            let ran = getRandom(".webp");

            let outputOptions = [
              `-vcodec`,
              `libwebp`,
              `-vf`,
              `scale=600:600:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=600:600:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1`,
              `-loop`,
              `0`,
              `-ss`,
              `00:00:00.0`,
              `-t`,
              `00:00:10.0`,
              `-preset`,
              `default`,
              `-an`,
              `-vsync`,
              `0`,
              `-s`,
              `512:512`,
            ];
            if (args.includes("crop") || args.includes("c")) {
              outputOptions = [
                `-vcodec`,
                `libwebp`,
                `-vf`,
                `crop=w='min(min(iw\,ih)\,500)':h='min(min(iw\,ih)\,500)',scale=500:500,setsar=1,fps=15`,
                `-loop`,
                `0`,
                `-ss`,
                `00:00:00.0`,
                `-t`,
                `00:00:10.0`,
                `-preset`,
                `default`,
                `-an`,
                `-vsync`,
                `0`,
                `-s`,
                `512:512`,
              ];
            }

            // //new version of wa-sticker-formatter...
            // async function addMetadataSticker(media, ran, type) {
            //   console.log(ran);
            //   await conn.sendMessage(from, ran, MessageType.sticker, {
            //     quoted: mek,
            //   });
            //   const sticker = new Sticker(`./${ran}`, {
            //     pack: packName,
            //     author: authorName,
            //     type,
            //     quality: 40,
            //   });
            //   // await sticker.toFile(ran);
            //   const buffer = await sticker.build();
            //   await conn.sendMessage(from, buffer, MessageType.sticker, {
            //     quoted: mek,
            //   });
            //   fs.unlinkSync(media);
            //   fs.unlinkSync(ran);
            // }
            async function buildSticker(media, ran) {
              const webpWithMetadata = await WSF.setMetadata(
                packName,
                authorName,
                ran
              );
              await conn.sendMessage(
                from,
                webpWithMetadata,
                MessageType.sticker,
                {
                  quoted: mek,
                }
              );
              try {
                fs.unlinkSync(ran);
                fs.unlinkSync(media);
              } catch (err) {
                console.log(err);
              }
            }

            const encmedia =
              isTaggedImage || isTaggedVideo
                ? JSON.parse(JSON.stringify(mek).replace("quotedM", "m"))
                    .message.extendedTextMessage.contextInfo
                : mek;
            const media = await conn.downloadAndSaveMediaMessage(encmedia);

            ffmpeg(`./${media}`)
              .input(media)
              .addOutputOptions(outputOptions)
              .on("error", (err) => {
                fs.unlinkSync(media);
                console.log(err);
                reply(`❌ Failed to convert media to sticker!`);
              })
              .on("end", async () => {
                buildSticker(media, ran);
              })
              .toFormat("webp")
              .save(ran);
          } else {
            reply("❌ Give a media to convert into sticker!");
            return;
          }

          break;

        /* ------------------------------- CASE: DRIVE ------------------------------ */
        // case "drive":
        // if (blockCommandsInDesc.includes(command)) {            reply("❌ Command blocked for this group!");   return;}

        //   if (!isGroup) {
        //     reply("❌ Group command only!");
        //     return;
        //   }
        //   if (args.length === 0) {
        //     reply(`❌ Query is empty! \nSend ${prefix}drive query_name`);
        //     return;
        //   }
        //   let query = args.join(" ");
        //   let respo = await driveQuery(query);
        //   reply(respo);

        //   break;

        /* ------------------------------- CASE: ADD ------------------------------ */
        case "add":
          //reply("❌ Command Temperory Removed!");
          //return;

          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (!isGroupAdmins) {
            reply("❌ Admin command!");
            return;
          }
          if (!isBotGroupAdmins) {
            reply("❌ I'm not Admin here!");
            return;
          }

          let num;
          if (mek.message.extendedTextMessage) {
            //member's message is tagged to add
            num = mek.message.extendedTextMessage.contextInfo.participant;
          } else {
            //number is given like !add 919557---82
            if (args.length === 0) {
              reply("❌ Give number to add!");
              return;
            }
            num = `${args.join("").replace(/ |-|\(|\)/g, "")}@s.whatsapp.net`; //remove spaces , ( , ) and -
            if (num.startsWith("+")) {
              //remove + sign from starting if given
              num = num.slice(1);
            }
          }
          try {
            const response = await conn.groupAdd(from, [num]);
            // console.log("RES", response);

            let number = `${num.split("@s.whatsapp.net")[0]}`;
            let get_status = response[`${number}@c.us`];
            if (get_status == 400) {
              reply("_❌ Invalid number, include country code also!_");
            } else if (get_status == 403) {
              reply("_❌ Number has privacy on adding group!_");
            } else if (get_status == 408) {
              reply("_❌ Number has left the group recently!_");
            } else if (get_status == 409) {
              reply("_❌ Number is already in group!_");
            } else if (get_status == 500) {
              reply("_❌ Group is currently full!_");
            } else if (get_status == 200) {
              reply("_✔ Number added to group!_");
            }
          } catch {
            reply("_❌ Give correct number with country code also!_");
          }
          break;

        /* ------------------------------- CASE: KICK ------------------------------ */
        case "kick":
        case "ban":
        case "remove":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (!isGroupAdmins) {
            reply("❌ Admin command!");
            return;
          }
          if (!isBotGroupAdmins) {
            reply("❌ I'm not Admin here!");
            return;
          }
          if (!mek.message.extendedTextMessage) {
            reply("❌ Tag someone!");
            return;
          }

          /*
          1) when !ban OR !ban xyz
          { conversation: '!ban' }

          2) when !ban tagMember
          {
            extendedTextMessage: {
              text: '!ban @91885---7364',
              previewType: 'NONE',
              contextInfo: { mentionedJid: [Array] }
            }
          }

          3) when !ban tagMessage
          {
            extendedTextMessage: {
              text: '!ban',
              previewType: 'NONE',
              contextInfo: {
                stanzaId: '3C2B0F3CE0-----D970A0C648B4BC3',
                participant: '919675---959@s.whatsapp.net',
                quotedMessage: [Object]
              }
            }
          }
          */
          let mentioned =
            mek.message.extendedTextMessage.contextInfo.mentionedJid;
          if (mentioned) {
            //when member are mentioned with command
            if (mentioned.length === 1) {
              if (groupAdmins.includes(mentioned[0])) {
                //if admin then don't remove
                reply("❌ Cannot remove admin!");
                return;
              }
              conn.groupRemove(from, mentioned);
              reply("_✔ Number removed from group!_");
            } else {
              //if multiple members are tagged
              reply("❌ Mention only 1 member!");
            }
          } else {
            //when message is tagged with command
            let taggedMessageUser = [
              mek.message.extendedTextMessage.contextInfo.participant,
            ];
            if (groupAdmins.includes(taggedMessageUser[0])) {
              //if admin then don't remove
              reply("❌ Cannot remove admin!");
              return;
            }
            conn.groupRemove(from, taggedMessageUser);
            reply("_✔ Number removed from group!_");
          }
          break;

        /* ------------------------------- CASE: MUTE ------------------------------ */
        case "mute":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (!isGroupAdmins) {
            reply("❌ Admin command!");
            return;
          }
          await conn.groupSettingChange(
            from,
            GroupSettingChange.messageSend,
            true
          );
          break;

        /* ------------------------------- CASE: UNMUTE ------------------------------ */
        case "unmute":
          if (!isGroup) {
            reply("❌ Group command only!");
            return;
          }
          if (!isGroupAdmins) {
            reply("❌ Admin command!");
            return;
          }
          await conn.groupSettingChange(
            from,
            GroupSettingChange.messageSend,
            false
          );
          break;

        /* ------------------------------- CASE: UNMUTE ------------------------------ */

        case "ping":
          reply("🏓 Pong!")
          break;


        default:
          reply(`👋 Hi! I don't understand the command, please use *!help* for the list of commands`);
          break;
      }
    } catch (err) {
      console.log(err);
    }
  });
};
main();
