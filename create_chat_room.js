require('dotenv').config()
const Session = require("@tellescope/sdk").Session

const createChatRoom = async () => {
  const sdk = new Session({ apiKey: process.env.REACT_APP_TELLESCOPE_API_KEY, host: process.env.REACT_APP_TELLESCOPE_API_ENDPOINT })
  const enduser = await sdk.api.endusers.getOne({ email: process.env.REACT_APP_EXAMPLE_ENDUSER_EMAIL })
  await sdk.api.chat_rooms.createOne({ enduserIds: [enduser.id] })
}
createChatRoom()
.then(() => console.log(`Created chatroom for enduser with email ${process.env.REACT_APP_EXAMPLE_ENDUSER_EMAIL}`))
.catch(err => {
  console.error(err)
})
.finally(process.exit)