# Tellescope Chat Demo (React)

## Setup

### `npm install`
Install dependencies. Use Yarn if you prefer.

### `Environment Variables`
#### `Create a .env file in the root directory with your own values`
```
REACT_APP_TELLESCOPE_API_ENDPOINT=''
REACT_APP_TELLESCOPE_BUSINESS_ID='YOUR_BUSINESS_ID_HERE'
REACT_APP_TELLESCOPE_API_KEY ='YOUR_API_KEY_HERE'
REACT_APP_EXAMPLE_ENDUSER_EMAIL='email@email.com'
REACT_APP_EXAMPLE_ENDUSER_PASSWORD='test_password_goes_here!!!2310'
```
REACT_APP_TELLESCOPE_API_ENDPOINT Defaults to https://api.tellescope.com 
BUSINESS_ID and API_KEY can be found in your settings page
EXAMPLE_PASSWORD should satisfy length > 8, uppercase letter, number, special character

### `Accounts`

#### `User`
You must have an account registered with Tellescope as part of an organization.

#### `Enduser`
You will need a test enduser with a password. If you have set the email and password fields in the .env file, \
you can run the following script to create a sample enduser for testing.
```
npm run create-enduser
```

#### `Chat Room`
You will need a test chat room to send messages. 
You can run the following script to create a room with your sample enduser
```
npm run create-chat-room
```
You can also create a chat room in the UI 

## Running

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3456](http://localhost:3456) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Acknowledgements
Built on [Create React App](https://github.com/facebook/create-react-app).