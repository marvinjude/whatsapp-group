import React, { useLayoutEffect, useState, useCallback, memo } from 'react';
import { Route, BrowserRouter as Router, Link, Switch } from 'react-router-dom';
import useLocalStorage from './lib/uselocalstorage';
import UUID from 'uuid/v1';

import './css/output.css';
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
import genuisHub from './geniushub.jpg';
import homeBg from './home.jpeg';

function setHeightProperty() {
  let vh = window.innerHeight * 0.01;

  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
function generateRandomColor() {
  const R = Math.round((Math.random() * 1000) % 255);
  const G = Math.round((Math.random() * 1000) % 255);
  const B = Math.round((Math.random() * 1000) % 255);
  return `rgb(${R}, ${G}, ${B})`;
}

const DEF_CHANNEL_ID = 'GHUB-CHANNEL';

function Group({ history: { push } }) {
  const [userData] = useLocalStorage('__user__data');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      received: true,
      message: 'Hello how are you?',
      timeString: '12:20',
      sent: true,
      user: {
        id: '2008',
        name: 'Samuel',
        phone: '+2345694939393',
        color: 'gold'
      }
    },
    {
      received: true,
      message: 'Hello how are you?',
      timeString: '12:20',
      sent: true,
      user: {
        id: '2008',
        name: 'Samuel',
        phone: '+2345694939393',
        color: 'gold'
      }
    },
  ]);

  /**Handle redirect */
  if (!userData) push('/');

  const handleTyping = e => {
    setInputValue(e.target.value);
  };
  const addMessage = e => {
    e.preventDefault();
    inputValue && setMessages([
      ...messages,
      {
        received: false,
        message: inputValue,
        timeString: '12:20',
        sent: false,
        user: {
          id: '2005444',
          name: 'Raymond',
          phone: '+2345694939343',
          color: 'red'
        }
      }
    ]);

    setInputValue('');
  };

  /**Check if users own the previous message before this message with currentIndex */
  //
  const shouldShowBubble = currentIndex => {
    if (currentIndex === 0) {
      return true;
    }
    if (messages[currentIndex].user.id == messages[currentIndex - 1].user.id) {
      console.log('2nd Condition');
      return false;
    }
    return true;
  };
  useLayoutEffect(() => {
    setHeightProperty();

    window.addEventListener('resize', () => {
      setHeightProperty();
    });
  }, []);
  return (
    <div
      className="flex antialiased flex-col mobile-height max-w-full"
      style={{
        background: `url("https://i.ibb.co/3s1f9Jq/default-wallpaper.png") repeat`
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
          <p className="text-xs truncate">
            Marvin Jude, Larry, Awonuga Sherif, Tes
          </p>
        </div>
        <div className="flex  ml-auto">
          <GitHub className="mx-2" />
          <MoreVertical className="mx-2" />
        </div>
      </header>
      <section className="relative flex-1 overflow-y-scroll pt-20 ">
        {messages.map(
          ({ received, message, timeString, sent }, currentIndex) => (
            <>
              <div
                style={{
                  justifyContent: (received && 'flex-start') || 'flex-end'
                }}
                className="flex px-5 justify-end relative"
              >
                <div
                  style={{
                    maxWidth: '17rem',
                    background: !received && '#DCF8C6',
                    justifyContent: (received && 'flex-start') || 'flex-end'
                  }}
                  className={`p-2 ${
                    shouldShowBubble(currentIndex)
                      ? (received && 'm-bubble-in') || 'm-bubble'
                      : ''
                  } bg-white relative rounded mb-1 text-sm shadow relative w-auto break-all`}
                >
                  {received && shouldShowBubble(currentIndex) && (
                    <div
                      style={{ color: userData.color }}
                      className="text-xs text-bold flex "
                    >
                      +2347069149075
                      <p className="text-gray-700 px-2 ml-auto">~Marvin</p>
                    </div>
                  )}
                  <div className="pr-20">{message}</div>
                  <span className="text-xs absolute right-0 p-2 bottom-0 text-gray-700 flex justify-center items-center">
                    10:23PM
                    {(sent && (
                      <Check className="inline-block ml-1" size="10" />
                    )) || <Clock className="inline-block ml-1" size="10" />}
                  </span>
                </div>
              </div>
            </>
          )
        )}
        <div
          style={{ bottom: '4rem', right: '0.5rem' }}
          className="fixed p-2 bg-white shadow rounded-full text-gray-700 m-2 z-10"
        >
          <ChevronsDown size="15" />
        </div>
      </section>
      <form className="flex p-1" onSubmit={addMessage}>
        <div className="p-3 overflow-hidden bg-white shadow flex rounded-full flex-1 mr-1">
          <div>
            <Smile className="text-gray-700" />
          </div>
          <input
            value={inputValue}
            className="ml-2 caret-primary flex-1"
            placeholder="Type a message"
            onChange={handleTyping}
            onBlur={e => {
              e.target.focus();
            }}
          />
          <div
            style={{ transform: inputValue && `translate(50%)` }}
            className="flex text-gray-700 "
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
            {(inputValue && <Send className="rotate-45" />) || <Mic />}
          </button>
        </div>
      </form>
    </div>
  );
}

function Home({ history: { push } }) {
  const [userData, setUserData] = useLocalStorage('__user__data', null);
  /**Redirect */
  if (userData) push('/group');

  const [inputValue, setInputValue] = useState('');
  const randomlyGeneratedUUID = UUID();
  const randomlyGeneratedColor = generateRandomColor();

  const joinGroup = e => {
    e.preventDefault();

    /**Store user data in local storage */
    setUserData({
      nickName: inputValue,
      id: randomlyGeneratedUUID,
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
        <form className="flex flex-col" onSubmit={joinGroup}>
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Enter nick name here"
            className="rounded-full m-3 p-2 mx-0 text-center focus:border-blue-900"
          />
          <button
            style={{
              background: 'linear-gradient(58deg, rgb(0, 94, 84), #009688)'
            }}
            className="font-bold shadow-lg p-2 text-white rounded-full cursor-pointer"
          >
            JOIN
          </button>
        </form>
      </div>
    </div>
  );
}

const MemoisedGroup = memo(Group);

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={MemoisedGroup} />
        <Route path="/group" component={Group} />
      </Switch>
    </Router>
  );
};

export default App;
