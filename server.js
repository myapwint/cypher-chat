import cors from 'cors';
import express from 'express';
import config from './utils/config.js';
import { connectToDB } from './utils/connection.js';
import userRoutes from './routes/userRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import http from 'http';
import { Server } from 'socket.io';

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));

//const server = http.createServer(app);
//const io = new Server(server, {
//  transports: ['websocket']
//});

//io.on('connection', (socket) => {
//  console.log('User connected');

  // Handle chat functionality using socket events
//  socket.on('send_message', (data) => {
    // Broadcast message to all users in the chat room
    //io.emit('receive_message', data);
  //});

  // ... Handle other chat related events (join chat, leave chat etc.)
//});

//routes
app.use('/api', userRoutes);
app.use('/api', chatRoutes);

app.listen(config.port, () =>
  console.log(`Server is live @ ${config.hostUrl}`),
  connectToDB()
);