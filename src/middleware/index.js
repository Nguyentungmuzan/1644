async function loadSession(req, res, next) {
    const user = req.user
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image
    }
    await req.session.save()
    next();
}



module.exports = loadSession