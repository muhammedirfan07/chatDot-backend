const express =require('express')
const http =require('http')
const { Socket } = require('socket.io')
const Server =require('socket.io').Server
const cors =require('cors')
const app =express()

const server =http.createServer(app)
const io =new Server(server,{
    cors:{
        origin:"*" 

    }
})



const onlineUsers=new Map() // Store users by socket ID


io.on("connection", (socket) => {
    console.log(`User connected....${socket.id}`);

    //new joing users
   socket.on('uesrJoing',(username)=>{
     onlineUsers.set(socket.id,username)
    //  socket.username=username
     console.log(`userid:${socket.id},username:${username}`);
      // Send updated user list to all clients
      io.emit("updateUserList", Array.from(onlineUsers.values()));
    })
    //passing user id in client side
    socket.emit("session",{userId:socket.id})



 
   // Handle sending messages
   socket.on("sendMessage", ({ text, sender }) => {
    if (sender && text.trim()) {
      const msgData = {
        text,
        sender,
        timestamp: new Date(),
      };

      // Broadcast message to all clients
      io.emit("receiveMessage", msgData);
      console.log(`Message from ${sender}: ${text}`);
    }
  });

   
    // Handle user disconnect
    socket.on("disconnect", () => {
       // Get the username of the user who is disconnecting
      const username = onlineUsers.get(socket.id); 
     
      onlineUsers.delete(socket.id);
      io.emit("updateUserList", Array.from(onlineUsers.values())); // Emit updated list

      //left users  send message
      io.emit("leftUsers",username)
     
  });

  
    

})



// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port is${PORT}`);
});