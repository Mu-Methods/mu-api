export interface MSG {
  key: string;
  value: string | Message;
  timestamp: number;
}

export interface Message {
    author: string;
    backlink: string;
    hash: string;
    nonce: number | string;
    timestamp: number;
    content: any; // correct me
    recps: Array<FeedID>;
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

export interface Contacts {
  peers: string[];
  blocked: string[];
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
  where: any;
  and: any;
  type: any;
  author: any;
  toPromise: any;
  contact: any;
}

interface Opts {
  keys?: FeedID;
  feedFormat?: string;
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

interface RequestOpts extends Opts{
  recps: Array<FeedID>;
  public: string; //public key
}

interface ResendOpts extends Opts {
  recp: FeedID;
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

export interface TieOpts extends Opts {
  keys: FeedID;
  end: FeedID;
  depth: number;
}

interface MuTie {
  tie: (TieOpts) => Promise<boolean>;
  acceptTie: (initialTie:TieMessage) => Promise<boolean>;
  cut: (tieToCut:TieMessage) => Promise<boolean>;
  getTies: (keyObj: FeedID) => MSG[]
}

export interface FriendOpts {
  state: boolean;
  recps?: Array<FeedID>;
}

export interface BlockOpts extends FriendOpts {
  reason: string;
}

interface Friends {
  follow: (feedId: FeedID, opts: FriendOpts, cb: Function) => Promise<Message>;
  block: (feedId: FeedID, opts: BlockOpts, cb: Function) => Promise<Message>;
  graph: (cb: Function) => Promise<Object>;
}

interface MuCaps {
  shs: string;
}

export interface KeyApi {
  generate: () => FeedID
  box: (content: object | string | boolean | number, recipients: ReadonlyArray<string>) => string;
  unbox: (boxed: string, keys:FeedID) => object | string | boolean | number | undefined;
  sign: (keys:FeedID, hmac_key: Buffer, str: string) => string;
  verify: (keys:FeedID, sig: string, hmac_key: Buffer, str: string) => 0 | -1;
  loadKeys: (feedIds:FeedID[]) =>FeedID[];
  useMnemonic: (mnemonic: string) => Promise<void>;
  createMnemonic: () => Promise<string>;
  createNewKeys: (index?: number, mnemonic?: string) =>FeedID;
  getKeys: () => FeedID[];
}

interface SssApi {
  shardAndSend: (opts: ShardOpts) => Promise<boolean>;
  getKeepers: (keyObj: FeedID) => Promise<Array<string>>;
  requestShards: (opts: RequestOpts) => Promise<boolean>;
  resendShards: (opts: ResendOpts) => Promise<boolean>;
  recoverSecret: (publicKey: string) => Promise<string>;
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
  sss: SssApi;
}