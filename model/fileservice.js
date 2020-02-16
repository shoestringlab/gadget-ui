const FilePartDAO = require( './filepartdao' );
const concat = require('concat-files');
const uploadPath = './test/upload/';
const fs = require('fs');

const dao = FilePartDAO();

function deleteFiles(files, callback){
  let i = files.length;
  files.forEach(function(filepath){
    fs.unlink(filepath, function(err) {
      i--;
      if (err) {
        callback(err);
        return;
      } else if (i <= 0) {
        callback(null);
      }
    });
  });
}

module.exports = {
  createFilePart: function( fileId, filepath, filepart, parts ){
    return( dao.create( fileId, filepath, filepart, parts ) );
  },
  readFilePart: function( fileId ){
    return( dao.read( fileId ) );
  },
  deleteFileParts: function( fileId ){
    return( dao.delete( fileId ) );
  },
  upload: function( id, tempFile, part, parts, filename, filesize ){
    let addedPart = dao.create( id, tempFile, part, parts );

    if( part === parts ){
      dao.read( id )
      .then( function( fileparts ){

        let files = fileparts.map( filepart => filepart.filepath );

        concat(files, uploadPath + filename, function(err) {
          if (err) throw err

          console.log('file uploaded');

          // clean up
          dao.delete( id )
          .then( function( success ){
            deleteFiles( files, function(err){
              if (err) {
                console.log(err);
              } else {
                console.log('all temp files removed');
              }
            });
          })
          .catch( function( error ){
            console.log( error );
          });
        });
      })
      .catch( function( error ){
        console.log( error );
      });

    }

    let result = {
      fileId: id,
      path: "/test/upload/",
      filename: filename,
      disabled: 0,
      filesize: filesize,
      tags:'',
      mimetype: 'application/octect-stream',
      created: new Date()
    };

    return result;
  }
};
