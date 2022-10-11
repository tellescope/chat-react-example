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
  useEndusers,
  useChatRooms,
  Button,
  LoadingButton,
  LoadingLinear,
  useChats,
  useResolvedSession,
  Paper,
} from "@tellescope/react-components"

import {
  Conversations,
  Messages,
  SendMessage,
  user_display_name,
} from "@tellescope/chat"
import { SessionType } from '@tellescope/types-utilities';
import { ChatRoom, UserDisplayInfo } from '@tellescope/types-client';

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
    <div style={{ margin: 20 }}>
      Create a Chat Room to get started, then login as a user or enduser to chat in the room<br/>
      {routes.map(r => 
        <div key={r} style={{ margin: '5px 0px' }}>
          <button onClick={() => navigate(r)}>{r}</button>
        </div>
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
    <CreateChatRoomWithProvider/> 
  </UserProvider>
  </WithSession>
)
const CreateChatRoomButton = () => {
  const [loadingEndusers] = useEndusers()
  const [loadingChatRooms, { createElement: createChatRoom }] = useChatRooms()
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
const CreateChatRoomWithProvider = () => {
  const session = useSession()
  if (!session.authToken) return (
    <Flex column flex={1} style={{ padding: 20 }}>
      <Typography>User Login</Typography>
      <UserLogin/>
    </Flex>
  )

  return (
    <CreateChatRoomButton/>
  )
}

/* Assuming 1-1 user-enduser chat room */
const resolve_chat_room_name = (room: ChatRoom, displayInfo: { [index: string]: UserDisplayInfo }, userType: SessionType, currentUserId: string) => {
  if (room.recentSender !== currentUserId) {
    return user_display_name(displayInfo[room.recentSender ?? ''])
  }
  if (userType === 'user') {
    return user_display_name(displayInfo[room?.enduserIds?.[0] ?? room.creator ?? ''])
  }
  if (userType === 'enduser') {
    console.log(room.recentSender, room.creator, displayInfo[room.creator])
    return user_display_name(displayInfo[room?.userIds?.[0] ?? room.creator ?? ''])
  }
  return ''
}

interface WithSessionType { type: SessionType }
interface RoomSelector { selectedRoom: string, setSelectedRoom: (s: string) => void }
const CustomSidebar = ({ type, selectedRoom, setSelectedRoom } : WithSessionType & RoomSelector) => {
  const [loadingRooms] = useChatRooms()
  const session = useResolvedSession()

  return (
    <Paper elevation={3}>
    <Conversations rooms={loadingRooms} selectedRoom={selectedRoom} onRoomSelect={setSelectedRoom} 
      style={{ backgroundColor: 'white' }}
      PreviewComponent={({ onClick, selected, room, displayInfo }) => (
        <Flex flex={1} column onClick={() => !selected && onClick?.(room)} 
          style={{ 
            minWidth: 200,
            minHeight: 25,
            padding: 5, 
            cursor: 'pointer',
            backgroundColor: selected ? '#bbbbbb' : undefined,
            borderBottom: '1px solid black',
          }}
        >

        {!room.recentMessage &&
          <Typography>New Chat Room</Typography>
        }
        
        <Typography>
          {
            resolve_chat_room_name(room, displayInfo, type, session.userInfo.id)
          }
        </Typography>
  
        <Typography>
          {room.recentMessage}
        </Typography>
        </Flex>
      )
    }
    />
    </Paper>
  )
}

const CustomSplitChat = ({ type } : WithSessionType) => {
  const session = useResolvedSession()
  const [selectedRoom, setSelectedRoom] = React.useState('')
  const [chats] = useChats(selectedRoom)

  return (
    <Flex flex={1} style={{ margin: 20 }}>
      <Flex>
        <CustomSidebar type={type} selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom}/>
      </Flex>

      <Paper flex elevation={3}>
      <Flex column flex={1}>
        <Messages messages={chats} chatUserId={session.userInfo.id} />

        <Flex style={{ marginTop: 'auto' }}>
          <SendMessage roomId={selectedRoom} />
        </Flex>
      </Flex>
      </Paper>
    </Flex>
  )
}

const ChatsForUser = () => (
  <WithSession sessionOptions={{ host }}>
  <UserProvider>
    <ChatsForUserWithProvider />
  </UserProvider>
  </WithSession>
)

const ChatsForUserWithProvider = () => {
  const session = useSession()
  if (!session.authToken) return (
    <Flex flex={1} style={{ padding: 20 }}>
      <UserLogin/>
    </Flex>
  )

  return <CustomSplitChat type="user"/> 
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
    <Flex flex={1} style={{ padding: 20 }}>
      <EnduserLogin 
        fillEmail={process.env.REACT_APP_EXAMPLE_ENDUSER_EMAIL}
        fillPassword={process.env.REACT_APP_EXAMPLE_ENDUSER_PASSWORD}
      />
    </Flex>
  )

  return <CustomSplitChat type="enduser" />
}



export default App;
