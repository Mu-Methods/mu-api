export const name = 'muAPI'
export const version = require('../package.json')
import { API, Message, TieMessage, FeedID } from './api'

export const manifest = {
  connect: 'async',
  generateInvite: 'async',
  openInvite: 'async',
  acceptInvite: 'async',
  close: 'async',
  //getAccounts: 'async',
  getFeed: 'async',
  //createNewAccount: 'async',
  tie: 'async',
  acceptTie: 'async',
  cut: 'async',
  publish: 'async',
  block: 'async',
  getNetId: 'async'
}

export const init = (api: API) => {
  return {
    connect: connect.bind(null, api),
    generateInvite: generateInvite.bind(null, api),
    openInvite: openInvite.bind(null, api),
    acceptInvite: acceptInvite.bind(null, api),
    close: close.bind(null, api),
    getAccounts: getAccounts.bind(null, api),
    getFeed: getFeed.bind(null, api),
    createNewAccount: createNewAccount.bind(null, api),
    tie: tie.bind(null, api),
    acceptTie: acceptTie.bind(null, api),
    cut: cut.bind(null, api),
    publish: publish.bind(null, api),
    block: block.bind(null, api),
    getNetId: getNetId.bind(null, api)
  }
}

function errHandler (err:any) {
  if (err) throw err
  return true
}

/*
async function createNewAccount (api: API, helloMessage:HelloMessage): Promise<Account> {
  await api.keys.generate().then(account => {
    api.db.create( { content: helloMessage, keys: account } )
  })
}
*/
/*
async function getAccounts (api: API): Promise<string[]> {
  await api.db.feed.filter(msg => {
    msg.content.type === 'account'
  })
}
*/

async function connect (api: API, address: unknown): Promise<boolean> {
  return await api.connect(address, errHandler)
}

async function generateInvite (api: API, id?: FeedID, toAddress?:string, asLink?:boolean): Promise<Invite | string> {
  return await api.peerInvites.create(id, toAddress, errHandler)
}

async function openInvite (invite:Message):Promise<boolean> {
  return await api.peerInvites.openInvite(invite, errHandler) 
}


async function acceptInvite (invite:Message):Promise<boolean> {
  return await api.peerInvites.acceptInvite(invite, errHandler)
}

async function close (api: API): Promise<boolean> {
  return await api.close().then(errHandler)
}

async function getFeed (api: API): Promise<Message[]> {
  return await api.db.feed
}

async function tie (api: API, master:string, accountToTie:string):  Promise<boolean> {
  return await api.muTie.tie(master, accountToTie)
}

async function acceptTie (api: API, initialTie:TieMessage):  Promise<boolean> {
  return await api.muTie.acceptTie(initialTie)
}

async function cut (api: API, tieToCut:TieMessage) :  Promise<boolean> {
  return await api.muTie.cut(tieToCut)
}

async function publish (api: API, userKeys: Array<string>, content:any, recipients: Array<string>): Promise<boolean> {
  return await api.db.create( { content: content, keys: userKeys, recps: recipients } )
}

async function block (api: API, pubKey: string): Promise<boolean> {
  return await api.friends.block(pubKey)
}

async function getNetId (api: API): Promise<string> {
  return await api.muCaps.shs
}
