import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { v4 } from 'uuid';
import './App.css';

const PORT = 3001;
const socket = io(`http://localhost:${PORT}`);

const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState('');
  const [room, setRoom] = useState('');
  const [chatIsVisible, setChatIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log('connected:', socket.connected);
    socket.on('connect', () => {
      setIsConnected(true);
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [isConnected]);

  useEffect(() => {
    socket.on('receive_msg', ({ user, message }) => {
      const msg = `${user}: ${message}`;
      setMessages((prevState) => [msg, ...prevState]);
    });
  }, [socket]);

  const handleEnterRoom = () => {
    if (user !== '' && room !== '') {
      setChatIsVisible(true);
      socket.emit('join_room', { user, room });
    }
  };

  const handleSendMessage = () => {
    const newMsgData = {
      room: room,
      user: user,
      message: newMessage,
    };

    socket.emit('send_msg', newMsgData);
    const msg = `${user}: ${newMessage}`;
    setMessages((prevState) => [msg, ...prevState]);
    setNewMessage('');
  };

  const handleLoginReset = () => {
    setUser('');
    setRoom('');
  };

  return (
    <div className="main">
      {!chatIsVisible ? (
        <div className="loginBox">
          <h5>Sign in</h5>
          <input
            type="text"
            placeholder="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />

          <input
            type="text"
            placeholder="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />

          <button className="loginSubmit" onClick={handleEnterRoom}>
            Enter
          </button>
          <button className="loginReset" onClick={handleLoginReset}>
            Reset
          </button>
        </div>
      ) : (
        <div className="chatWrapper">
          <div className="heading">Live Chat Room</div>
          <div className="currentData">
            <div className="user">Current User: {user}</div>
            <div className="room">Room Name: {room}</div>
          </div>
          <div className="chatBox">
            {messages.map((el) => (
              <div className="messages" key={v4()}>
                {el}
              </div>
            ))}
          </div>
          <div className="formWrapper">
            <input
              type="text"
              placeholder="message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <button
              className="submit"
              type="submit"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
          <button
            className="reset"
            type="reset"
            onClick={() => setNewMessage('')}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};
export default App;
