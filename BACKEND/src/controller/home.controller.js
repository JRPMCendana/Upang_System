class HomeController {
  static getHome(req, res) {
    res.json({ message: 'Welcome to Upang System API' });
  }
}

module.exports = HomeController;

