import { Context, Service } from '@satorijs/core'
import { Client, Entry, Events } from '@cordisjs/plugin-webui'

export class ImEntry extends Entry {
  constructor(
    public ctx: Context,
    public files: Entry.Files,
    public data: (client: Client) => any
  ) {
    super(ctx, files, data)
  }

  unicast(clientId: string, data: any) {
    const client = this.ctx.webui.clients[clientId]
    if (client) {
      const payload = {
        type: 'entry:update',
        body: { id: this.id, data: { ...this.data?.(client), ...data } },
      }
      client.socket.send(JSON.stringify(payload))
    }
  }

  unirefresh(clientId: string) {
    const client = this.ctx.webui.clients[clientId]
    if (client) {
      const payload = { type: 'entry:refresh', body: { id: client.id, data: this.data?.(client) } }
      client.socket.send(JSON.stringify(payload))
    }
  }

  unipatch(clientId: string, data: any, key?: string) {
    const client = this.ctx.webui.clients[clientId]
    if (client) {
      const payload = { type: 'entry:patch', body: { id: this.id, data, key } }
      client.socket.send(JSON.stringify(payload))
    }
  }
}

export class EntryService extends Service {
  static inject = ['webui', 'server', 'im', 'im.auth']
  public entry: ImEntry

  constructor(public ctx: Context) {
    super(ctx, 'im.entry')
    this.entry = new ImEntry(
      ctx,
      {
        base: import.meta.url,
        dev: '../client/index.ts',
        prod: ['../dist/index.js', '../dist/style.css'],
      },
      (client: Client) => ({
        serverUrl: ctx.server.selfUrl,
        eventChan: {},
      })
    )
  }
}
