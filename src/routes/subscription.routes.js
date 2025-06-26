import { Router } from 'express';
import {
    getRandomChannelSubscribers,
    getSubscribedChannels,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(getRandomChannelSubscribers)
    .post(toggleSubscription);

router.route("/u/:channelId").get(getSubscribedChannels);

export default router