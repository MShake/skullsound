/**
 * Mp3Controller
 *
 * @description :: Server-side logic for managing mp3s
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index : function(req, res) { return res.view('homepage'); },
  display : function(req, res) { return res.json('display'); }
};
