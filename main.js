// express 불러오기
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const verifySocket = require("./configs/middleware.js");

require("dotenv").config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// express 인스턴스 생성
const app = express();

const server = http.createServer(app);
const io = socketIO(server);

//cors 허용
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    //origin: true,
    credentials: true,
  })
);

//cookie 설정
app.use(cookieParser("cookie_secret"));

// 포트 정보
const port = 3000;
const wsPort = 3001;

const userRouter = require("./controllers/user.js");
const userRateRouter = require("./controllers/user.rate.js");
const userReportRouter = require("./controllers/user.report.js");
const userProfileRouter = require("./controllers/user.profile.js");
const userAlarmRouter = require("./controllers/user.alarm.js");
const authRouter = require("./controllers/auth.js");
const userChatRouter = require("./controllers/user.chat.js");
const userBlockRouter = require("./controllers/user.block.js");

const socketRouter = require("./controllers/user.socket.js");
const logger = require("./configs/logger.js");

socketRouter(server, app);

app.use(express.json());
//app.use(morgan("combined"));

app.set("socket.io", io);
app.use("/user", userRouter);
app.use("/user/rating", userRateRouter);
app.use("/user/report", userReportRouter);
app.use("/user/profile", userProfileRouter);
app.use("/user/alarm", userAlarmRouter);
app.use("/user/block", userBlockRouter);
app.use("/user/chat", userChatRouter);
app.use("/auth", authRouter);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).send(err.message);
});

app.use(morgan("combined", { stream: logger.stream })); // morgan 로그 설정

// 서버 실행
app.listen(port, async () => {
  logger.info(`App running on port ${port}...`);
  client.connect();

  try {
    // schema.sql 파일 읽기
    const schemaQuery = fs.readFileSync(
      path.join(__dirname, "configs", "schema.sql"),
      "utf8"
    );

    // 쿼리 실행
    await client.query(schemaQuery);
    logger.info("Tables created successfully!");

    // mock 데이터 삽입
    const usersMockQuery = fs.readFileSync(
      path.join(__dirname, "mocks", "users.mock.sql"),
      "utf8"
    );

    await client.query(usersMockQuery);

    logger.info("users mock data inserted successfully!");

    // mock 데이터 삽입
    const authMockQuery = fs.readFileSync(
      path.join(__dirname, "mocks", "auth.mock.sql"),
      "utf8"
    );

    await client.query(authMockQuery);

    logger.info("auth mock data inserted successfully!");

    const profileMockQuery = fs.readFileSync(
      path.join(__dirname, "mocks", "user.profileImages.mock.sql"),
      "utf8"
    );

    await client.query(profileMockQuery);

    logger.info("user_profile_images mock data inserted successfully!");

    const hashtagMockQuery = fs.readFileSync(
      path.join(__dirname, "mocks", "user.hashtags.mock.sql"),
      "utf8"
    );

    await client.query(hashtagMockQuery);

    logger.info("user_hashtags mock data inserted successfully!");

    const regionMockQuery = fs.readFileSync(
      path.join(__dirname, "mocks", "user.regions.mock.sql"),
      "utf8"
    );

    await client.query(regionMockQuery);

    logger.info("user_regions mock data inserted successfully!");

    const playableMockQuery = fs.readFileSync(
      path.join(__dirname, "mocks", "playable.mock.sql"),
      "utf8"
    );

    await client.query(playableMockQuery);
    logger.info("playable mock data inserted successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
});

// WebSocket 서버 실행
server.listen(wsPort, () => {
  logger.info(`WebSocket server running on port ${wsPort}...`);
});

io.use((socket, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message });
});
