const { Client, Intents, MessageAttachment } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
const Canvas = require('canvas');
const fs = require('fs');
const axios = require('axios');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

const allowedUserId = '1251301970dsada61347374';

client.on('ready', async () => {
    console.log(`${client.user.username} is ready!`);
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('^')) {
        const args = message.content.slice(1).trim().split(' ');
        const command = args.shift().toLowerCase();

        // "-python" コマンドが送信されたら、Pythonの公式サイトへのリンクを送信する
        if (command === 'python') {
            message.channel.send('https://www.python.org/');
        }

        // "-help" コマンド
        if (command === 'help') {
            const helpMessage = `
                使い方:
                ^javascript: javascriptの公式サイトへのリンクを表示します。
                ^help: このヘルプメッセージを表示します。
                ^status: カスタムステータスを設定します。
                ^mention <ユーザーID>: 指定されたユーザーをメンションします。
                ^vc <チャンネルID>: 指定されたボイスチャンネルに参加します。
                ^icon <ユーザーID>: 指定されたユーザーのアイコンを表示します。
                ^header <ユーザーID>: 指定されたユーザーのヘッダーを表示します。
                ^friend <ユーザー名>: フレンド申請を送信します、キャプチャーによりほとんど使用できません。
                ^group <ユーザーID> <作成する数>: グループDMを作成します、キャプチャーによりほとんど使用できません。
                ^miaq: メッセージを引用します。
                ^translate <言葉>: 指定された言葉を日本語に翻訳します。
                ^fakemiaq userid text その人のfakemiaqを作成します。
            `;
            message.channel.send(helpMessage);
        }

        // "-python bot" を送信したらカスタムステータスを設定する
        if (command === 'status' && args[0] === 'bot') {
            client.user.setPresence({
                activities: [{ name: 'status！！', type: 'PLAYING' }],
                status: 'online'
            });
            message.channel.send('statusを設定しました');
        }

        // "-mention <ユーザーID>" コマンドで指定されたユーザーをメンションする
        if (command === 'mention' && args.length > 0) {
            const userId = args[0];
            try {
                const user = await client.users.fetch(userId);
                if (user) {
                    message.channel.send(`指定されたユーザー: <@${userId}>`);
                } else {
                    message.channel.send('指定されたユーザーを見つけることができませんでした。');
                }
            } catch (error) {
                console.error('ユーザーをメンション中にエラーが発生しました:', error);
                message.channel.send('ユーザーをメンションできませんでした。');
            }
        }

        // "-vc <チャンネルID>" コマンドで指定されたボイスチャンネルに参加する
        if (command === 'vc' && args.length > 0) {
            const channelId = args[0];
            const channel = client.channels.cache.get(channelId);
            if (channel && channel.isVoice()) {
                try {
                    joinVoiceChannel({
                        channelId: channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator
                    });
                    message.channel.send(`ボイスチャンネルに参加しました: ${channel.name}`);
                } catch (error) {
                    console.error('ボイスチャンネルに参加中にエラーが発生しました:', error);
                    message.channel.send('ボイスチャンネルに参加できませんでした。');
                }
            } else {
                message.channel.send('無効なチャンネルIDです。');
            }
        }

        // "死ね" メッセージに "sine" リアクションを追加する
        if (command === '死ね') {
            try {
                await message.react('🇸');
                await message.react('🇮');
                await message.react('🇳');
                await message.react('🇪');
            } catch (error) {
                console.error('リアクションの追加中にエラーが発生しました:', error);
            }
        }

        // "-icon <ユーザーID>" コマンドで指定されたユーザーのアイコンを送信する
        if (command === 'icon' && args.length > 0) {
            const userId = args[0];
            try {
                const user = await client.users.fetch(userId);
                const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });
                message.channel.send(`ユーザー ${user.tag} のアイコン: ${avatarUrl}`);
            } catch (error) {
                console.error('ユーザーのアイコンを取得中にエラーが発生しました:', error);
                message.channel.send('ユーザーのアイコンを取得できませんでした。');
            }
        }

        // "-header <ユーザーID>" コマンドで指定されたユーザーのヘッダーを送信する
        if (command === 'header' && args.length > 0) {
            const userId = args[0];
            try {
                const user = await client.users.fetch(userId);
                const bannerUrl = user.bannerURL({ dynamic: true, size: 1024 });
                if (bannerUrl) {
                    message.channel.send(`ユーザー ${user.tag} のヘッダー: ${bannerUrl}`);
                } else {
                    message.channel.send('ユーザーはヘッダーを設定していません。');
                }
            } catch (error) {
                console.error('ユーザーのヘッダーを取得中にエラーが発生しました:', error);
                message.channel.send('ユーザーのヘッダーを取得できませんでした。');
            }
        }

        // "-quote <メッセージID>" コマンドで指定されたメッセージを引用する
        if (command === 'quote' && args.length > 0) {
            const messageId = args[0];
            try {
                const quotedMessage = await message.channel.messages.fetch(messageId);

                // Canvasで画像を生成
                const canvas = Canvas.createCanvas(1600, 900);
                const ctx = canvas.getContext('2d');

                // 背景を黒く塗る
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // ユーザーのアイコンを描画（アイコンを大きくし、下端まで届くようにする）
                const avatarSize = 500; // アイコンのサイズ
                const avatar = await Canvas.loadImage(quotedMessage.author.displayAvatarURL({ format: 'png' }));
                ctx.drawImage(avatar, 0, 0, avatarSize, canvas.height);

                // メッセージテキストを描画
                ctx.font = '48px sans-serif';
                ctx.fillStyle = '#ffffff';
                const textWidth = canvas.width - avatarSize - 40; // テキストの幅
                const textX = avatarSize + 20; // テキストのX座標
                let textY = 100; // テキストの初期Y座標

                // テキストを折り返して描画する
                const lines = wrapText(ctx, quotedMessage.content, textWidth);
                for (const line of lines) {
                    ctx.fillText(line, textX, textY);
                    textY += 60; // 次の行のY座標を調整
                }

                // ユーザー名を描画
                ctx.fillText(`- ${quotedMessage.author.tag}`, textX, textY + 80);

                // 画像をバッファとして作成
                const buffer = canvas.toBuffer();
                const attachment = new MessageAttachment(buffer, 'quote.png');

                // 画像を送信
                message.channel.send({ files: [attachment] });

            } catch (error) {
                console.error('メッセージの引用中にエラーが発生しました:', error);
                message.channel.send('メッセージを引用できませんでした。');
            }
        }

        // "-friend username" コマンドでフレンド申請を送信する
        if (command === 'friend' && args.length > 0) {
            const username = args[0];
            try {
                const user = await client.users.fetch(username);
                if (user) {
                    await user.sendFriendRequest();
                    message.channel.send(`We're now friends with ${user.tag}!`);
                } else {
                    message.channel.send('指定されたユーザーを見つけることができませんでした。');
                }
            } catch (error) {
                console.error('フレンド申請の送信中にエラーが発生しました:', error);
                message.channel.send('フレンド申請を送信できませんでした。');
            }
        }

        // "-group userid 作成する数" コマンドで指定された数だけグループDMを作成する
        if (command === 'group' && args.length === 2) {
            const userId = args[0];
            const count = parseInt(args[1], 10);

            if (!userId || isNaN(count) || count <= 0) {
                message.channel.send('無効なコマンド形式です。使用方法: -group userid 作成する数');
                return;
            }

            try {
                const user = await client.users.fetch(userId);
                if (!user) {
                    message.channel.send('指定されたユーザーを取得できませんでした。');
                    return;
                }

                for (let i = 0; i < count; i++) {
                    await user.createDM()
                        .then(dmChannel => {
                            message.channel.send(`グループDM ${i + 1} が作成されました。`);
                        })
                        .catch(error => {
                            console.error('グループDMの作成中にエラーが発生しました:', error);
                            message.channel.send(`グループDM ${i + 1} を作成できませんでした。`);
                        });
                }
            } catch (error) {
                console.error('ユーザーの取得中にエラーが発生しました:', error);
                message.channel.send('ユーザーを取得できませんでした。');
            }
        }
        if (command === 'fakemiaq') {
            if (args.length >= 2) {
                const userId = args[0];
                const userMessage = args.slice(1).join(' ');
        
                try {
                    const user = await client.users.fetch(userId);
        
                    if (user) {
                        const payload = {
                            username: user.username,
                            display_name: user.username,
                            text: userMessage,
                            avatar: user.displayAvatarURL({ format: 'png' }),
                            color: true
                        };
        
                        const response = await axios.post('https://api.voids.top/quote', payload);
                        const quoteUrl = response.data.url;
                        message.channel.send(quoteUrl);
                    } else {
                        message.channel.send('指定されたユーザーを見つけることができませんでした。');
                    }
                } catch (error) {
                    console.error('ユーザーの取得中にエラーが発生しました:', error);
                    message.channel.send('ユーザーの情報を取得できませんでした。');
                }
            } else {
                message.channel.send('ユーザーIDとテキストを指定してください。');
            }
        }
        

        // "-miaq" コマンドでメッセージを引用する
        if (command === 'miaq') {
            if (args.length >= 2) {
                const userId = args[0];
                const userMessage = args.slice(1).join(' ');

                try {
                    const user = await client.users.fetch(userId);

                    if (user) {
                        // Canvasで画像を生成
                        const canvas = Canvas.createCanvas(1600, 900);
                        const ctx = canvas.getContext('2d');

                        // 背景を黒く塗る
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        // ユーザーのアイコンを描画（アイコンを大きくし、下端まで届くようにする）
                        const avatarSize = 500; // アイコンのサイズ
                        const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png' }));
                        ctx.drawImage(avatar, 0, 0, avatarSize, canvas.height);

                        // メッセージテキストを描画
                        ctx.font = '48px sans-serif';
                        ctx.fillStyle = '#ffffff';
                        const textWidth = canvas.width - avatarSize - 40; // テキストの幅
                        const textX = avatarSize + 20; // テキストのX座標
                        let textY = 100; // テキストの初期Y座標

                        // テキストを折り返して描画する
                        const lines = wrapText(ctx, userMessage, textWidth);
                        for (const line of lines) {
                            ctx.fillText(line, textX, textY);
                            textY += 60; // 次の行のY座標を調整
                        }

                        // ユーザー名を描画
                        ctx.fillText(`- ${user.tag}`, textX, textY + 80);

                        // 画像をバッファとして作成
                        const buffer = canvas.toBuffer();
                        const attachment = new MessageAttachment(buffer, 'quote.png');

                        // 画像を送信
                        message.channel.send({ files: [attachment] });
                    } else {
                        message.channel.send('指定されたユーザーを見つけることができませんでした。');
                    }
                } catch (error) {
                    console.error('ユーザーの取得中にエラーが発生しました:', error);
                    message.channel.send('ユーザーの情報を取得できませんでした。');
                }
            } else {
                try {
                    const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                    const payload = {
                        username: referencedMessage.author.username,
                        display_name: referencedMessage.member ? referencedMessage.member.displayName : referencedMessage.author.username,
                        text: referencedMessage.content,
                        avatar: referencedMessage.author.displayAvatarURL({ format: 'png' }),
                        color: true
                    };

                    const response = await axios.post('https://api.voids.top/quote', payload);
                    const quoteUrl = response.data.url;
                    message.channel.send(quoteUrl);
                } catch (error) {
                    console.error('引用の作成中にエラーが発生しました:', error);
                    message.channel.send('引用を作成できませんでした。');
                }
            }
        }

        // "-translate <言葉>" コマンドで指定された言葉を日本語に翻訳する
        if (command === 'translate' && args.length > 0) {
            const textToTranslate = args.join(' ');
            try {
                const response = await axios.post('https://libretranslate.de/translate', {
                    q: textToTranslate,
                    source: 'en',
                    target: 'ja',
                    format: 'text'
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });

                const translatedText = response.data.translatedText;
                message.channel.send(`翻訳されたテキスト: ${translatedText}`);
            } catch (error) {
                console.error('翻訳中にエラーが発生しました:', error);
                message.channel.send('翻訳できませんでした。');
            }
        }
    }
});

// テキストの折り返し関数
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

client.login('MTI2MTcyODA0NjQxOTgwNDIzMQ.Geca8T.JFznN_0PX5MgDtEmZ5y4r9_YkD4cFP3DzwDRVo');
