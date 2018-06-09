/*Copyright 2016 Robert Munn
  licensed via MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

component output="false"{
	public function init( filePath, FilePartDAO ){
		variables.filePath = arguments.filePath;
		variables.viewFilePath = "/test/upload/";
		variables.FilePartDAO = arguments.FilePartDAO;
		variables.separator = iif(expandpath("./") contains "/",de("/"),de("\"));
		return this;
	}
	public function upload( required string id,
		required any temp_file,
		required numeric part,
		required numeric parts,
		required string filename,
		required string filesize ){

		local.result = {};
		/*if( arguments.part eq 1 ){
			local.result.fileId = createUUID();
		}else{
			local.result.fileId = arguments.id;
		}
		var fileToWrite = variables.filePath & "temp" & variables.separator & local.result.fileId & "_" & arguments.part;
		fileWrite( fileToWrite, arguments.temp_file );
*/		local.addedPart = variables.FilePartDAO.create( fileid = arguments.id, filepath = arguments.temp_file, filepart = arguments.part, parts = arguments.parts );
		// set permissions so we can concatenate the files
	/*	if( server.OS.name contains 'Windows' ){
			//local.str = "chmod 664 " & arguments.temp_file;
			local.runtime = createObject("java", "java.lang.Runtime");
			local.process_runtime = local.runtime.getRuntime();
			local.process_exec = local.process_runtime.exec( javacast( "string[]", ["cmd.exe", "/c", local.str]) );
			local.exitCode = local.process_exec.waitFor();
		}else{
			local.str = "chmod -R 775 " & variables.filePath;
			local.runtime = createObject("java", "java.lang.Runtime");
			local.process_runtime = local.runtime.getRuntime();
			local.process_exec = local.process_runtime.exec( javacast( "string[]", ["bash", "-c", local.str]) );
			local.exitCode = local.process_exec.waitFor();
		}*/

		if( arguments.part eq arguments.parts ){
			if( server.OS.name contains 'Windows' ){
			/*	local.runtime = createObject("java", "java.lang.Runtime");
				local.process_runtime = local.runtime.getRuntime();
				local.process_exec = local.process_runtime.exec( javacast( "string[]", ["cmd.exe", "/c", local.str]) );
				local.exitCode = local.process_exec.waitFor();
*/
				local.str = " copy /b ";
				local.files = variables.FileParDAO.readByFileId( fileid = arguments.id );
				local.str = local.str & local.files.filepath[ 1 ];
				for( local.ix = 2; local.ix lte local.files.recordcount; local.ix++ ){
					local.str = local.str & "+" & local.files.filepath[ local.ix ];
				}
				local.str = local.str & " ""#variables.filePath##arguments.filename#""";
				writelog( file="upload", text="Concatenating: " & local.str );

				//log.info( "Concatenating: " & local.str );
				local.runtime = createObject("java", "java.lang.Runtime");
				local.process_runtime = local.runtime.getRuntime();
				local.process_exec = local.process_runtime.exec( javacast( "string[]", ["cmd.exe", "/c", local.str]) );
				local.exitCode = local.process_exec.waitFor();
			}else{
				//local.str = "chmod -R 775 " & variables.filePath;

				local.str = " cat ";
				local.files = variables.FilePartDAO.readByFileId( fileid = arguments.id );
				for( local.ix = 1; local.ix lte local.files.recordcount; local.ix++ ){
					writelog( file="upload", text="Concat file:" & arguments.filename & ", part: " & local.ix );
					//log.debug( "Concat file:" & arguments.filename & ", part: " & local.ix  );
					local.str = local.str & " " & local.files.filepath[ local.ix ];

				}
				local.str = local.str & " > ""#variables.filePath##arguments.filename#""";
				writelog( file="upload", text="Concatenating: " & local.str );

				//log.info( "Concatenating: " & local.str );
				local.runtime = createObject("java", "java.lang.Runtime");
				local.process_runtime = local.runtime.getRuntime();
				local.process_exec = local.process_runtime.exec( javacast( "string[]", ["bash", "-c", local.str]) );
				local.exitCode = local.process_exec.waitFor();
			}
			//clean up
			for( local.ix = 1; local.ix lte local.files.recordcount; local.ix++ ){
				if( fileExists( local.files.filepath[ local.ix ] ) ){
					fileDelete( local.files.filepath[ local.ix ] );
				}
			}
			//clean up
			variables.FilePartDAO.delete( fileid = arguments.id );

		}

			local.result.path = variables.viewFilePath;
			//local.result.tags = arguments.tags;
			local.result.filename = arguments.filename;
			local.result.disabled = 0;
			local.result.filesize = arguments.filesize;
			local.result.mimetype = "application/octet-stream";
			local.result.created = now();

			return local.result;
	}
	}
