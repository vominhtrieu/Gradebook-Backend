import express from "express";
import { getProfileHandler, updateAvatarHandler } from "../controllers/user.controller";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${Math.random()}.jpg`)
    }
})
const uploader = multer({ storage: storage })

router.get("/profile", getProfileHandler)
router.post("/avatar", uploader.single("avatar"), updateAvatarHandler)

export default router;
