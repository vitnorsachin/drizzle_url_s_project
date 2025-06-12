import chalk from "chalk";
import cookieParser from "cookie-parser";
import express from "express";
import flash from "connect-flash";
import requestIp from "request-ip";
import session from "express-session";

import { authRoutes } from "./routes/auth.routes.js";
import { verifyAuthentication } from "./middlewares/verify.midddleware.js";
import { shortenerRoutes } from "./routes/shortner.routes.js";


const app = express();
const PORT = 3001;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

app.use(session({secret:"my-secret", resave: true, saveUninitialized: false})); // video 83. step 1
app.use(flash());

app.use(requestIp.mw()); // video 91

app.use(verifyAuthentication); // video:80 => middleware for veryfy JWT token in node.js (this must after cookie-parser)

app.use((req, res, next)=>{// video:81 => here "user" variable value can access any "ejs" file in entire express application, "req.user" came from browser
  res.locals.user = req.user; 
  return next();
})
debugger;
app.use(authRoutes); // step 1️⃣. for create routes
app.use(shortenerRoutes);


try {
  app.listen(PORT, () => {
    console.log(
      chalk.greenBright(`Server running 🏃🏃 at : http://localhost:${PORT}`)
    );
  });
} catch (error) {
  console.error(error);
}