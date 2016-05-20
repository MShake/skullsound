/**
 * Mp3Controller
 *
 * @description :: Server-side logic for managing mp3s
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs');

module.exports = {

  getAlbums: function(req, res){
    Mp3.native(function(err, coll){
      if(err){
        res.serverError();
      }
      coll.distinct("album", function(err, results){
        if(err){
          res.serverError();
        }
        res.ok(results);
      });
    });
  },

  removeSongFile: function(req, res){
    var id = req.params.id;
    Mp3.findOne({id: id}).exec(function(err, song){
      if(err){
        res.serverError(err);
      }

      if(song !== undefined) {
        fs.unlink('assets/' + song.path, function (err) {
          if (err) {
            res.notFound('Fichier non trouvé');
          }
          res.ok();
        });
      }else {
        res.notFound('Musique non trouvée');
      }
    });
  }

};
