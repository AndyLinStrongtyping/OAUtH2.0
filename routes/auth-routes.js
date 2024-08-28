const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/login",(req,res) => {
    return res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user } );
});

router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
    })
  );

  router.post("/signup", async (req, res) => {
    let { name, email, password } = req.body;
    if (password.length < 8) {
       req.flash("error_msg", "密碼長度過短，至少需8個英文或數字。");
       return res.redirect("/auth/signup");
    }

    

    //確認信箱是否被註冊過
    const foundEmail = await User.findOne({ email });
    if (foundEmail) {
      req.flash("error_msg", "信箱已經被註冊，請使用別的信箱或是登入已有帳號。")
      return res.redirect("/auth/signup");
    };

    let hashedPassword = await bcrypt.hash(password, 12);
    let newUser = new User({ name, email, password: hashedPassword});
    let savedUser = newUser.save();
    req.flash("success_msg", "註冊成功! 現在已可使用註冊帳號登入")
    return res.redirect("/auth/login");
  });

  router.post("/login", passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "登入失敗，帳號或密碼錯誤",
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

  router.get("/google/redirecct", passport.authenticate("google"), (req, res) => {
    console.log("進入redirect區域");
    return res.redirect("/profile");
  })

module.exports = router;