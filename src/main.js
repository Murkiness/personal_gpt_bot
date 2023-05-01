import { Telegraf, session, Markup } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
import { addAllowedUser, removeAllowedUser, listAllowedUsers, handleMessage, initCommand, INITIAL_SESSION } from './logic.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.command('menu', (ctx) => {
  ctx.reply('Choose an option:', Markup
    .keyboard([
      ['List allowed users', 'Print custom commands'],
    ])
    .oneTime()
    .resize()
  )
})

bot.hears('Print custom commands', (ctx) => {
  ctx.reply('Add user <id>, Remove user <id>')
})

bot.hears('List allowed users', (ctx) => {
  listAllowedUsers(ctx)
})

bot.hears(/Add user (\d+)$/, (ctx) => {
  addAllowedUser(ctx, ctx.match[1])
})

bot.hears(/Remove user (\d+)$/, (ctx) => {
  removeAllowedUser(ctx, ctx.match[1])
})

bot.command('new', initCommand)

bot.command('start', initCommand)

bot.on(message('text'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION
  try {
    await handleMessage(ctx)
  } catch (e) {
    console.log(`Error while voice message`, e.message)
  }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))