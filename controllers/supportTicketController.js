const { StatusCodes } = require("http-status-codes");
const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");
const { sendTicketEmail } = require("../utils");

const createTicket = async (req, res) => {
  const { subject, message } = req.body;

  const user = await User.findById(req.user.userId)
    .populate("_id email")
    .lean();

  if (!user) {
    throw new CustomError.NotFoundError(`User not found`);
  }

  const ticket = await SupportTicket.create({
    subject,
    message,
    user: user._id,
  });

  await sendTicketEmail({
    userId: user._id,
    email: user.email,
    subject,
    message,
  });

  res
    .status(StatusCodes.CREATED)
    .json({
      ticket,
      msg: "Ticket sent successfully. Please wait for a response from our support team",
    });
};

const getAllTickets = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const tickets = await SupportTicket.find()
    .populate({
      path: "user",
      select: "_id username email",
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const count = await SupportTicket.countDocuments();

  res
    .status(StatusCodes.OK)
    .json({ tickets, count: tickets.length, pages: Math.ceil(count / limit) });
};

const getUserTickets = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const tickets = await SupportTicket.find({ user: req.user.userId })
    .populate({
      path: "user",
      select: "_id username email",
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const count = await SupportTicket.countDocuments({ user: req.user.userId });

  res
    .status(StatusCodes.OK)
    .json({ tickets, count: tickets.length, pages: Math.ceil(count / limit) });
};

const resolveTicket = async (req, res) => {
  const { id } = req.params;

  const ticket = await SupportTicket.findById(id);

  if (!ticket) {
    throw new CustomError.NotFoundError(`Ticket not found`);
  }

  ticket.status = "resolved";
  await ticket.save();

  res.status(StatusCodes.OK).json({ msg: "Ticket resolved" });
};

const closeTicket = async (req, res) => {
  const { id } = req.params;

  const ticket = await SupportTicket.findById(id);

  if (!ticket) {
    throw new CustomError.NotFoundError(`Ticket not found`);
  }

  ticket.status = "closed";
  await ticket.save();

  res.status(StatusCodes.OK).json({ msg: "Ticket closed" });
};

const deleteTicket = async (req, res) => {
  const { id } = req.params;

  const ticket = await SupportTicket.findById(id);

  if (!ticket) {
    throw new CustomError.NotFoundError(`Ticket not found`);
  }

  await SupportTicket.findOneAndDelete({ _id: id });
  res.status(StatusCodes.OK).json({ msg: "Ticket deleted successfully" });
};

module.exports = {
  createTicket,
  getAllTickets,
  getUserTickets,
  deleteTicket,
  resolveTicket,
  closeTicket,
};
