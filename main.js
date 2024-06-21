// express 불러오기
const express = require("express");
const session = require("express-session");
const http = require("http");
const socketIO = require("socket.io");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

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
app.use(
  session({
    secret: process.env.SESSION_SECRET, // 세션 암호화에 사용되는 비밀 키
    resave: false, // 세션을 항상 저장할지 여부
    saveUninitialized: true, // 초기화되지 않은 세션을 저장할지 여부
  })
);
const server = http.createServer(app);
const io = socketIO(server);

//cors 허용
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

//cookie 설정
app.use(cookieParser("cookie_secret"));

// 포트 정보
const port = 3000;

const userRouter = require("./controllers/user.js");
const userRateRouter = require("./controllers/user.rate.js");
const userReportRouter = require("./controllers/user.report.js");
const userProfileRouter = require("./controllers/user.profile.js");
const userAlarmRouter = require("./controllers/user.alarm.js");
const authRouter = require("./controllers/auth.js");
const userChatRouter = require("./controllers/user.chat.js");

const socketRouter = require("./controllers/user.socket.js");

socketRouter(server, app);

app.use(express.json());
app.use(morgan("combined"));

app.set("socket.io", io);
app.use("/user", userRouter);
app.use("/user/rating", userRateRouter);
app.use("/user/report", userReportRouter);
app.use("/user/profile", userProfileRouter);
app.use("/user/alarm", userAlarmRouter);
// app.user('/user/block', userBlockRouter);
app.use("/user/chat", userChatRouter);
app.use("/auth", authRouter);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message });
});

// 서버 실행
app.listen(port, async () => {
  console.log(`App running on port ${port}...`);
  client.connect();

  try {
    // schema.sql 파일 읽기
    const schemaQuery = fs.readFileSync(
      path.join(__dirname, "configs", "schema.sql"),
      "utf8"
    );

    // 쿼리 실행
    await client.query(schemaQuery);
    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
});

//TODO : jwt 확인, 삭제된 유저인지 확인 + 유저 존재 유무 확인
