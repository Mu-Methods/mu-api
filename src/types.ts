export interface Message {
  author: string;
  backlink: string;
  hash: string;
  nonce: number | string;
  timestamp: number;
  content: any; // correct me
  signature: string;
}

export interface TieMessage extends Message {
  content: {
    type: 'account#tie';
    data: string | TieMessage;
  }
}


export type signature = string

/*
export interface Account {
  pubKey: string;
  permitionLevel: number;
  depth?: number;
  accountType?: string;
}
*/

export interface Account {
  id: string;
  public: string; // public key
  ties: string[]; //(list of tied accounts as public kyes)
  name?: string;
  curve: string; // non display (do not display to user)
  blocked: string[]; //(public keys that have been blocked)
  peers: string[]; // list of public keys
  chain_id?: string; // only present in keys that come from other protocols
  chain_name?: string; // only present in keys that come from other protocols
  keepers?: string[]; // public keys of people who store their shards
}


export interface FeedID {
  public: string;
  private: string;
  curve: string;
  id: string;
}

/*
export interface HelloMessage {
  permitionLevel: number;
  type?: string;
  accountType: string;
}
*/

interface DB {
  feed: Array<Message>;
  create: ( opts:Object ) => Promise<boolean>;
  query: any;
}

interface Opts {
  feedFormat?: string;
  keys?: FeedID;
  encryptionFormat?: string;
  encoding?: string;
}

export interface SendOpts extends Opts {
  content: object;
  recps?: Array<FeedID>
}

export interface ShardOpts extends Opts {
  threshold: number;
  random: boolean;
  secret: string;
  recps: Array<FeedID>
}

export interface MigrateOpts extends Opts {
  oldKey: FeedID;
  destroy: boolean;
}

export interface Invite {
  id: FeedID;
  pubs?: Array<string>;
}

interface PeerInvites {
  create: (newInvite: Invite, cb: Function) => Promise<boolean>;
  openInvite: (invite: Message, cb: Function) => Promise<boolean>;
  acceptInvite: (invite: Message, cb: Function) => Promise<boolean>;
}

interface MuTie {
  tie: (master:string, accountToTie:string) => Promise<boolean>;
  acceptTie: (initialTie:TieMessage) => Promise<boolean>;
  cut: (tieToCut:TieMessage) => Promise<boolean>;
  getTies: (keyObj: FeedID) => TieMessage[]
}

interface Friends {
  block: (pubKey: string) => Promise<boolean>;
}

interface MuCaps {
  shs: string;
}

export interface KeyApi {
  box: (content: object | string | boolean | number, recipients: ReadonlyArray<string>) => string;
  unbox: (boxed: string, keys:FeedID) => object | string | boolean | number | undefined;
  sign: (keys:FeedID, hmac_key: Buffer, str: string) => string;
  verify: (keys:FeedID, sig: string, hmac_key: Buffer, str: string) => 0 | -1;
  loadKeys: (feedIds:FeedID[]) =>FeedID[];
  useMnemonic: (mnemonic: string) => Promise<void>;
  createMnemonic: () => Promise<string>;
  createNewKeys: (index?: number, mnemonic?: string) =>FeedID;
  getKeys: () =>FeedID[]
}

export interface API {
  connect: (address: unknown, cb: Function) => Promise<boolean>;
  close: () => Promise<boolean>;
  db: DB;
  peerInvites: PeerInvites;
  muTie: MuTie;
  friends: Friends;
  muCaps: MuCaps;
  keyring: KeyApi;
}