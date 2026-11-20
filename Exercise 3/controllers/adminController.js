const getDashboard = (req, res) => {
  res.status(200).json({
    message: `Welcome to the admin dashboard, ${req.user.name}!`,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

export default getDashboard;
