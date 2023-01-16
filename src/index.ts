export const name = 'my-plugin'
export const version = require('../package.json')

export const manifest = {
  helloWorld: 'sync'
}
export const init = () => {
  return {
    helloWorld: () => console.log('Hello World')
  }
}

