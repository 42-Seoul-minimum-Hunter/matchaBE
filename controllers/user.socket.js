const socket = require('socket.io');

const express = require('express');
const router = express.Router();

const UserService = require('../services/user.service.js');

const userActivate = new Map();

module.exports = (server, app) => {
    const io = socket(server, {
        cors: {
            origin: '*',
            credentials: true,
        },
    });

    // 소캣 연결
    io.on('connection', (socket) => {
        this.logger.info('Websocket connected!');

        // 클라이언트가 보낸 데이터 접근
        const userId = socket.handshake.query.userId; // 또는 socket.handshake.headers.userId

        // 유저 접속 상태 
        userActivate.set(userId, socket.id);


        // 채팅방 목록? 접속(입장전)
        socket.on('join-room', async (data) => {
            let { roomKey, userKey } = data;
            const enterUser = await Participant.findOne({
                where: { roomKey, userKey },
                include: [
                    { model: User, attributes: ['nickname'] },
                    { model: Room, attributes: ['title'] },
                ],
            });

            // 해당 채팅방 입장
            socket.join(enterUser.Room.title);
            const enterMsg = await Chat.findOne({
                where: {
                    roomKey,
                    userKey: 12,
                    chat: `${enterUser.User.nickname}님이 입장했습니다.`,
                },
            });

            // 처음입장이라면 환영 메세지가 없을테니
            if (!enterMsg) {
                await Chat.create({
                    roomKey,
                    userKey: 12, // 관리자 유저키
                    chat: `${enterUser.User.nickname}님이 입장했습니다.`,
                });

                // 관리자 환영메세지 보내기
                let param = { nickname: enterUser.User.nickname };
                io.to(enterUser.Room.title).emit('welcome', param);
            } else {
                // 재입장이라면 아무것도 없음
            }
        });

        // 채팅 받아서 저장하고, 그 채팅 보내서 보여주기
        socket.on('chat_message', async (data) => {
            let { message, roomKey, userKey } = data;
            const newChat = await Chat.create({
                roomKey,
                userKey,
                chat: message,
            });
            const chatUser = await Participant.findOne({
                where: { roomKey, userKey },
                include: [
                    { model: User, attributes: ['nickname'] },
                    { model: Room, attributes: ['title'] },
                ],
            });

            // 채팅 보내주기
            let param = {
                message,
                roomKey,
                nickname: chatUser.User.nickname,
                time: newChat.createdAt, // (9시간 차이나는 시간)
            };

            io.to(chatUser.Room.title).emit('message', param);
        });

        // 채팅방 나가기(채팅방에서 아에 퇴장)
        socket.on('leave-room', async (data) => {
            let { roomKey, userKey } = data;
            const leaveUser = await Participant.findOne({
                where: { roomKey, userKey },
                include: [
                    { model: User, attributes: ['nickname'] },
                    { model: Room, attributes: ['title', 'userKey'] },
                ],
            });

            // 호스트가 나갔을 때
            if (userKey === leaveUser.Room.userKey) {
                let param = { nickname: leaveUser.User.nickname };
                socket.broadcast.to(leaveUser.Room.title).emit('byeHost', param);
            } else {
                // 일반유저가 나갔을 때(호스트X)
                await Chat.create({
                    roomKey,
                    userKey: 12, // 관리자 유저키
                    chat: `${leaveUser.User.nickname}님이 퇴장했습니다.`,
                });

                let param = { nickname: leaveUser.User.nickname };
                io.to(leaveUser.Room.title).emit('bye', param);
                //이 코드는 현재 클라이언트 소켓이 참여하고 있는 모든 방(room)에서 해당 소켓을 제외시키는 역할을 합니다.
                var rooms = io.sockets.adapter.sids[socket.id]; for (var room in rooms) { socket.leave(room); }
            }
        });
    });
};