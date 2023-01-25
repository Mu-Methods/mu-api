# API plugin for mu-server

Assembles a wrapper aroung the required plugin methods for use with mu-server, secret-stack, or other api. see src/types.ts for the specific shape of the api.

## Methods

### connect(address)

Attempts to connect to the provided address and begins an app session.

### close()

Closes the user account and ends the app session.

### generateInvite(netId, recps)

Publishes an invite from the user Account referencing the provided network id and encrypted to recps to share with new peers to connect.

### openInvite(invite)

Decrypts the provided invite and reads the details.

### acceptInvite(invite)

Publishes a confirmation of the provided invite.

### getFeed()

Returns the database feed.

### getAccounts()

Get all accounts tied to the current user Account. 

### findName(keyObj)

Returns the name or nickname of the provided keyObj Account.

### findContactDetails(keyObj)

Returns the peers and blocked accounts of the provided keyObj Account.

### tie(accountToTie)

Publishes a tie message from the user Account with message content referencing the provided accountToTie Account.

### acceptTie(initialTie)

Publishes a second tie message from the user Account with message content referencing the provided initialTie message.

### cut(tieToCut)

Publishes a cut message from the user Account with message content referencing the provided tieToCut message.

### publish(userKeys, content, recipients)

Publishes an arbitrary message from the userKeys Account with message content and encrypted to the recipients.

### block(publicKey)

Publishes a block message from the user Account with message content referencing the provided publicKey

### getNetId()

Returns the network ID for connecting to the mu server.
```
yarn version
# enter in new version
npm publish
```