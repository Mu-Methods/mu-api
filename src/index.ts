export const name = 'muAPI'
export const version = require('../package.json')
import { API, MSG, Message, TieMessage, FeedID, Invite, Account, Contacts, ShardOpts, MigrateOpts, FriendOpts, BlockOpts } from './types'

export const manifest = {
  initAccount: 'async',
  connect: 'async',
  close: 'async',
  publish: 'async',



  generateInvite: 'async',
  openInvite: 'async',
  acceptInvite: 'async',

  getAccounts: 'async',
  getFeed: 'async',
  getNetId: 'async',
  findName: 'async',
  findContactDetails: 'async',

  tie: 'async',
  //setTiePermissions
  acceptTie: 'async',
  cut: 'async',

  generateSeedphrase: 'async',
  //readSeedphrase
  //verifySeedphrase
  shareSeedphrase: 'async',

  shardSecret: 'async',

  migrate: 'async',

  addPeer: 'async',
  followPeer: 'async',
  blockPeer: 'async',
  getPeers: 'async',

  //generateQR
  //generateSeedphrase
}

export const init = (api: API) => {
  return {
    initAccount: initAccount.bind(null, api),
    connect: connect.bind(null, api),
    close: close.bind(null, api),
    publish: publish.bind(null, api),

    generateInvite: generateInvite.bind(null, api),
    openInvite: openInvite.bind(null, api),
    acceptInvite: acceptInvite.bind(null, api),

    getAccounts: getAccounts.bind(null, api),
    getFeed: getFeed.bind(null, api),
    getNetId: getNetId.bind(null, api),
    findName: findName.bind(null, api),
    findContactDetails: findContactDetails.bind(null, api),

    tie: tie.bind(null, api),
    acceptTie: acceptTie.bind(null, api),
    cut: cut.bind(null, api),

    generateSeedphrase: generateSeedphrase.bind(null, api),
    shareSeedphrase: shareSeedphrase.bind(null, api),

    shardSecret: shardSecret.bind(null, api),

    migrate: migrate.bind(null, api),

    addPeer: addPeer.bind(null, api),
    followPeer: followPeer.bind(null, api),
    blockPeer: blockPeer.bind(null, api),
    getPeers: getPeers.bind(null, api)
  }
}

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

async function initAccount (api, opts): Promise<Account> {
  await api.keyring.createMnemonic
  const keys = api.createNewKeys()
  return await new Promise((res, reject) => {
    api.db.create({keys, content: {
      type: 'account#init',
      ...opts
    }}, (err, message) => {
      if (err) reject(err)
      else res(message)
    })
  })
}
// #

// #addPeer


async function getAccounts (api: API): Promise<Array<Account>> {
  try {

  } catch (e) {

  }

  const accounts: Array<Account> = []
  api.keyring.getKeys().forEach(async (keyObj: FeedID) => {
    const initMessages = await api.db.query(api.db.where(api.db.and(api.db.author(keyObj.id), api.db.type('account#init'))), api.db.toPromise())
    const initMessage = {}
    if (initMessages[0] &&
      initMessages[0].value &&
      initMessages[0].value.content) Object.assign(initMessage, initMessages[0].value.content)
    const [name, contacts, ties, keepers] = await Promise.all([
      findName(api, keyObj),
      findContactDetails(api, keyObj),
      api.muTie.getTies(keyObj).map((tieMsg) => {
        if (tieMsg.key !== keyObj.public) return tieMsg.key
        return ''
      }).filter(msg => msg),
      api.sss.getKeepers(keyObj)
    ])
    const account:Account = {
      ...initMessage,
      id: keyObj.id,
      public: keyObj.public,
      curve: keyObj.curve,
      ...contacts,
      name: name,
      ties: ties,
      keepers: keepers,
    }
    accounts.push(account)
  })
  return accounts
}

async function findName (api, keyObj):Promise<string> {
  let name
  const nameMessages = await api.db.query(api.db.where(api.db.and(api.db.author(keyObj.id), api.db.type('account#name'))), api.db.toPromise()).then((res) => {
    const lastName = nameMessages.sort((m1, m2) => {
      return m1.value.sequence > m2.value.sequence ? 1 : -1
    }).pop()
    if (!lastName ||
      !lastName.value ||
      !lastName.value.content ||
      !lastName.value.content.name ) return
      name = lastName.value.content.name
      res(lastName)
    })
  return name
}

async function findContactDetails (api, keyObj) {
  const contacts:Contacts = {
    peers: [],
    blocked: [],
  }

  const res = await api.db.query(api.db.where(api.db.contact(keyObj.id)), api.db.toPromise())
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
    newInvite = { id: netId }
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

async function tie (api: API, start: FeedID, end: FeedID):  Promise<boolean> {
  return await api.muTie.tie({start: start, end: end})
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

async function addPeer (api: API, address:unknown) : Promise<boolean> {
  return await connect(api, address)
}

async function followPeer (api: API, peer: FeedID, opts: FriendOpts): Promise<Message> {
  return new Promise ((resolve, reject) => {
    api.friends.follow(peer, opts, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

async function blockPeer (api: API, peer: FeedID, opts: BlockOpts): Promise<Message> {
  return new Promise ((resolve, reject) => {
    api.friends.block(peer, opts, (err, res) => {
      if (err) reject(err)
      resolve(res)
    })
  })
}

async function getPeers (api: API, cb?: Function): Promise<Object> {
  return new Promise ((resolve, reject) => {
    cb ||= (err, res) => {
      if (err) reject(err)
      resolve(res)
    }
    api.friends.graph(cb)
  })
}

async function getNetId (api: API): Promise<string> {
  return await api.muCaps.shs
}

async function generateSeedphrase (api: API): Promise<string> {
  return await api.keyring.createMnemonic()
}

/*
async function readSeedphrase () { 
}

async function verifySeedphrase (api:API, strToVerify: string) {
}
*/

async function shareSeedphrase (api: API, opts:ShardOpts) {
  return await shardSecret(api, opts)
}

async function shardSecret (api:API, opts: ShardOpts) {
  return await api.sss.shardAndSend(opts)
}

//for regularly scheduled key maintenance
async function migrate(api:API, opts: MigrateOpts):Promise<FeedID> {
  return new Promise ((resolve, reject) => {
    const newKey = api.keyring.generate()
    api.db.query(async (err:any, msgs:MSG[]) => {
      if (err) reject(err)
      msgs.forEach((msg:MSG) => {
        if (typeof msg.value !== 'string' && msg.value.content) {
          api.db.create({
            keys: newKey,
            feedFormat: opts.feedFormat,
            encryptionFormat: opts.encryptionFormat,
            encoding: opts.encoding,
            content: msg.value.content,
            recps: msg.value.recps,
          })
        }
      })
    })
    resolve(newKey)
  })
  //migrate messages from old key
  //and republish on new key
  //simultaneously create a tie between both keys
  //decrypt the entire database and reencrypt it to all the original recipients
  //extra parameter: destroy: cut message from the new account after migration process over or block the old account.
  //store new key in the keyring
  //optional parameter for create new mnemonic to include in key object
  //type parameter
}

