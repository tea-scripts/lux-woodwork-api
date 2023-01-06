const express = require("express");
const {
  createTicket,
  getUserTickets,
  getAllTickets,
  deleteTicket,
  resolveTicket,
  closeTicket,
} = require("../controllers/supportTicketController.js");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllTickets)
  .post(authenticateUser, createTicket);

router
  .route("/:id")
  .delete(authenticateUser, authorizePermissions("admin"), deleteTicket);

router.route("/user").get(authenticateUser, getUserTickets);

router
  .route("/resolve/:id")
  .patch(authenticateUser, authorizePermissions("admin"), resolveTicket);

router
  .route("/close/:id")
  .patch(authenticateUser, authorizePermissions("admin"), closeTicket);

module.exports = router;
