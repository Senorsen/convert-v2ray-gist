const Koa = require('koa')
const app = new Koa()
const fetch = require('node-fetch')
const getUrl = secret => /* Format: "/username/hash" */ /^\/[^/]+\/\w+$/.test(secret) && `https://gist.github.com${secret}/raw`

app.use(async ctx => {
  const url = getUrl(ctx.request.path)
  if (!url) {
    ctx.status = 400
    ctx.body = 'Invalid argument'
  } else {
    const json = await (await fetch(url)).json()
    ctx.body = Buffer.from(
      json
        .map(it => Object.assign({v: '2'}, it))
        .map(it => 'vmess://' + Buffer.from(JSON.stringify(it)).toString('base64'))
        .join("\n")
    ).toString('base64')
  }
})

app.listen(3000)
