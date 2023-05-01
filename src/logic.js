import { openai } from './openai.js'

const adminId = 81724667
let allowedUsers = [adminId]

export const INITIAL_SESSION = {
  messages: [],
}

function getId(ctx) {
  return ctx.message.from.id
}

async function doWihAdminCheck(ctx, fun) {
  if (getId(ctx) === adminId) {
    await fun()
  } else {
    await ctx.reply("Access denied")
  }
}

export async function addAllowedUser(ctx, newId) {
  doWihAdminCheck(ctx, () => {
    allowedUsers.push(newId)
    ctx.reply(`Added ${newId}`)
  })
}

export async function removeAllowedUser(ctx, id) {
  doWihAdminCheck(ctx, () => {
    if (id !== adminId) {
      allowedUsers = allowedUsers.filter(e => e !== id)
      ctx.reply(`Removed ${id}`)
    } else {
      ctx.reply(`Noob, you can't delete admin`)
    }
  })
}

export async function listAllowedUsers(ctx) {
  doWihAdminCheck(ctx, () => ctx.reply(`${allowedUsers}`))
}

export async function initCommand(ctx) {
  ctx.session = INITIAL_SESSION
  await ctx.reply('Жду вашего голосового или текстового сообщения')
}

export async function handleMessage(ctx) {
  if (allowedUsers.includes(getId(ctx))) {
    await ctx.reply(code('Сообщение принял. Жду ответ от сервера...'))
    await processTextToChat(ctx, ctx.message.text)
  } else {
    await ctx.reply(`Access denied. Your id is ${getId(ctx)}.`)
  }
}

export async function processTextToChat(ctx, content) {
  try {
    ctx.session.messages.push({ role: openai.roles.USER, content })

    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    })

    await ctx.reply(response.content)
  } catch (e) {
    console.log('Error while proccesing text to gpt', e.message)
  }
}