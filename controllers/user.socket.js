const express = require("express");
const router = express.Router();
const socket = require("socket.io");

const userReposiotry = require("../repositories/user.repository");
const userChatService = require("../services/user.chat.service");
const userLikeService = require("../services/user.like.service");
const userService = require("../services/user.service");

/* 필요한 기능
- 유저는 다음 알림들을 실시간으로 보내야 한다
    - 유저가 좋아요를 받았을때
    - 유저의 프로필을 방문했을때
    - 유저가 메세지를 받았을때
    - 좋아요를 눌렀던 유저에게 좋아요를 받았을때 (연결됨)
    - 연결된 유저가 좋아요를 취소했을때
- 유저는 어떤 페이지에서도 알림이 왔던 것을 알수 있어야 함
- 유저간 연결 (채팅), 알림은 10초 이내에 이루어져야 한다
*/

const userActivate = {};

module.exports = (server, app) => {
  const io = socket(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });
  // 소캣 연결
  io.on("connection", (socket) => {
    // 클라이언트가 보낸 데이터 접근
    //const jwt = socket.handshake.headers.authorization.split(" ")[1];

    // 유저 아이디
    //const userId = socket.handshake.header["userId"];
    const userId = socket.handshake.auth["userId"];

    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log("유저아이디", userId);

    // 유저 접속 상태
    userActivate[userId] = socket.id;

    console.log("소켓 연결됨", socket.id);

    // 채팅 입장
    // TODO: username이 올바른 지
    // TODO: 채팅방이 만들어 질 수 있는지
    // TODO: 채팅이력이 있는지 확인
    socket.on("joinChatRoom", async (data) => {
      try {
        var rooms = io.sockets.adapter.sids[socket.id];
        for (var room in rooms) {
          socket.leave(room);
        }
        console.log("joinChatRoom", data);
        const { username } = data;

        console.log("username", username);
        console.log("userId", userId);

        if (!userId || !username) {
          return;
        }

        const chatedInfo = await userService.findOneUserByUsername(username);
        console.log("chatedInfo", chatedInfo);

        const userInfo = await userService.findOneUserById(userId);
        console.log("userInfo", userInfo);

        if (!chatedInfo) {
          const Error = new Error("User not found");
          Error.status = 404;
          throw Error;
        }

        const chatRoomInfo = await userChatService.findOneChatRoomById(
          userId,
          chatedInfo.id
        );

        console.log("chatRoomInfo", chatRoomInfo);

        if (!chatRoomInfo) {
          const Error = new Error("Chat room not found");
          Error.status = 404;
          throw Error;
        }

        const chatHistories =
          await userChatService.findAllChatHistoriesByRoomId(chatRoomInfo.id);

        console.log("chatHistories", chatHistories);

        let chatInfos = [];

        if (chatHistories) {
          chatHistories.forEach((chat) => {
            let param = {
              message: chat.content,
              username:
                chat.user_id === userId
                  ? userInfo.username
                  : chatedInfo.username,
              time: chat.created_at, // (9시간 차이나는 시간)
            };
            console.log("param", param);
            chatInfos.push(param);
          });

          io.emit("sendHistories", chatInfos);
        } else {
          io.emit("sendHistories", null);
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    // 채팅 받아서 저장하고, 그 채팅 보내서 보여주기
    socket.on("send_message", async (data) => {
      let { message, roomKey, userKey } = data;
      const newChat = await Chat.create({
        roomKey,
        userKey,
        chat: message,
      });
      const chatUser = await Participant.findOne({
        where: { roomKey, userKey },
        include: [
          { model: User, attributes: ["nickname"] },
          { model: Room, attributes: ["title"] },
        ],
      });

      // 채팅 보내주기
      let param = {
        message,
        roomKey,
        nickname: chatUser.User.nickname,
        time: newChat.createdAt, // (9시간 차이나는 시간)
      };

      io.to(chatUser.Room.title).emit("message", param);
    });

    socket.on("onlineStatus", async (data) => {
      try {
        console.log("onlineStatus", data);
        const { username } = data;

        const userInfo = await userReposiotry.findUserByUsername(username);

        if (!userInfo) {
          const Error = new Error("User not found");
          Error.status = 404;
          throw Error;
        } else if (userActivate[userInfo.id]) {
          console.log("user online");
          //return socket.to(userActivate[userId]).emit("onlineStatus", true);
          socket.emit("onlineStatus", true);
        } else {
          console.log("user offline");
          //TODO: 자기 자신에게만 보내지는지 확인
          //return socket.to(userActivate[userId]).emit("onlineStatus", false);
          socket.emit("onlineStatus", false);
        }
      } catch (error) {
        console.log(error);
        return false;
      }
    });

    socket.on("disconnect", () => {
      console.log("소켓 연결 해제됨", socket.id);

      //이 코드는 현재 클라이언트 소켓이 참여하고 있는 모든 방(room)에서 해당 소켓을 제외시키는 역할을 합니다.
      var rooms = io.sockets.adapter.sids[socket.id];
      for (var room in rooms) {
        socket.leave(room);
      }

      // 유저 접속 상태
      delete userActivate[userId];
    });

    // 채팅방 나가기(채팅방에서 아에 퇴장)
    //socket.on("leave-room", async (data) => {
    //  let { roomKey, userKey } = data;
    //  const leaveUser = await Participant.findOne({
    //    where: { roomKey, userKey },
    //    include: [
    //      { model: User, attributes: ["nickname"] },
    //      { model: Room, attributes: ["title", "userKey"] },
    //    ],
    //  });

    //  // 호스트가 나갔을 때
    //  if (userKey === leaveUser.Room.userKey) {
    //    let param = { nickname: leaveUser.User.nickname };
    //    socket.broadcast.to(leaveUser.Room.title).emit("byeHost", param);
    //  } else {
    //    // 일반유저가 나갔을 때(호스트X)
    //    await Chat.create({
    //      roomKey,
    //      userKey: 12, // 관리자 유저키
    //      chat: `${leaveUser.User.nickname}님이 퇴장했습니다.`,
    //    });

    //    let param = { nickname: leaveUser.User.nickname };
    //    io.to(leaveUser.Room.title).emit("bye", param);
    //    //이 코드는 현재 클라이언트 소켓이 참여하고 있는 모든 방(room)에서 해당 소켓을 제외시키는 역할을 합니다.
    //    var rooms = io.sockets.adapter.sids[socket.id];
    //    for (var room in rooms) {
    //      socket.leave(room);
    //    }
    //  }
    //});
  });
};
