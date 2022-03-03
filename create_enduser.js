require('dotenv').config()
const Session = require("@tellescope/sdk").Session

const createEnduser = async () => {
  const sdk = new Session({ apiKey: process.env.REACT_APP_TELLESCOPE_API_KEY, host: process.env.REACT_APP_TELLESCOPE_API_ENDPOINT })
  const enduser = await sdk.api.endusers.createOne({ email: process.env.REACT_APP_EXAMPLE_ENDUSER_EMAIL })
  await sdk.api.endusers.set_password({ id: enduser.id, password: process.env.REACT_APP_EXAMPLE_ENDUSER_PASSWORD }).catch(console.error)
}
createEnduser()
.then(() => console.log(`Created enduser for email ${process.env.REACT_APP_EXAMPLE_ENDUSER_EMAIL}`))
.catch(err => {
  console.error(err)
})
.finally(process.exit)