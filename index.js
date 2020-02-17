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
    const type = ctx.request.query.type
    console.log(type)
    if (!type || type === 'v2ray') {
      ctx.body = Buffer.from(
        json
          .map(it => Object.assign({v: '2'}, it))
          .map(it => 'vmess://' + Buffer.from(JSON.stringify(it)).toString('base64'))
          .join("\n")
      ).toString('base64')
    } else if (type === 'quantumult' || type.startsWith('quan')) {
      const group = json[0].group
      ctx.body = Buffer.from(
        json
          .map(it => 'vmess://' + Buffer.from(`${it.ps} = vmess,${it.add},${it.port},chacha20-ietf-poly1305,"${it.id}",group=${it.group || group},over-tls=${it.tls === 'tls' ? 'true' : 'false'},certificate=0,obfs=${it.net},obfs-path="${it.path}",obfs-header="Host:${it.host}[Rr][Nn]User-Agent:Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"`).toString('base64'))
          .join("\n")
      ).toString('base64')
    } else {
      ctx.status = 400
      ctx.body = 'Invalid required type'
    }
  }
})

app.listen(3000)
