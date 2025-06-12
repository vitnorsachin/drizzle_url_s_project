// video 86. step 1. Create schema for user validation
import z from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(3, { message: "Name must be at least 3 characters long." })
  .max(100, { message: "Name must be no more than 100 characters" });

const emailSchema = z
  .string()
  .trim()
  .email({ message: "Please enter a valid email address." })
  .max(100, { message: "Email must be no more than 100 characters." });


export const loginUserSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password must be no more than 100 characters." }),
});


export const registerUserSchema = loginUserSchema.extend({
  name: nameSchema,
});


export const verifyEmailSchema = z.object({ // video 105. this for cheking "token" validation
  token: z.string().trim().length(8),
  email: z.string().trim().email(),
});


export const verifyUserSchema = z.object({
  name: nameSchema,
});


export const verifyPasswordSchema = z       // video 115. zod validation for password change
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current Password is required!" }),
    newPassword: z
      .string()
      .min(6, { message: "New Password must be at least 6 characters long." })
      .max(100, {
        message: "New Password must be no more than 100 characters.",
      }),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm Password must be at least 6 characters long.",
      })
      .max(100, {
        message: "Confirm Password must be no more than 100 characters.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {     // vidoe 117
    message: "Passwords don't match",
    path: ["confirmPassword"], // Error will be associated with confirmPassword field
  });

  
export const forgotPasswordSchema = z.object({                       // video 118
  email: emailSchema,
});


const passwordSchema = z                                             // video 122
  .object({
    newPassword: z
      .string()
      .min(6, { message: "New Password must be at least 6 characters long." })
      .max(100, {
        message: "New Password must be no more than 100 characters.",
      }),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm Password must be at least 6 characters long.",
      })
      .max(100, {
        message: "Confirm Password must be no more than 100 characters.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {   // this check newPass=confirmPass
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const verifyResetPasswordSchema = passwordSchema;
export const setPasswordSchema = passwordSchema;