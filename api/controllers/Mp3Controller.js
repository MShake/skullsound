/**
 * Mp3Controller
 *
 * @description :: Server-side logic for managing mp3s
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs');
var ID3Writer = require('browser-id3-writer');

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
  },

  updateMetadata: function(req, res){
    var id = req.params.id;
    var data = req.body;

    Mp3.findOne({id: id}).exec(function(err, song){
      if(err){
        res.serverError(err);
      }

      var songBuffer = fs.readFileSync('assets/'+song.path);
      var writer = new ID3Writer(songBuffer);
      writer.setFrame('TIT2', data.title)
        .setFrame('TPE1', [data.artist])
        .setFrame('TPE2', data.artist)
        .setFrame('TALB', data.album);
      writer.addTag();

      var taggedSongBuffer = new Buffer(writer.arrayBuffer);
      fs.writeFileSync('assets/'+song.path, taggedSongBuffer);

      res.ok();

    });
  }

};
