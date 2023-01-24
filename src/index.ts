const { where, and, type, author, toPromise } = require('ssb-db2/operators')

export const name = 'muAPI'
export const version = require('../package.json')
import { API, Message, TieMessage, FeedID, Invite } from './types'

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
    //getAccounts: getAccounts.bind(null, api),
    getFeed: getFeed.bind(null, api),
    //createNewAccount: createNewAccount.bind(null, api),
    //createRecovery,

    tie: tie.bind(null, api),
    acceptTie: acceptTie.bind(null, api),
    cut: cut.bind(null, api),
    publish: publish.bind(null, api),
    block: block.bind(null, api),
    getNetId: getNetId.bind(null, api)
  }
}


// #initAccount
// check to see if their is a mnemonic
// if not create mnemonic
// create first key or next key
// publish hello world message
// connect to room (#acceptInvite)
//

// #

// #addPeer

/*
async function createNewAccount (api: API, helloMessage:HelloMessage): Promise<Account> {
  await api.keys.generate().then(account => {
    api.db.create( { content: helloMessage, keys: account } )
  })
}
*/

/**
 * initAccount
 * • takes an encryption key aka password
 * • creates mnemonic
 * • creates new account keys out of mnemonic
 * • autoconnect: boolean
 * • pub to autoconnect to
 * • a curve, default ed25519. leave curve out for now, ed25519 will be only option. expand to more options later.
 * • return the account object
 * • set up recovery
 * expose friends dependency, rename getGraph to 
*/

async function getAccounts (api: API): Promise<string[]> {
  const accounts = []
  api.keys.getKeys().forEach((keyObj) => {
    const initMessages = await api.db.query(where(and(author(keyObj.id), type('account#init'))), toPromise())
    const initMessage = initMessages[0] || {}
    const account = {
      ...initMessage[0]
      id: keyObj.id,
      public: keyObj.public,
      ties: api.getTies
    }
    const feed = await api.db.query(where(author(keyObj.id)), toPromise())

    const nameMessages = await api.db.query(where(and(author(keyObj.id), type('account#name'))), toPromise())
    const contactMessages = await api.db.query(where(contact(keyObj.id)), toPromise()).sort((m1, m2) => {
     () m1.value.content.sequence > m2.value.content.sequence
    })

  })
}


async function connect (api: API, address: unknown): Promise<boolean> {
  return new Promise((resolve, reject) => {
    api.connect(address, (err:any, res:any) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

async function generateInvite (api: API, id: FeedID, recps?:Array<string>, /*asLink?:boolean*/): Promise<boolean> {
  return new Promise((resolve, reject) => {
    var newInvite:Invite
    newInvite = { id: id }
    if (recps) newInvite.pubs = recps
    api.peerInvites.create(newInvite, (err:any, res:any) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

async function openInvite (api: API, invite:Message):Promise<boolean> {
  return new Promise((resolve, reject) => {
    api.peerInvites.openInvite(invite, (err:any, res:any) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}


async function acceptInvite (api: API, invite:Message):Promise<boolean> {
  return new Promise ((resolve, reject) => {
    api.peerInvites.acceptInvite(invite, (err:any, res:any) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

async function close (api: API): Promise<boolean> {
  return await api.close()
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
