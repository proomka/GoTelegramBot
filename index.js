const Telegraf = require('telegraf');
const fs = require('fs');
const CONFIG = require('./config.json');
const { Markup } = require('telegraf');

const BOT_TOKEN = CONFIG.BOT_TOKEN;

const bot = new Telegraf(BOT_TOKEN);

function reVote(ctx, count, is) {
    let clicker = ctx.update.callback_query.from.username;
    let text = ctx.update.callback_query.message.text;
    let sentence = text.split('\n');

    for (var i in count) {
        if (sentence[count[i]].includes('@' + clicker + ', ')) {
            sentence[count[i]] = sentence[count[i]].replace('@' + clicker + ', ', '');
            if (sentence[is] == '') {
                sentence[is] = sentence[is] + '@' + clicker;
            } else {
                sentence[is] = sentence[is] + ', @' + clicker;
            }
        } else if (sentence[count[i]].includes(', @' + clicker)) {
            sentence[count[i]] = sentence[count[i]].replace(', @' + clicker, '');
            if (sentence[is] == '') {
                sentence[is] = sentence[is] + '@' + clicker;
            } else {
                sentence[is] = sentence[is] + ', @' + clicker;
            }
        } else  if (sentence[count[i]].includes('@' + clicker)) {
            sentence[count[i]] = sentence[count[i]].replace('@' + clicker, '');
            if (sentence[is] == '') {
                sentence[is] = sentence[is] + '@' + clicker;
            } else {
                sentence[is] = sentence[is] + ', @' + clicker;
            }
        } else {

        }
    }

    ctx.editMessageText(`${sentence[0]}
${sentence[1]}
${sentence[2]}
${sentence[3]}
${sentence[4]}
${sentence[5]}
${sentence[6]}`,
                        Markup.inlineKeyboard([
                    		Markup.callbackButton('👍', 'true'),
                            Markup.callbackButton('👎', 'false')
                    	]).extra());
}

bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log('Response time: %sms', ms);
});

// добавить везде нормальные ответы
bot.on('text', (ctx) => {
    console.log(ctx.message.from.username);

    fs.readFile('db.json', (err, buffer) => {
        let DB = JSON.parse(buffer.toString());

        const CHAT_ID = ctx.update.message.chat.id;
        if (!DB[CHAT_ID]) {
            DB[CHAT_ID] = {};
        }

        const mes = ctx.message.text.split(' ');
        if (mes.length == 2) {
            const command = mes[0];
            const text = mes[1];
            const user = ctx.message.from.username;

            switch (command) {
                // создание места
                case '/create':
                    if (!DB[CHAT_ID][text]) {
                        DB[CHAT_ID][text] = [];
                        ctx.reply(`Комната ${text} - создана!`);
                    } else {
                        ctx.reply(`Комната ${text} - уже есть))))
Придумай другое название, долбаёб`);
                    }
                    break;
                // удаление места
                case '/delete':
                    if (DB[CHAT_ID][text]) {
                        delete DB[CHAT_ID][text];
                        ctx.reply(`Комната ${text} удалилась нахуй`);
                    } else {
                        ctx.reply(`Такой хуйни нет!`);
                    }
                    break;
                case '/go':
                    let users =  "@" + DB[CHAT_ID][text].join(', @');
ctx.reply(`Го ${text}
${users}
👍:

👎:

Голосуй, блять!`,
                    Markup.inlineKeyboard([
                		Markup.callbackButton('👍', 'true'),
                        Markup.callbackButton('👎', 'false')
                	]).extra());
                    break;
                // добаится в место на зазывание
                case '/join':
                    console.log(DB[CHAT_ID][text].indexOf(user));
                    if (DB[CHAT_ID][text].indexOf(user) < 0) {
                        DB[CHAT_ID][text].push(`${ctx.message.from.username}`);
                        ctx.reply(`Теперь ${user} в ${text}`);
                    } else {
                        ctx.reply(`Ты уже в комнате, долбаёб`);
                    }
                    break;
                // выйти из места на зазывание
                case '/leave':
                    console.log(DB[CHAT_ID][text].indexOf(user));
                    if (DB[CHAT_ID][text].indexOf(user) >= 0) {
                        DB[CHAT_ID][text].splice(DB[CHAT_ID][text].indexOf(user), 1);
                        ctx.reply(`Ну и иди нахуй`);
                    } else {
                        ctx.reply(`Тебя нет в комнате!!
АХХАХАХАхаХАХАХХАХАХА
ЧСВ долбаёб`);
                    }
                    break;
                case '/help':
                    ctx.reply(`Создать комнату:
/create {имя комнаты}

Удалить комнату:
/delete {имя комнаты}

Войти в комнату:
/join {имя комнаты}

Выйти из комнаты:
/leave {имя комнаты}

Позвать членов комнаты:
/go {имя комнаты}`);
                    break;
                default:
                    break;
            }
        }

        let data = JSON.stringify(DB);
        fs.writeFileSync('db.json', data);
    });
});

bot.action('true', (ctx) => {
    let count = [1, 5];
    let is = 3;
    reVote(ctx, count, is);
});

bot.action('false', (ctx) => {
    let count = [1, 3];
    let is = 5;
    reVote(ctx, count, is);
});

bot.launch();
