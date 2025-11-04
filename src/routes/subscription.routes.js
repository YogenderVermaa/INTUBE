import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
} from "../controller/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/toggle/:channelId").post(toggleSubscription);

router.route("/subscribers/:channelId").get(getUserChannelSubscribers);

router.route("/subscribed/:subscriberId").get(getSubscribedChannels);

export default router;
