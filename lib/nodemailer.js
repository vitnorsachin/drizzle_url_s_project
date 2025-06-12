// video 102. send email using "nodemailer"
import nodemailer from "nodemailer";
import chalk from "chalk";


let testAccount;
try {
  testAccount = await nodemailer.createTestAccount();
} catch (err) {
  console.error(
    chalk.redBright("\nFailed to create test account (likely No Internet):"),
    err.message
  );
}

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: `'URL SHORTENER' < ${testAccount.user} >`,
    to,
    subject,
    html,
  });

  const testEmailURL = nodemailer.getTestMessageUrl(info);
  console.log("Verify Email: ", chalk.greenBright(testEmailURL));
};