const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
    console.log("序列化使用者");
    done(null, user._id);//把mongoDB裡的id塞到session並簽名烤成餅乾給使用者吃


});

passport.deserializeUser(async (_id, done) => {
    console.log(
        "逆序列化使用者,序列化的數據儲存的ID轉換回原始對象"
    );
    let foundUser = await User.findOne({ _id });
    done(null, foundUser); //req.use屬性設為foundUser
});


passport.use(
    new GoogleStrategy(
        {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:"http://localhost:3030/auth/google/redirecct",
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log("進入Google Stragtegy的區域");
        //console.log(profile);
        //console.log("======================");
        let foundUser = await User.findOne({ googleID: profile.id }).exec();
        if (foundUser) {
          console.log("使用者已經註冊過了。無須存入資料庫內。");
          done(null, foundUser);
        } else {
          console.log("偵測到新用戶。須將資料存入資料庫內");
          let newUser = new User({
            name: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
            email: profile.emails[0].value,
          });
          let savedUser = await newUser.save();
          console.log("成功創建新用戶。");
          done(null, savedUser);
        }
      }
    )
  );

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      let foundUser = await User.findOne({ email: username });
      if (foundUser) {
        let result = await bcrypt.compare(password, foundUser.password);
        if (result) {
          done(null, foundUser);
        } else {
          done(null, false);
        }
      } else {
        done(null, false);
      }
    })
  );
  

  
