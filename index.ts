import { Bot, Context, InputFile } from 'grammy';
import type { InputMediaPhoto } from 'grammy/types';
import { run } from "@grammyjs/runner";

if (!process.env.BOT_TOKEN) {
    throw new Error('BOT_TOKEN is required');
}
const bot = new Bot<Context>(process.env.BOT_TOKEN);

const apiEndpoints = {
  dalle3: 'https://sanchitximage.onrender.com/dall-e-3/prompt=',
  sdxl: 'https://sanchitximage.onrender.com/stable-diffusion/prompt=',
  oj: 'https://sanchitximage.onrender.com/open-journey/prompt='
};


type Dalle3ApiResponse = {
    "S1-Image": string;
    "S2-Image": string;
    "S3-Image": string;
    "S4-Image": string;
  };

type ImageGenApiResponse = {
    "img": string;
    "prompt": string;
};
     

const generateDalle3Image = async (endpoint: string, prompt: string) => {
  const url = `${endpoint}${encodeURIComponent(prompt)}`;
  const response = await fetch(url);
  return response.json() as Promise<Dalle3ApiResponse>;
};

const generateImage = async (endpoint: string, prompt: string) => {
    const url = `${endpoint}${encodeURIComponent(prompt)}`;
    const response = await fetch(url);
    return response.json() as Promise<ImageGenApiResponse>;
}

const processCommand1 = async (ctx: Context, endpoint: string) => {
  const prompt = ctx.message?.text?.split(' ').slice(1).join(' ');
  if (!prompt) {
    await ctx.reply('Please provide a prompt.');
    return;
  }
  const {message_id} = await ctx.reply('Processing...');
  try {
    const data = await generateDalle3Image(endpoint, prompt)
    const imgUrls = [data["S1-Image"], data["S2-Image"], data["S3-Image"], data["S4-Image"]];
    const media = imgUrls.map((url, i) => {
        const mediaPhoto = url;
        const media = { type: 'photo', media: mediaPhoto, caption: i === 0 ? prompt : undefined } as InputMediaPhoto;
        return media;
    });
    await ctx.replyWithMediaGroup(media, { reply_to_message_id: ctx.message?.message_id });
    await ctx.api.deleteMessage(ctx.chat?.id!, message_id);
  } catch (error) {
    await ctx.api.deleteMessage(ctx.chat?.id!, message_id);
    await ctx.reply('Failed with error: ' + error);
  }
};

const processCommand2 = async (ctx: Context, endpoint: string) => {
    // send the prompt 4 times, dalle3 gens 4 imgs, but sd and oj gen 1 img
    const prompt = ctx.message?.text?.split(' ').slice(1).join(' ');
    if (!prompt) {
      await ctx.reply('Please provide a prompt.');
      return;
    }
    const {message_id} = await ctx.reply('Processing...');
    try {
        const data = await Promise.all(
            [0, 1, 2, 3].map(async () => {
                const data = await generateImage(endpoint, prompt);
                return data;
            })
        );
        const imgUrls = data.map(d => d.img);
        const media = imgUrls.map((url,i) => {
            const mediaPhoto = url;
            const media = { type: 'photo', media: mediaPhoto, caption: i === 0 ? prompt : undefined } as InputMediaPhoto;
            return media;
        });
        await ctx.api.deleteMessage(ctx.chat?.id!, message_id);
        await ctx.replyWithMediaGroup(media, { reply_to_message_id: ctx.message?.message_id });
    } catch (error) {
        await ctx.api.deleteMessage(ctx.chat?.id!, message_id);
        await ctx.reply('Failed with error: ' + error);
    }
};


bot.command('dalle3', ctx => processCommand1(ctx, apiEndpoints.dalle3));
bot.command('sdxl', ctx => processCommand2(ctx, apiEndpoints.sdxl));
bot.command('oj', ctx => processCommand2(ctx, apiEndpoints.oj));
bot.command('start', ctx => ctx.reply('Welcome! Use /dalle3, /dalle2, /sdxl or /oj to generate images.'));
bot.api.setMyCommands([
    { command: 'dalle3', description: 'Generate images using DALL-E 3.' },
    { command: 'sdxl', description: 'Generate images using SDXL.' },
    { command: 'oj', description: 'Generate images using Open Journey.' },
    { command: 'start', description: 'Start the bot.' },
]);

run(bot);

/// Path: ecosystem.config.js

