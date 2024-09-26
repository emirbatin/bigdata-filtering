const isAdmin = (req, res, next) => {
  if (req.user && req.user.permission === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Only admin can access this resource" });
};

export default isAdmin;
