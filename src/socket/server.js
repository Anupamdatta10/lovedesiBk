// const io = require('../../index');
// const Redis = require('ioredis');
// const { socketAuthenticate } = require('../universal/controllers/middlewares/middlewareController');
// const { getAllUsersForSocket } = require('../universal/queryModels/middileware/middileware');
// const _ = require("lodash");

// // Create a new Redis client
// const redis = new Redis({
//     host: 'localhost', // Redis server host (default: 'localhost')
//     port: 6379,        // Redis server port (default: 6379)
//     // password: 'your_password', // If your Redis server requires authentication
// });

// // Event listener for when the Redis connection is established
// redis.on('connect', () => {
//     console.log('Connected to Redis server');
// });

// // Event listener for Redis errors
// redis.on('error', (err) => {
//     console.error('Redis Error:', err);
// });



// exports.socketFunction = async (socket) => {
//     //let authorization = socketAuthenticate(socket.handshake, () => { });
//     //if (socket.handshake.headers.authorization && authorization.success) {
//     //const currentCognitoUserDetails = authorization.userDetails;
//     // let userParams = JSON.parse(currentCognitoUserDetails['custom:user_details']);
//     // let currentUserId = userParams.user_id;
//     // let allUsers = await getAllUsersForSocket(userParams.org_id, currentUserId);
//     // redis.set(currentUserId, socket.id);
//     //put the socket id in redis db with user_id
//     // Event handler for when a client sends a message
//     console.log("user connected");
//     socket.on('receive_python', (message) => {
//         console.log(`Receivedmessage: ${JSON.stringify(message)}`);
//         let allUsers = message.user_ids;
//         //fetch all users from the organisation and fetch socket id from redis db
//         let socketIds = [];
//         redis.mget(allUsers, (err, result) => {
//             if (err) {
//                 console.error(err);
//             } else {
//                 socketIds = _.compact(result);
//                 console.log('Value:', socketIds);
//             }
//         });
//         // Broadcast the message to all connected clients
//         io.io.to(socketIds).emit('chat_message', message);
//     });

//     socket.on('receive_react', async (message) => {
//         console.log(`Receivedmessage: ${JSON.stringify(message)}`);
//         //fetch all users from the organisation and fetch socket id from redis db
//         let allUsers = await getAllUsersForSocket(message.org_id, message.UserDetails.id);
//         let socketIds = [];
//         redis.mget(allUsers, (err, result) => {
//             if (err) {
//                 console.error(err);
//             } else {
//                 socketIds = _.compact(result);
//                 console.log('Value:', socketIds);
//             }
//         });
//         let receive_data = message;
//         console.log("receive_data===>>", receive_data);
//         // let data = {
//         //     "id": receive_data.id,
//         //     "org_id": receive_data.org_id,
//         //     "phone_number": receive_data.phone_number,
//         //     "profile_name": receive_data.profile_name,
//         //     "chat_date": receive_data.chat_date,
//         //     "message_type": receive_data.message_type,
//         //     "chat_code": "bot",
//         //     "chat_description": receive_data.chat_description,
//         //     "doc_link": null,
//         //     "followup_by": null,
//         //     "star": 0,
//         //     "wa_id": "wamid.HBgMOTE5MDkzMjY4MDk0FQIAERgSODA3NTZEMzBDNjdGODQwNDZCAA==",
//         //     "UserDetails": null
//         // }
//         // Broadcast the message to all connected clients
//         io.io.to(socketIds).emit('chat_message', { "message": receive_data });
//     });

//     socket.on('react_auth', async (message) => {
//         console.log("react_auth received");
//         message = JSON.parse(JSON.stringify(message));
//         redis.set(message.user_id, socket.id);
//     });

//     // Event handler for when a user disconnects
//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });
//     // } else {
//     //     socket.disconnect()
//     // }
// }