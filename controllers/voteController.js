const { Vote } = require("../db/models");
const AppError = require("../utils/appError");

const getVoteByParam = async (param) => {
  return await Vote.findOne({ ...param });
};

const createVote = async (data) => {
  const { userId, entryId, value } = data;
  const existingVote = await Vote.findOne({
    where: { user_id: userId, entry_id: entryId },
  });
  if (existingVote) throw new AppError("Entry already voted", 400);
  // Create vote
  const vote = await Vote.create({
    user_id: userId,
    entry_id: entryId,
    value: value,
  });
  // Return vote
  return vote;
};

const deleteVoteByParams = async (where) => {
  // Find vote
  const vote = await Vote.findOne({ where: where });
  if (!vote) throw new AppError("Vote not found", 400);
  // Delete vote
  await vote.destroy();
};

module.exports = {
  getVoteByParam,
  createVote,
  deleteVoteByParams,
};
