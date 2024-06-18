// express 불러오기
const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIO = require('socket.io');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
require('dotenv').config();

// express 인스턴스 생성
const app = express();
app.use(session({
    secret: process.env.SESSION_SECRET, // 세션 암호화에 사용되는 비밀 키
    resave: false, // 세션을 항상 저장할지 여부
    saveUninitialized: true // 초기화되지 않은 세션을 저장할지 여부
}));
const server = http.createServer(app);
const io = socketIO(server);

const userSocketController = require('./controllers/user.socket.js')(io);


// 포트 정보
const port = 3000;

const userRouter = require('./controllers/user.js');
const userRateRouter = require('./controllers/user.rate.js');
const userReportRouter = require('./controllers/user.report.js');
const userProfileRouter = require('./controllers/user.profile.js');
const authRouter = require('./controllers/auth.js');

app.use(express.json());
app.use(morgan('combined'));

app.set('socket.io', io);
app.use('/user', userRouter);
//app.use('/user/socket', userSocketController);
app.use('/user/rating', userRateRouter);
app.use('/user/report', userReportRouter);
app.use('/user/profile', userProfileRouter);
// app.user('/user/block', userBlockRouter);
app.use('/auth', authRouter);

app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
});

// 서버 실행
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});



//TODO : jwt 확인, 삭제된 유저인지 확인 + 유저 존재 유무 확인