const Discord = require('discord.js');
const client = new Discord.Client();
const { botOwner, botToken, botVoiceChannelID, logChannelID } = require('./ayarlar.json');

client.on("ready", async () => {
  client.user.setPresence({ activity: { name: "ÖNERİ/ŞİKAYET İÇİN DM" } });
  let botVoiceChannel = client.channels.cache.get(botVoiceChannelID);
  if (botVoiceChannel) botVoiceChannel.join().catch(err => console.error("Bot ses kanalına bağlanamadı!"));
});
// Yashinu tarafından kodlanmıştır.

let oneriler = new Set();
client.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith("!eval") && message.author.id === botOwner) {
    let args = message.content.split(' ').slice(1);
    if (!args[0]) return message.channel.send(`Kod belirtilmedi`);
      let code = args.join(' ');
      function clean(text) {
      if (typeof text !== 'string') text = require('util').inspect(text, { depth: 0 })
      text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
      return text;
    };
    try { 
      let evaled = clean(await eval(code));
      if(evaled.match(new RegExp(`${client.token}`, 'g'))) evaled.replace(client.token, "Yasaklı komut");
      message.channel.send(`${evaled.replace(client.token, "Yasaklı komut")}`, {code: "js", split: true});
    } catch(err) { message.channel.send(err, {code: "js", split: true}) };
    return;
  };

  let koruma = await client.chatKoruma(message);
  if (message.channel.type === "dm" && (koruma == null || koruma == undefined || koruma == false)) {
    if (oneriler.has(message.author.id)) return;
    let embed = new Discord.MessageEmbed().setColor("PURPLE").addField("Yeni Öneri/Şikayet Geldi!", `${message.content ? message.content.slice(0, 900) : ""}\n\n\`Öneriyi Yapan:\` ${message.author}`);
    if (message.attachments.first() && message.attachments.first().url) embed.setImage(message.attachments.first().url);
    message.channel.send("Önerin başarıyla iletildi! Bir sonraki önerini **10 dakika** sonra yapabileceksin.");
    client.channels.cache.get(logChannelID).send(embed);
    oneriler.add(message.author.id);
    setTimeout(() => { oneriler.delete(message.author.id); }, 10*60*1000);
  };
});

client.login(botToken).then(c => console.log(`${client.user.tag} olarak giriş yapıldı!`)).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));
