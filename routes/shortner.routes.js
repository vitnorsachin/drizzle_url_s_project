import { Router } from "express";
import {
  getShortenerPage,
  postURLShortener,
  redirectToShortLink,
  getShortenerEditPage,
  postShortenerEditPage,
  deleteShortCode,
} from "../controllers/shortener.controller.js";

const router = Router();

router.get("/", getShortenerPage);
router.post("/", postURLShortener);
router.get("/:shortCode", redirectToShortLink);
router.route("/edit/:id").get(getShortenerEditPage).post(postShortenerEditPage); // video 87. part-1 & part-2

router.route("/delete/:id").post(deleteShortCode);

export const shortenerRoutes = router;