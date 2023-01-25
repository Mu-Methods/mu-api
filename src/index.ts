const { where, and, type, author, toPromise } = require('ssb-db2/operators')

export const name = 'muAPI'
export const version = require('../package.json')
import { API, Message, TieMessage, FeedID, Invite, Account } from './types'

export const manifest = {
  connect: 'async',
  generateInvite: 'async',
  openInvite: 'async',
  acceptInvite: 'async',
  close: 'async',
  getAccounts: 'async',
  getFeed: 'async',
  initAccount: 'async',
  tie: 'async',
  acceptTie: 'async',
  cut: 'async',
  publish: 'async',
  block: 'async',
  getNetId: 'async',
  findName: 'async',
  findContactDetails: 'async'
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
    initAccount: initAccount.bind(null, api),
    tie: tie.bind(null, api),
    acceptTie: acceptTie.bind(null, api),
    cut: cut.bind(null, api),
    publish: publish.bind(null, api),
    block: block.bind(null, api),
    getNetId: getNetId.bind(null, api),
    findName: findName.bind(null, api),
    findContactDetails: findContactDetails.bind(null, api)
  }
}


// #initAccount
// check to see if their is a mnemonic
// if not create mnemonic
// create first key or next key
// publish hello world message
// connect to room (#acceptInvite)
//

/*
function initAccount () {

}
*/
// #

// #addPeer

/*
async function createNewAccount (api: API, helloMessage:HelloMessage): Promise<Account> {
  await api.keyring.generate().then(account => {
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

async function getAccounts (api: API): Promise<Account[]> {
  const accounts: Account[]= []
  api.keyring.getKeys().forEach(async (keyObj) => {
    const initMessages = await api.db.query(where(and(author(keyObj.id), type('account#init'))), toPromise())
    const initMessage = {}
    if (initMessages[0] &&
      initMessages[0].value &&
      initMessages[0].value.content) Object.assign(initMessage, initMessages[0].value.content)
    const [nick_name, contacts, ties, keepers] = await Promise.all([
      findName(api, keyObj),
      findContactDetails(api, keyObj),
      api.muTie.getTies(),
      api.sss.getKeepers(keyObj)
    ])
    const account = {
      ...initMessage,
      id: keyObj.id,
      public: keyObj.public,
      curve: keyObj.curve,
      ...contacts,
      nick_name,
      ties,
      keepers,
    }



  })
  return accounts
}

async function findName (api, keyObj) {
  let nick_name
  const nameMessages = await api.db.query(where(and(author(keyObj.id), type('account#name'))), toPromise()).then((res) => {
  const lastName = nameMessages.sort((m1, m2) => {
    return m1.value.sequence > m2.value.sequence ? 1 : -1
  }).pop()
  if (!lastName ||
    !lastName.value ||
    !lastName.value.content ||
    !lastName.value.content.name ) return
  nick_name = lastName.value.content.name
  })
  return nick_name
}

async function findContactDetails (api, keyObj) {
  const contacts = {
    peers: [],
    blocked: [],
  }

  const res = await api.db.query(where(contact(keyObj.id)), toPromise())
  res.sort((m1, m2) => {
    return m1.value.sequence > m2.value.sequence ? 1 : -1
  }).reduce((ac, message) => {
    if (!message ||
      !message.value ||
      !message.value.content ||
      !message.value.content.contact ) return
    // if fowlling and not already in peer list add to peer list
      // if also in blocked and is now a peer remove from block list
    if (message.value.content.following && !contacts.peers.includes(message.value.content.contact)) {
      ac.peers.push(message.value.content.contact)
      if (ac.blocked.includes(message.value.content.contact)) {
        ac.blocked = ac.blocked.reduce((blocked, peer) => {
          if (peer === message.value.content.contact) return blocked
          blocked.push(peer)
          return blocked
        }, [])
      }
    }
    // if blocking and not already in block list add to blocked list
      // if also in peer and is now a blocked remove from peer list
    if (message.value.content.blocking && !contacts.blocked.includes(message.value.content.contact)) {
      ac.blocked.push(message.value.content.contact)
      if (ac.peers.includes(message.value.content.contact)) {
        ac.peers = ac.peers.reduce((peers, peer) => {
          if (peer === message.value.content.contact) return peers
          peers.push(peer)
          return peers
        }, [])
      }
    }
  }, contacts)
  return contacts
}


async function connect (api: API, address: unknown): Promise<boolean> {
  return new Promise((resolve, reject) => {
    api.connect(address, (err:any, res:any) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

async function generateInvite (api: API, netId: FeedID, recps?:Array<string>, /*asLink?:boolean*/): Promise<boolean> {
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

async function tie (api: API, accountToTie:string):  Promise<boolean> {
  return await api.muTie.tie({end: accountToTie})
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
