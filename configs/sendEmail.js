//https://velog.io/@hoonnn/NodeJS-%EC%9D%B4%EB%A9%94%EC%9D%BC-%EB%B0%9C%EC%86%A1-%EA%B8%B0%EB%8A%A5-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0

const nodemailer = require("nodemailer"); // 이메일 전송을 위한 nodemailer 모듈 불러오기
const logger = require("./logger.js");
require("dotenv").config();

async function sendEmail({ to, subject, text }) {
  try {
    if (!to || !subject || !text) {
      const error = new Error("Email, subject, text are required.");
      error.status = 400;
      throw error;
    }

    // 이메일 전송을 위한 메일 서버 연결
    const transporter = nodemailer.createTransport({
      service: "gmail", // 사용할 이메일 서비스 제공자 (gmail, naver, outlook 등)
      host: "smtp.gmail.com", // 사용할 이메일 서비스의 호스트 주소 (gmail)
      port: 587, // 이메일 서비스의 포트 번호 (일반적으로 25, 587, 465, 2525 중 하나 사용)
      auth: {
        // 이메일 서버 인증을 위한 사용자의 이메일 주소와 비밀번호
        user: process.env.EMAIL_ADDRESS, // 이메일 주소
        pass: process.env.EMAIL_PASSWORD, // 이메일 비밀번호 (그대로 노출되기 때문에 구글의 app 패스워드를 사용할 것을 추천한다.)
      },
    });

    // 메일 옵션 설정
    const mailOptions = {
      from: "yeomin@student.42seoul.kr",
      to,
      subject,
      text,
    };

    logger.info("mail options:", mailOptions);

    // 이메일 전송
    const result = await transporter.sendMail(mailOptions);
  } catch (error) {
    logger.error("sendEmail error: " + error.message)
    throw error;
  }
}

module.exports = sendEmail;
