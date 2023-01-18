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
}

interface Friends {
  block: (pubKey: string) => Promise<boolean>;
}

interface MuCaps {
  shs: string;
}

export interface API {
  connect: (address: unknown, cb: Function) => Promise<boolean>;
  close: () => Promise<boolean>;
  db: DB;
  peerInvites: PeerInvites;
  muTie: MuTie;
  friends: Friends;
  muCaps: MuCaps;
}