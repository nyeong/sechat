# SECHAT

## 실행 방법

* node.js를 설치합니다.
* 프로젝트 루트에서 `npm i`를 실행합니다.
* 프로젝트 루트에서 `node server.js`를 실행합니다.

## 프로젝트 구성

- FrontEnd: EJS
- BackEnd: Nodejs
- DB: MongoDB hosting by mLab

### JavaScript

*클래스 기반 객체지향*이 아니라 *프로토타입 기반 객체지향* 언어입니다.

### MongoDB

MongoDB는 테이블 구조로 자료를 저장하는 전통적 DB와 다르게 자바스크립트 포맷으로 자료를 저장합니다.

```
{
    "title": "정의란 무엇인가",
    "author": {
        "name": "마이클 센델",
    },
    "isbn": "SF23940234",
    "comments": [
        { "username": "마이클 조던", "body": "이 책을 읽고 암이 나았습니다" },
        { "username": "원종철 신부", "body": "이 책을 읽고 나를 찾았습니다" }
    ]
}
```

초기 설정이 필요 없기 때문에, MySQL 같은 전통적 DB보다 더 빠르게 데이터베이스를 구축할 수 있고,
더 복잡한 관계를 표현할 수 있는 장점이 있습니다.

## 프로젝트 계층

```
./
├── app/
│  ├── models/
│  │  ├── event.js
│  │  ├── group.js
│  │  ├── message.js
│  │  └── user.js
│  ├── routes/
│  │  ├── groups.js
│  │  ├── home.js
│  │  └── sessions.js
│  ├── sockets.js
│  ├── utils.js
│  └── views/
│     ├── error.ejs
│     ├── home.ejs
│     ├── layout.ejs
│     ├── login.ejs
│     └── partials/
├── package-lock.json
├── package.json
├── public/
│  ├── semantic.min.css
│  ├── semantic.min.js
│  ├── style.css
│  └── themes/
├── README.md
└── server.js
```

* `server.js`: 서버의 entry point.
* `package.json`: node.js에서 쓰고 있는 외부 라이브러리 목록입니다.
* `public/`: robot.txt, css, js, 이미지 등



## `app/models/`

서버에서 사용하는 DB 모델이 정의되어 있는 폴더입니다.

```js
// app/modules/event.js

// mongoose라는 외부 라이브러리를 불러옵니다.
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema를 상속하여 새로운 클래스를 만들고, 해당 클래스의 인스턴스를 만들어 `Event` 변수에 할당합니다.
// Schema 클래스는 해당 테이블의 자료 구조를 선언하는 클래스입니다. 
const Event = new Schema({
  // body는 String 타입이고 반드시 필요합니다.
  body: { type: String, required: true },
  // date는 Date 타입이고 반드시 필요합니다.
  date: { type: Date, required: true },
  // group은 Id 타입이고 반드시 필요합니다.
  group: { type: Schema.Types.ObjectId, required: true }
});

// Event라는 Schema로부터 model을 만들고, 다른 파일에서 쓸 수 있도록 합니다.
// `module.exports`에 이를 할당해 놓으면 다른 파일에서
// `const Event = require('models/events.js');`
// 로 사용할 수 있습니다.
module.exports = mongoose.model("event", Event);
```

위처럼 만든 클래스는 router들이 사용합니다.

```js
// app/routes/sessions.js

const express = require("express");
const router = express.Router();
// 아래처럼 User model을 불러와서...
const User = require("../models/user"); 

// ...

router.post("/api/sessions/login", (req, res) => {
  // 이렇게 User model을 사용합니다.
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) throw err;
    if (!user) return res.status(404).json({ error: "해당 유저가 없습니다." });
    if (!user.verifyPassword(req.body.password))
      return res
        .status(401)
        .json({ error: "아이디와 비밀번호가 맞지 않습니다." });
    req.session.user = user;
    res.json({
      success: true
    });
  });
});
```

## `app/routes/`

서버로 들어오는 요청 (`/login` 등등)을 처리하는 클래스들이 정의되어 있습니다.

```js
// app/routes/sessions.js

// express라는 외부 라이브러리를 불러옵니다.
const express = require("express");
// router라는 Router 클래스의 객체를 만듭니다.
const router = express.Router();
// User model을 불러옵니다.
const User = require("../models/user");

// router에 새로운 메소드를 등록합니다.
// 브라우저에서 '/login'으로 접속하면 login 화면을 보여줍니다.
// req는 브라우저에서 서버로 보낸 요청에 대한 정보가 담긴 변수이고,
// res는 서버에서 브라우저로 보낼 답변에 대한 정보가 담긴 변수입니다.
router.get("/login", (req, res) => {
  // res.render 함수는 app/views/ 폴더에 있는 페이지를 html로 만들어 브라우저로 돌려줍니다.
  res.render("login");
});

// router에 새로운 메소드를 등록합니다.
// 브라우저에서 '/api/sessions/login'으로 요청을 보내면 이 메소드가 작동합니다.
router.post("/api/sessions/login", (req, res) => {
  // 먼저 DB에서 브라우저가 보낸 username이 있는 유저가 있는지 찾아봅니다.
  User.findOne({ username: req.body.username }, (err, user) => {
    // 에러 처리
    if (err) throw err;
    // 유저가 없을 경우, 404 Not Found 에러를 반환합니다.
    if (!user) return res.status(404).json({ error: "해당 유저가 없습니다." });
    // 유저가 있을 경우 비밀번호가 맞는지 확인합니다.
    // 비밀번호가 다를 경우 401 에러를 반환합니다.
    if (!user.verifyPassword(req.body.password))
      return res
        .status(401)
        .json({ error: "아이디와 비밀번호가 맞지 않습니다." });
    // 로그인에 성공하면 session에 유저를 저장합니다.
    req.session.user = user;
    // 성공했다고 결과를 반환합니다.
    res.json({
      success: true
    });
  });
});



module.exports = router;
```
