import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom"

import {
  List,
  ErrorBoundary,
  useSession,
  useEnduserSession,
  Flex,
  UserProvider,
  EnduserProvider,
  WithEnduserSession,
  WithSession,
  EnduserLogin,
  UserLogin,
  Typography,
  useEndusersForUser as useEndusers,
  useChatRoomsForUser,
  Button,
  LoadingButton,
  LoadingLinear,
} from "@tellescope/react-components"

import {
  EnduserChatSplit,
  UserChatSplit,
  user_display_name,
} from "@tellescope/chat"

// Replace this with your Tellescope organization ID
const businessId = process.env.REACT_APP_TELLESCOPE_BUSINESS_ID 
if (!businessId) {
  console.log(businessId)
  console.error('No businessId set. Enduser authentication will not work.')
  process.exit()
}

// change this if testing outside of production
const host = process.env.REACT_APP_TELLESCOPE_API_ENDPOINT || 'https://api.tellescope.com'

const ViewSelector = () => {
  const navigate = useNavigate()

  return (
    <div>
      Select Test Page <br/>
      {routes.map(r => 
        <button key={r} onClick={() => navigate(r)}>{r}</button>
      )}
    </div>
  )
}

const routes = [
  '/create-chat-room',
  '/chats-for-user',
  '/chats-for-enduser',
]

const Routing = () => (
  <Router>
  <Routes>   
    <Route path={routes[0]} element={<CreateChatRoom/>}/>
    <Route path='/chats-for-user' element={<ChatsForUser/>}/>
    <Route path='/chats-for-enduser' element={<ChatsForEnduser/>}/>
    <Route path='/*' element={<ViewSelector/>}/>
  </Routes>
  </Router>
)

export const App = () => {
  return (
    <Flex style={{ height: '100vh' }}> 
      <ErrorBoundary>
        <Routing/>
      </ErrorBoundary>
    </Flex>
  );
}

const CreateChatRoom = () => (
  <WithSession sessionOptions={{ host }}>
  <UserProvider>
    <CreateChatRomWithProvider/> 
  </UserProvider>
  </WithSession>
)
const CreateChatRoomButton = () => {
  const [loadingEndusers] = useEndusers()
  const [loadingChatRooms, { createElement: createChatRoom }] = useChatRoomsForUser()
  const [showEndusers, setShowEndusers] = React.useState(false)
  const [selectedEnduserId, setSelectedEnduserId] = React.useState('')

  const handleCreateChatroom = async () => {
    await createChatRoom({ enduserIds: [selectedEnduserId] })
    setShowEndusers(false)
  }

  if (!showEndusers) return (
    <Flex flex={1} column>
      <Button onClick={() => setShowEndusers(true)}>Create New Chatroom</Button>

      <LoadingLinear data={loadingChatRooms} render={chatRooms => (
      <List items={chatRooms} render={room => (
        <Typography style={{ 
          border: '1px solid black',
          borderRadius: 5,
          padding: 5,
          margin: '2px 0px',
        }}>
          Room ID: {room.id} {' '}
          Endusers: {JSON.stringify(room.enduserIds ?? [], null, 2)}
        </Typography>
      )} />
    )} /> 
    </Flex>
  )

  return (
    <Flex flex={1} column>
    <LoadingButton submitText='Create Chat Room' submittingText='Creating'
      disabled={selectedEnduserId === ''}
      onClick={handleCreateChatroom}
    />
    <Typography style={{ marginTop: 10 }}>
      Select Enduser
    </Typography>
    <LoadingLinear data={loadingEndusers} render={endusers => (
      <List items={endusers} render={enduser => (
        <Typography onClick={() => setSelectedEnduserId(enduser.id)} 
          style={{
            border: '1px solid black',
            borderRadius: 5,
            padding: 5,
            margin: '2px 0px',
            backgroundColor: enduser.id === selectedEnduserId ? '#aaaaaa' : undefined
          }}
        >
          {user_display_name(enduser)}
        </Typography>
      )} />
    )} />
    </Flex>
  )
}
const CreateChatRomWithProvider = () => {
  const session = useSession()
  if (!session.authToken) return (
    <Flex column>
      <Typography>User Login</Typography>
      <UserLogin/>
    </Flex>
  )

  return (
    <CreateChatRoomButton/>
  )
}

const ChatsForUser = () => (
  <WithSession sessionOptions={{ host }}>
  <UserProvider>
    <ChatsForUserWithProvider/> 
  </UserProvider>
  </WithSession>
)

const ChatsForUserWithProvider = () => {
  const session = useSession()
  if (!session.authToken) return <UserLogin/>

  return <UserChatSplit/>
}

const ChatsForEnduser = () => (
  <WithEnduserSession sessionOptions={{ host, businessId }}>
  <EnduserProvider>
    <ChatsForEnduserWithProvider/>
  </EnduserProvider>
  </WithEnduserSession>
)
const ChatsForEnduserWithProvider = () => {
  const session = useEnduserSession()
  if (!session.authToken) return (
    <EnduserLogin 
      fillEmail={process.env.REACT_APP_EXAMPLE_ENDUSER_EMAIL}
      fillPassword={process.env.REACT_APP_EXAMPLE_ENDUSER_PASSWORD}
    />
  )

  return <EnduserChatSplit/>
}



export default App;
