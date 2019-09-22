import React, { useState, memo } from 'react';
import GoogleLogin from 'react-google-login';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import useLocalStorage from './lib/uselocalstorage';
import UUID from 'uuid/v1';
import debounce from 'lodash.debounce';
import PubNub from 'pubnub';
import backgroundImage from './default-wallpaper.png';
import {
  ArrowLeft,
  GitHub,
  MoreVertical,
  Smile,
  Paperclip,
  ChevronsDown,
  Clock,
  Mic,
  Instagram,
  Check,
  Send,
  Code
} from 'react-feather';
import Linkify from 'linkifyjs/react';

import './css/output.css';
import { ReactComponent as Spinner } from './spinner.svg';
import config from './config.js';
import genuisHub from './geniushub.jpg';
import homeBg from './home.jpeg';
import googleLogo from './g-logo.png';
import {
  prettyDate,
  setHeightProperty,
  generateRandomColor
} from './lib/helpers';

/**use Chanell ID */
const DEF_CHANNEL_ID = config.channelId;
const DEF_TYPING_CHANNEL_ID = 'TYPING_CHANNEL';

const pubnub = new PubNub({
  publishKey: config.publishKey,
  subscribeKey: config.subscribeKey
});

function Group({ history: { push } }) {
  const [userData] = useLocalStorage('user_data_v1');
  const [showScrollTo, setShowScrollTo] = useState(0);
  const [inputValue, setInputValue] = useState('');

  const [typer, setTyper] = useState(null);

  const [loading, setLoading] = useState(true);
  const containerRef = React.createRef();
  const [messages, setMessages] = useState([]);
  const latestMessages = React.createRef();
  const inpufRef = React.createRef();

  const typingTimer = React.useRef();

  /**Handle redirect */
  if (!userData) push('/');

  const handleTyping = e => {
    setInputValue(e.target.value);
  };

  const sendTypingSignal = e => {
    const inputHasValue = e.target.value.length > 0;
    if (inputHasValue) {
      console.log(' sending signal');

      pubnub.signal(
        {
          channel: DEF_TYPING_CHANNEL_ID,
          message: {
            user: { nickName: userData.nickName }
          }
        },
        function(response) {
          if (response.error) {
            console.log('An error occured');
          }
        }
      );
    }
  };

  const markMessageAsSent = id => {
    const newMessages = latestMessages.current.map(m => {
      if (m.entry.id == id) {
        const newMsg = { ...m, entry: { ...m.entry, sending: false } };
        return newMsg;
      }
      return m;
    });

    /**Store messages in a ref */
    latestMessages.current = newMessages;

    setMessages(newMessages);
  };

  const addMessage = e => {
    e.preventDefault();

    if (inputValue.trim()) {
      const randomMessageId = UUID();

      const message = {
        id: randomMessageId,
        received: false,
        message: inputValue,
        timeString: Date.now(),
        sending: true,
        user: {
          id: userData.id,
          nickName: userData.nickName,
          email: userData.email,
          color: userData.color
        }
      };

      setInputValue('');

      /**Store messages in a ref */
      latestMessages.current = [...messages, { entry: message }];

      /**Set state */
      setMessages([...messages, { entry: message }]);

      pubnub.publish(
        {
          channel: DEF_CHANNEL_ID,
          message: { ...message, sending: false }
        },
        function(status, response) {
          if (status.error) {
            // handle error
            console.log(status);
          } else {
            markMessageAsSent(randomMessageId);
          }
        }
      );

      /**Store messages in a ref */
      latestMessages.current = [...messages, { entry: message }];

      /**Set state */
      setMessages([...messages, { entry: message }]);

      inpufRef.current.focus();
    }
  };

  /**Check if users own the previous message before this message with currentIndex */
  const shouldShowBubble = currentIndex => {
    if (currentIndex === 0) {
      return true;
    }
    if (
      messages[currentIndex].entry.user.id ==
      messages[currentIndex - 1].entry.user.id
    ) {
      return false;
    }
    return true;
  };

  /*EFFECT : Scroll to bottom initially, and when messages change */
  React.useEffect(() => {
    console.log('Scrolling To Bottom');
    containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
  }, [messages]);

  /**EFFECT : Fetch history, on mount */
  React.useEffect(() => {
    pubnub.history(
      {
        channel: DEF_CHANNEL_ID,
        count: 100,
        stringifiedTimeToken: true
      },
      function(status, response) {
        if (!status.error) {
          console.log('got data');
          /**Store messages in a ref */
          latestMessages.current = response.messages;

          setMessages(response.messages);

          setLoading(false);
        } else {
          console.log('Unable to Fetch Messages');

          setLoading(false);
        }
      }
    );
  }, []);

  /**Listen for incoming messages */
  React.useEffect(() => {
    pubnub.addListener({
      //Listen for typing signal
      signal: function({ message: { user } }) {
        console.log('Signal Received');

        clearTimeout(typingTimer.current);

        // Don't show typing indicator if this user is the current typer
        if (userData.nickName !== user.nickName) {
          setTyper(user);
        }

        typingTimer.current = setTimeout(() => {
          setTyper(null);
        }, 3000);
      },
      message: function({ message }) {
        /**if the message isn't from this current user */
        if (message.user.id !== userData.id) {
          console.log('top', messages, latestMessages);
          setMessages([...messages, { entry: message }]);
          console.log('bottom', messages, latestMessages);
        }
      }
    });

    /*subscribe to channels*/
    pubnub.subscribe({
      channels: [DEF_CHANNEL_ID, DEF_TYPING_CHANNEL_ID]
    });
    return () => {
      clearTimeout(typingTimer.current);
      /*unsubscribe from channels*/
      pubnub.unsubscribe({
        channels: [DEF_CHANNEL_ID, DEF_TYPING_CHANNEL_ID]
      });
    };
  }, [userData, latestMessages]);

  React.useEffect(() => {
    setHeightProperty();

    window.addEventListener('resize', () => {
      setHeightProperty();
    });

    containerRef.current.addEventListener(
      'scroll',
      debounce(
        e => {
          const offset =
            e.target.scrollHeight -
            (e.target.clientHeight + e.target.scrollTop);
          if (offset >= 50) {
            setShowScrollTo(true);
          } else {
            setShowScrollTo(false);
          }
        },
        300,
        { leading: false, trailing: true }
      )
    );
  }, [containerRef.current]);

  const received = userId => userId !== userData.id;
  const scrollToBottom = () => {
    containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
  };

  return (
    <div
      className="flex antialiased flex-col mobile-height max-w-full"
      style={{
        // background: `url("https://web.whatsapp.com/img/bg-chat-tile_8a055527b27b887521a9f084497d8879.png") repeat`,
        background: `url(${backgroundImage})`,
        backgroundColor: '#e5ddd5'
      }}
    >
      <header
        className="flex fixed py-2 p-1 align-center text-white items-center shadow-lg w-full"
        style={{ background: '#005e54', zIndex: '10' }}
      >
        <ArrowLeft />
        <img
          src={genuisHub}
          className="bg-yellow-300 h-10 w-10 h-2 rounded-full flex-shrink-0"
        />
        <div className="mx-2 overflow-hidden">
          <p className="text-lg font-bold">💡GeniusHUB</p>

          {/* Typing indicator */}
          {(typer && (
            <p className="text-xs truncate">{typer.nickName} is typing...</p>
          )) || (
            <p className="text-xs truncate">
              Marvin Jude, Larry, Awonuga Sherif, Tes
            </p>
          )}
        </div>
        <div className="flex  ml-auto">
          <a href="https://github.com/marvinjude/whatsapp-group">
            <GitHub className="mx-2" />
          </a>
          <MoreVertical className="mx-2" />
        </div>
      </header>
      <section
        className="relative flex-1 overflow-y-scroll pt-20"
        ref={containerRef}
      >
        {(!loading &&
          messages.map(
            (
              {
                entry: {
                  id: messageId,
                  message,
                  sending,
                  user: { id, nickName, color, email },
                  timeString
                }
              },
              currentIndex
            ) => (
              <div
                style={{
                  justifyContent: (received(id) && 'flex-start') || 'flex-end'
                }}
                className="flex px-5 justify-end relative"
                key={messageId}
              >
                <div
                  style={{
                    maxWidth: '17rem',
                    background: !received(id) && '#DCF8C6',
                    justifyContent: (received(id) && 'flex-start') || 'flex-end'
                  }}
                  className={`p-1p5 ${
                    shouldShowBubble(currentIndex)
                      ? (received(id) && 'm-bubble-in') || 'm-bubble'
                      : ''
                  } bg-white relative rounded mb-1p5 text-sm shadow relative w-auto break-all`}
                >
                  {received(id) && shouldShowBubble(currentIndex) && (
                    <div style={{ color }} className="text-xs text-bold flex ">
                      {(email && email) || '*no email*'}
                      <p className="text-gray-700 px-2 ml-auto">~{nickName}</p>
                    </div>
                  )}
                  <Linkify className="dont-underline pr-20" tagName="div">
                    {message}
                  </Linkify>

                  <span className="text-2xs absolute right-0 p-2 bottom-0 text-gray-700 flex justify-center items-center">
                    {prettyDate(timeString)}
                    {!received(id)
                      ? (sending && (
                          <Clock className="inline-block ml-1" size="10" />
                        )) || <Check className="inline-block ml-1" size="15" />
                      : ''}
                  </span>
                </div>
              </div>
            )
          )) || (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        )}
        {showScrollTo && (
          <div
            style={{ bottom: '4rem', right: '0.5rem' }}
            className="fixed p-3 bg-white shadow rounded-full text-gray-700 m-2 z-10"
            onClick={scrollToBottom}
          >
            <ChevronsDown size="15" />
          </div>
        )}
      </section>
      <form className="flex p-1 z-10" onSubmit={addMessage}>
        <div className="p-3 overflow-hidden bg-white shadow flex rounded-full flex-1 mr-1">
          <div>
            <Smile className="text-gray-600" />
          </div>
          <input
            ref={inpufRef}
            value={inputValue}
            className="ml-2 caret-primary flex-1"
            placeholder="Type a message"
            onChange={handleTyping}
            onKeyUp={sendTypingSignal}
          />
          <div
            style={{
              transform: inputValue.trim() && `translate(50%)`
            }}
            className="flex text-gray-600 ml-auto"
          >
            <Paperclip className="mx-2" />
            <Instagram className="mx-2" />
          </div>
        </div>
        <div
          style={{ background: '#005e54', zIndex: '10' }}
          className="bg-green-500 h-12 w-12 p-3 flex rounded-full text-white justify-center items-center flex-shrink-0"
        >
          <button type="submit">
            {(inputValue.trim() && <Send className="rotate-45" />) || <Mic />}
          </button>
        </div>
      </form>
    </div>
  );
}

function Home({ history: { push } }) {
  const [userData, setUserData] = useLocalStorage('user_data_v1', null);
  /**Redirect */
  if (userData) push('/group');

  const randomlyGeneratedColor = generateRandomColor();

  const joinGroup = ({ profileObj: { email, familyName, googleId } }) => {
    /**Store user data in local storage */
    setUserData({
      nickName: familyName,
      email,
      id: googleId,
      color: randomlyGeneratedColor
    });

    push('/group');
  };

  return (
    <div
      style={{ background: `url(${homeBg}) repeat` }}
      className=" flex h-screen justify-center items-center"
    >
      <div className="flex justify-center items-center flex-col ">
        <img src={genuisHub} className=" rounded-full h-24" />
        <h4 className="text-3xl mb-0 text-white">💡GeniusHUB</h4>
        <p className="text-sm mt-0 text-white">
          <Code className="inline" /> by{' '}
          <a href="http://www.twitter.com/MarvinJudeHK"> @MarvinJudeHK</a>
        </p>
        <div className="flex flex-col mt-3">
          <GoogleLogin
            clientId={config.googleClientId}
            onSuccess={res => joinGroup(res)}
            onFailure={() => console.log('Oops! An error occured')}
            render={renderProps => (
              <button
                className="font-bold bg-white shadow-lg p-3 px-4 rounded cursor-pointer flex justify-center items-center"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              >
                <img src={googleLogo} className="h-5 mr-2" />
                ENTER WITH GOOGLE
              </button>
            )}
          />
        </div>
      </div>
    </div>
  );
}

const MemoisedGroup = memo(Group);

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/group" component={MemoisedGroup} />
      </Switch>
    </Router>
  );
};

export default App;
