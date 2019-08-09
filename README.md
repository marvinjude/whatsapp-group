
## Sign up for PubNub 
This project relies on [PubNub](www.pubnub.com) for sending and receiving messages in realtime(Publish/Subcribe).
Hence you need to sign up for a PubNub account and grap your API Keys from your dashboard. 
**if you already have an account, grab your API keys and move on to the next step**

## Turn on storage and playback on your PubNub dashboard
This project relied on PubNub's **storage and playback** feature to fetch messages that have been published overtime since it uses no database. This means you have to turn the feature on right on your PubNub dashboard.

![Imgur](https://i.imgur.com/T2QiIli.png)

## Add API keys and Channel name
After cloning this project, add your API keys(Publish, Subcribe) and channel id(You can call it **test** of whatever) in
`src/config.js`

```
{
  /**Replace with your channel ID, maybe "test" or whatever */
  channelId: '<your channel id>',
  /**Replace with your Pub keys */
  publishKey: <your publish key>,
  /**Replace with your SUB keys */
  subscribeKey: <your subscribe key>,
  /**Replace with your google client ID more details here: https://developers.google.com/identity/sign-in/web/sign-in */
  googleClientId: <your google client id>
};

```

## Add Google client id
This project uses google oauth to sign users into the app. Follow these [steps](www.https://developers.google.com/identity/sign-in/web/sign-in) to get your client id and make sure to make in `src/config.js`


## Install Dependencies
Install dependencies with `yarn` or `npm`

```
 yarn
```
or 
```
npm install 
```

## Start Dev Server

```
yarn start
``` 

or

```
npm run start
```

## Deployment, and other stuff.... 
For buliding, deployment and other stuff, check the [Create React App](https://github.com/facebook/create-react-app) docs, this project
was bootsratpped with it

## License
MIT

## Social

I'm [@MarvinJudeHK](https://www.twitter.com/MarvinJudeHK) on twitter
