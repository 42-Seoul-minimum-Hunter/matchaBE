const express = require("express");
const router = express.Router();
const socket = require("socket.io");
const jwt = require("jsonwebtoken");

const userReposiotry = require("../repositories/user.repository");
const userChatService = require("../services/user.chat.service");
const userLikeService = require("../services/user.like.service");
const userViewService = require("../services/user.view.service");
const userService = require("../services/user.service");
const userAlarmService = require("../services/user.alarm.service");

const userAlarmRepository = require("../repositories/user.alarm.repository");

const { verifyAllprocess, verifySocket } = require("../configs/middleware");

const logger = require("../configs/logger");

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

module.exports = (server, app) => {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://localhost:5173/email", "http://localhost:5173/twofactor",
        "http://127.0.0.1:3000"
      ],
      credentials: true,
    },
  });
  // 소캣 연결
  io.on("connection", async (socket) => {
    try {
      logger.info("user.socket.js connection: " + socket.handshake.auth.authorization);
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

      console.log("소켓 연결됨", socket.id);

      const { id, email } = socket.jwtInfo;
      //const jwt = socket.handshake.headers.authorization.split(" ")[1];

      // 유저 아이디
      //const userId = socket.handshake.header["userId"];
      //const userId = socket.handshake.auth["userId"];

      if (!id) {
        await socket.disconnect();
        return;
      }

      // 유저 접속 상태
      
      userActivate.set(id, socket.id);
      await socket.join(socket.id);

      // 채팅 입장
      // TODO: username이 올바른 지
      // TODO: 채팅방이 만들어 질 수 있는지
      // TODO: 채팅이력이 있는지 확인
      socket.on("joinChatRoom", async (data) => {
        try {
          logger.info("user.socket.js joinChatRoom: " + data);
          var rooms = io.sockets.adapter.sids[socket.id];
          for (var room in rooms) {
            if (room !== socket.id) socket.leave(room);
          }

          const { username } = data;

          //console.log("username", username);
          //console.log("id", id);

          if (!id || !username) {
            return;
          }

          const chatedInfo = await userService.findOneUserByUsername(username);
          //console.log("chatedInfo", chatedInfo);

          const userInfo = await userService.findOneUserById(id);
          //console.log("userInfo", userInfo);

          if (!chatedInfo) {
            return ;
          }

          const chatRoomInfo = await userChatService.findOneChatRoomById(
            id,
            chatedInfo.id
          );
          
          if (!chatRoomInfo) {
            return ;
          }

          //console.log("chatRoomInfo", chatRoomInfo);

          const chatHistories =
            await userChatService.findAllChatHistoriesByRoomId(chatRoomInfo.id);

          //console.log("chatHistories", chatHistories);

          let chatInfos = [];

          if (chatHistories) {
            chatHistories.forEach((chat) => {
              let param = {
                message: chat.content,
                username:
                  chat.user_id === id ? userInfo.username : chatedInfo.username,
                time: chat.created_at, // (9시간 차이나는 시간)
              };
              console.log("param", param);
              chatInfos.push(param);
            });

            io.to(socket.id).emit("sendHistories", chatInfos);
          } else {
            io.to(socket.id).emit("sendHistories", null);
          }
          socket.join(chatRoomInfo.id);
        } catch (error) {
          console.log(error);
          throw error;
        }
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

    // 채팅 받아서 저장하고, 그 채팅 보내서 보여주기
    socket.on("sendMessage", async (data) => {
      try {
        logger.info("user.socket.js sendMessage: " + data);
        const { message, username } = data;

        if (!message || !username) {
          return ;
        }

        const userInfo = await userReposiotry.findUserByUsername(username);

        if (!userInfo) {
          return ;
        }

        const chatRoomInfo = await userChatService.findOneChatRoomById(
          id,
          userInfo.id
        );

        if (!chatRoomInfo) {
          return ;
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
        io.to(userActivate.get(userInfo.id)).emit("alarm", {
          AlarmType: "MESSAGED",
          username,
        });
        await userAlarmRepository.saveAlarmById(id, userInfo.id, "MESSAGED");
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    socket.on("onlineStatus", async (data) => {
      logger.info("user.socket.js onlineStatus: " + data);
      try {
        const { username } = data;

        const userInfo = await userReposiotry.findUserByUsername(username);

        if (!userInfo) {
          socket.emit("onlineStatus", false);
        } else if (userActivate.get(userInfo.id)) {
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

    socket.on("likeUser", async (data) => {
      try {
        logger.info("user.socket.js likeUser: " + data);
        const { username } = data;

        if (!username) {
          return;
        } 
        const userInfo = await userReposiotry.findUserByUsername(username);

        if (!userInfo) {
          return;
        }

        const result = await userLikeService.likeUserByUsername(username, id);

        io.to()
        await io.to(userActivate.get(userInfo.id)).emit("alarm", {
          AlarmType: "LIKED",
          username,
        }); //유저가 좋아요를 받았을때

        if (result) {
          await io.to(userActivate.get(userInfo.id)).emit("alarm", {
            alarmType: "MATCHED",
            username: userInfo.username,
          });
        }
      } catch (error) {
        console.log(error);
        return;
      }
    });

    socket.on("dislikeUser", async (data) => {
      try {
        logger.info("user.socket.js dislikeUser: " + data);
        const { username } = data;

        if (!username) {
          return;
        }

        const userInfo = await userReposiotry.findUserByUsername(username);
        if (!userInfo) {
          return;
        }

        const result = await userLikeService.dislikeUserByUsername(
          username,
          id
        );

        if (result) {
          //연결된 유저가 좋아요를 취소했을때
          await io.to(userAwctivate.get(userInfo.id)).emit("alarm", {
            alarmType: "DISLIKED",
            username,
          });
        }
      } catch (error) {
        console.log(error);
        return false;
      }
    });

    socket.on("visitUserProfile", async (data) => {
      try {
        logger.info("user.socket.js visitUserProfile: " + data)
        const { username } = data;

        if (!username) {
          return;
        }

        const userInfo = await userReposiotry.findUserByUsername(username);

        if (!userInfo) {
          return;
        }

        await io.to(userActivate.get(userInfo.id)).emit("alarm", {
          alarmType: "VISITED",
          username,
        }); //유저의 프로필을 방문했을때

        await userViewService.saveVisitHistoryById(username, id);
      } catch (error) {
        console.log(error);
        return false;
      }
    });

    socket.on("getAlarms", async () => {
      try {
        logger.info("user.socket.js getAlarms")

        const alarms = await userAlarmService.findAllAlarmsById(id);
        await userAlarmService.deleteAllAlarmsById(id);
        return alarms;
      } catch (error) {
        console.log(error);
        return false;
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
        logger.info("user.socket.js disconnect: " + socket.handshake.auth.authorization)

        //이 코드는 현재 클라이언트 소켓이 참여하고 있는 모든 방(room)에서 해당 소켓을 제외시키는 역할을 합니다.
        var rooms = io.sockets.adapter.sids[socket.id];
        for (var room in rooms) {
          socket.leave(room);
        }

        // 유저 접속 상태
        const userKey = Object.keys(userActivate).find(
          (key) => userActivate[key] === socket.id
        );

        console.log("userKey", userKey);
        if (userKey) {
          userActivate.delete(userKey);
        } else {
          console.log(`Could not find user key for socket ${socket.id}`);
        }
      } catch (error) {
        console.log(error);
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
