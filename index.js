
const mongoose=require('mongoose');
const express=require('express');
const app=express();
const http=require('http');
const {Server}=require('socket.io');
const cors=require('cors');
const server=http.createServer(app);
const path=require('path')

const Message = require('./models/Message');


const mongoDB="mongodb+srv://Hannan_abid:Anah0424@cluster0.8v2w7jh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoDB)
  .then(() => {
    console.log("connected");
  })
  .catch((error) => {
    console.error("Connection error:", error);
  });

app.use(cors());






const io= new Server(server, {
    cors: {
        origin:"http://localhost:3000",
        methods:["GET","POST"],
    },
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);
  
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User with ID: ${socket.id} joined room: ${room}`);
  
      // Fetch and send previous messages when a user joins a room
      Message.find({ room })
        .then(messages => {
          socket.emit('previous_messages', messages);
        })
        .catch(error => {
          console.error('Error fetching messages:', error);
        });
    });
  
    socket.on('send_message', (data) => {
      const { room, sender, message, time } = data;
  
      if (!room || !sender || !message || !time) {
        console.error('Invalid message data:', data);
        return;
      }
  
      const newMessage = new Message({ room, sender, message, time });
  
      newMessage.save()
        .then(() => {
          socket.to(room).emit('receive_message', data);
        })
        .catch(error => {
          console.error('Error saving message:', error);
        });
    });
  
    socket.on('disconnect', () => {
      console.log('User Disconnected', socket.id);
    });
  });


server.listen(3001,()=>{
    console.log("server running");
});
