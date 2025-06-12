// 5️⃣. Insert data
import crypto from "crypto";
import {
  getAllShortLinks,
  getShortLinkByShortCode,
  insertShortLink,
  findShortLinkById,
  updateShortCode,
  deleteShortCodeById,
} from "../services/shortener.services.js";

import z from "zod";
import { shortenerSchema, shortenerSearchParamsSchema } from "../validators/shortener-validator.js";


export const getShortenerPage = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");       // video 85. connect users with(foreign key)
    const links = await getAllShortLinks(req.user.id);  // video 85. add "req.user.id"
    res.render("index", { links, host: req.host, errors: req.flash("errors"), success: req.flash("success") });  // video 87. pass req.flash
  } catch (error) {
    console.error("Error in GET /:", error);
    res.status(500).send("❌ Internal server Error getShortenerPage");
  }
};


export const postURLShortener = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");   // video 85. this avoid to home page without register / login

    const { data, error } = shortenerSchema.safeParse(req.body);
    // console.log(data, error);

    if (error) {
      const errorMessage = error.errors[0].message;
      req.flash("errors", errorMessage);
      return res.redirect("/");
    }

    const { url, shortCode } = data;
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
    const link = await getShortLinkByShortCode(finalShortCode);

    if (link) {        // video 87
      req.flash(
        "errors",
        "Url with that shortcode already exists, please choose another"
      );
      return res.redirect("/");
    }

    await insertShortLink({ url, finalShortCode, userId: req.user.id });
    res.status(201).redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Internal server error from postURLShortener");
  }
};


export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const link = await getShortLinkByShortCode(shortCode);
    if (!link) return res.status(404).send("❌ 404 error occurred from (redirectToShortLink)");
    res.redirect(link.url);
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Internal server error from ");
  }
};


export const getShortenerEditPage = async(req, res) =>{   // video 87.
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  // console.log(id)
  if(error) return res.redirect('/404');

  try {
    const shortLink = await findShortLinkById(id);
    if(!shortLink) return res.redirect("/404");

    res.render('edit-shortLink', {  // In video 87. send data to "edit-shortLink.ejs" file
      id:shortLink.id, 
      url:shortLink.url, 
      shortCode: shortLink.shortCode,
      errors: req.flash('errors')
    })

  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error from getShortenerEditPage");
  }
}

export const postShortenerEditPage = async (req, res) => {  //  87. part 2. updateshortcode
  if (!req.user) return res.redirect('/login');
  
  const {data: id, error} = z.coerce.number().int().safeParse(req.params.id)
  console.log(id)

  if (error) return res.redirect('/404');

  try {
    const {url, shortCode } = req.body;
    const newUpdatedShortCode = await updateShortCode({ id, url, shortCode });

    if(!newUpdatedShortCode) return res.redirect("/404");
    res.redirect('/');
    
  } catch (error) {
    if (error.code ==="ER_DUP_ENTRY") {
      req.flash("errors","Shortcode is already exists, Please choose another.");
      res.redirect(`/edit/${id}`);
    }
    console.error(error);
    res.status(500).send("Internal server error from postShortenerEditPage.");
  }
}


export const deleteShortCode = async (req, res) => {
  try {
    const {data: id, error} = z.coerce.number().int().safeParse(req.params.id);
    console.log(id);

    if(error) return res.redirect("/404");

    await deleteShortCodeById(id);

    if(id) {  // 88
      req.flash("success", "Url Deleted..!");
      return res.redirect('/');
    }

  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error from deleteShortCode.")
  }  
}