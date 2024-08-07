const socket = require("socket.io");
const jwt = require("jsonwebtoken");

const userReposiotry = require("../repositories/user.repository");
const userChatService = require("../services/user.chat.service");
const userLikeService = require("../services/user.like.service");
const userViewService = require("../services/user.view.service");
const userAlarmService = require("../services/user.alarm.service");
const userBlockService = require("../services/user.block.service");

const userAlarmRepository = require("../repositories/user.alarm.repository");

const { verifyAllprocess, verifySocket } = require("../configs/middleware");

const logger = require("../configs/logger");
const { validateUsername } = require("../configs/validate");

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

const userActivate = new Map();

var userId;

module.exports = (server, app) => {
  const io = socket(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173/email",
        "http://localhost:5173/twofactor",
        "http://127.0.0.1:3000",
      ],
      credentials: true,
    },
  });
  // 소캣 연결
  io.on("connection", async (socket) => {
    try {
      logger.info(
        "user.socket.js connection: " +
          socket.handshake.auth.authorization +
          " " +
          socket.id
      );
      //JWT 토큰 검증
      if (!socket.handshake.auth.authorization) {
        await socket.disconnect();
        return;
      }
      const token = socket.handshake.auth.authorization;

      if (!token) {
        await socket.disconnect();
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.isValid === false) {
        await socket.disconnect();
        return;
      } else if (decoded.twofaVerified === false) {
        await socket.disconnect();
        return;
      }

      socket.jwtInfo = decoded;
      userId = socket.jwtInfo.id;

      if (!userId) {
        await socket.disconnect();
        return;
      }

      // 유저 접속 상태

      userActivate.set(userId, socket.id);
      await socket.join(socket.id);

      // 유저가 채팅목록 불러올때
      socket.on("getChatList", async () => {
        try {
          logger.info("user.socket.js getChatList");
          const chatList = await userChatService.findAllChatRooms(userId);
          return chatList;
        } catch (error) {
          logger.error("user.socket.js getChatList error: " + error.message);
          return false;
        }
      });

      // 유저가 채팅방에 들어갔을때
      socket.on("joinChatRoom", async (data) => {
        try {
          logger.info("user.socket.js joinChatRoom: " + JSON.stringify(data));
          const socketId = userActivate.get(userId);
          var rooms = io.sockets.adapter.sids[socketId];
          for (var room in rooms) {
            if (room !== socketId) socket.leave(room);
          }

          const username = data;

          if (!username || !validateUsername(username)) {
            return;
          }

          const userInfo = await userReposiotry.findUserByUsername(username);
          if (!userInfo) {
            return;
          }

          const chatRoomInfo = await userChatService.findOneChatRoomById(
            userId,
            userInfo.id
          );

          if (!chatRoomInfo) {
            return;
            return;
          }

          const chatHistories =
            await userChatService.findAllChatHistoriesByRoomId(chatRoomInfo.id);

          if (chatHistories) {
            const chatHistory = chatHistories.map(async (chat) => {
              const userInfo = await userReposiotry.findUserById(chat.userId);
              return {
                content: chat.content,
                username: userInfo.username,
                createdAt: chat.created_at,
              };
            });

            await io.to(socketId).emit("joinChatRoom", chatHistory);
          }

          await socket.join(chatRoomInfo.id);
        } catch (error) {
          logger.error("user.socket.js joinChatRoom error: " + error.message);
          throw error;
        }
      });
    } catch (error) {
      logger.error("user.socket.js connection error: " + error.message);
      return;
    }

    // 채팅 받아서 저장하고, 그 채팅 보내서 보여주기
    socket.on("sendMessage", async (data) => {
      try {
        logger.info("user.socket.js sendMessage: " + JSON.stringify(data));
        const { message, username } = data;

        if (!message || !username) {
          return;
        }

        const userInfo = await userReposiotry.findUserByUsername(username);

        if (!userInfo) {
          return;
        }

        const chatRoomInfo = await userChatService.findOneChatRoomById(
          userId,
          userInfo.id
        );

        if (!chatRoomInfo) {
          return;
        }
        const param = {
          message,
          username,
          time: new Date(),
        };

        await userChatService.saveSendedChatById(
          chatRoomInfo.id,
          userInfo.id,
          message
        );
        io.to(chatRoomInfo.id).emit("message", param);

        //유저가 메세지를 받았을때
        io.to(userActivate.get(userActivate.get(userInfo.id))).emit("alarm", {
          AlarmType: "MESSAGED",
        });
        await userAlarmService.saveAlarmById(id, userInfo.id, "MESSAGED");
      } catch (error) {
        logger.error("user.socket.js sendMessage error: " + error.message);
        return;
      }
    });

    socket.on("onlineStatus", async (data) => {
      try {
        logger.info("user.socket.js onlineStatus: " + JSON.stringify(data));
        const username = data;

        if (!username) {
          return;
        }

        const userInfo = await userReposiotry.findUserByUsername(username);

        if (!userInfo) {
          return;
        } else if (userActivate.get(userInfo.id)) {
          io.to(userActivate.get(userId)).emit("onlineStatus", true);
        } else {
          io.to(userActivate.get(userId)).emit("onlineStatus", false);
        }
      } catch (error) {
        logger.error("user.socket.js onlineStatus error: " + error.message);
        return;
      }
    });

    socket.on("likeUser", async (data) => {
      try {
        logger.info("user.socket.js likeUser: " + JSON.stringify(data));
        const username = data;

        if (!username) {
          return;
        }
        const userInfo = await userReposiotry.findUserByUsername(username);

        if (!userInfo) {
          return;
        }

        const result = await userLikeService.likeUserByUsername(
          username,
          userId
        );

        await io.to(userActivate.get(userInfo.id)).emit("alarm", {
          alarmType: "LIKED",
        }); //유저가 좋아요를 받았을때

        if (result) {
          await io.to(userActivate.get(userInfo.id)).emit("alarm", {
            alarmType: "MATCHED",
          });
          await io.to(userActivate.get(id)).emit("likeUser", {
            isMatched: true,
          });
          await io.to(userActivate.get(userInfo.id)).emit("likeUser", {
            isMatched: true,
          });
        }
      } catch (error) {
        logger.error("user.socket.js likeUser error: " + error.message);
        return;
      }
    });

    socket.on("dislikeUser", async (data) => {
      try {
        logger.info("user.socket.js dislikeUser: " + JSON.stringify(data));
        const username = data;

        if (!username) {
          return;
        }

        const userInfo = await userReposiotry.findUserByUsername(username);
        if (!userInfo) {
          return;
        }

        const result = await userLikeService.dislikeUserByUsername(
          username,
          userId
        );

        if (result) {
          //연결된 유저가 좋아요를 취소했을때
          await io.to(userActivate.get(userInfo.id)).emit("alarm", {
            alarmType: "DISLIKED",
            username,
          });
        }
      } catch (error) {
        logger.error("user.socket.js dislikeUser error: " + error.message);
        return;
      }
    });

    socket.on("visitUserProfile", async (data) => {
      try {
        logger.info("user.socket.js visitUserProfile: " + JSON.stringify(data));
        const username = data;

        console.log(username);

        if (!username) {
          const error = new Error("username is null");
          error.name = "Bad Request";
          throw error;
        }

        const userInfo = await userReposiotry.findUserByUsername(username);

        if (!userInfo) {
          const error = new Error("userInfo is null");
          error.name = "Bad Request";
          throw error;
        }

        await io.to(userActivate.get(userInfo.id)).emit("alarm", {
          alarmType: "VISITED",
        }); //유저의 프로필을 방문했을때

        await userViewService.saveVisitHistoryById(username, userId);
      } catch (error) {
        logger.error("user.socket.js visitUserProfile error: " + error.message);
        return;
      }
    });

    socket.on("getAlarms", async () => {
      try {
        logger.info("user.socket.js getAlarms");

        const alarms = await userAlarmService.findAllAlarmsById(userId);
        await userAlarmService.deleteAllAlarmsById(userId);

        await io.to(userActivate.get(userId)).emit("getAlarms", alarms);
      } catch (error) {
        logger.error("user.socket.js getAlarms error: " + error.message);
        return;
      }
    });

    //socket.on("sendAlarm", async (date) => {
    //  try {
    //    console.log(`sendAlarm : ${date.message}`)
    //    io.to(userActivate[0]).emit("alarm", {
    //      AlarmType: "LIKED",
    //      username: "test",
    //    });
    //  } catch (error) {
    //    console.log(error);
    //    return false;
    //  }
    //});

    socket.on("disconnect", async () => {
      try {
        logger.info(
          "user.socket.js disconnect: " + socket.handshake.auth.authorization
        );

        //이 코드는 현재 클라이언트 소켓이 참여하고 있는 모든 방(room)에서 해당 소켓을 제외시키는 역할을 합니다.
        var rooms = io.sockets.adapter.sids[socket.id];
        for (var room in rooms) {
          socket.leave(room);
        }

        // 유저 접속 상태
        const userKey = Object.keys(userActivate).find(
          (key) => userActivate[key] === socket.id
        );
        if (userKey) {
          userActivate.delete(userKey);
        } else {
          console.log(`Could not find user key for socket ${socket.id}`);
        }
      } catch (error) {
        logger.error("user.socket.js disconnect error: " + error.message);
        return;
      }
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

socket.exports = {
  userActivate,
};

// EMIT : 요청 보내는거
// ON : 요청 받는거

// client -> server getAlarms

// server -> 해당 유저의 쌓인 모든 알람을 보내고, DB에서 삭제 === deleted_at = now()
// server -> client emit getAlarms (알람들을 보내줌)

// client ON
