<!---<cfscript>
	args = {};
	args.id = gethttprequestdata().headers['x-id'];
	args.filename = gethttprequestdata().headers['x-filename'];
	args.filesize = gethttprequestdata().headers['x-filesize'];
	args.part = gethttprequestdata().headers['x-filepart'];
	args.parts = gethttprequestdata().headers['x-parts'];
	// x-client-body-file created by nginx
	//args.temp_file = gethttprequestdata().headers['x-client-body-file'];
	//lucee
	args.temp_file = getPageContext().getRequest().getOriginalRequest().getInputStream();
	//acf
	//args.temp_file = getHttpRequestData().content;
	filePath = "/Users/rmunn/git/gadgetui/test/upload/";
	FilePartDAO = new model.FilePartDAO();
	FileService = new model.FileService( filePath = filePath, FilePartDAO = FilePartDAO );
	file = FileService.upload( argumentcollection = args );

	if( args.part eq args.parts ){
		writeoutput( SerializeJSON( file ) );
	}else{
		pc = getpagecontext();
		pc.setHeader("X-Id", file.fileId );
	}
</cfscript>
--->
<cfscript>
	filePath = "#expandpath("./")#upload\";
	separator = iif(expandpath("./") contains "/",de("/"),de("\"));
	filePath = expandpath("./") & "upload" & separator;
	chunkPath = filePath & "temp" & separator & createUUID();
	inputStream = getPageContext().getRequest().getOriginalRequest().getInputStream();
	ioutil = createObject( "java", "org.apache.commons.io.IOUtils" );
	outputStream = createObject( "java", "java.io.FileOutputStream" ).init( chunkPath );
	ioutil.copy( inputStream, outputStream );

	contentLength = gethttprequestdata().headers['Content-Length'];
	args.id = gethttprequestdata().headers['x-id'];
	args.filename = gethttprequestdata().headers['x-filename'];
	args.filesize = gethttprequestdata().headers['x-filesize'];
	args.part = gethttprequestdata().headers['x-filepart'];
	args.parts = gethttprequestdata().headers['x-parts'];
	//args.temp_file = gethttprequestdata().headers['x-client-body-file'];
	//fileContents = getHttpRequestData().content;
	//writelog( file="upload", text="file - #args.filename#, part: #args.part#, chunk size: #len(fileContents)#");

	if( args.part eq 1 ){
		fileId = createUUID();
	}else{
		fileId = args.id;
	}
	args.temp_file = chunkPath;
	//args.temp_file = filePath & "temp" & separator & fileId & "_" & args.part;
	//fileMove( chunkPath, args.temp_file );

	//fileWrite( args.temp_file, fileContents );
	args.id = fileId;
	FilePartDAO = new model.FilePartDAO();
	FileService = new model.FileService( filePath = filePath, FilePartDAO = FilePartDAO );
	file = FileService.upload( argumentcollection = args );

	if( args.part eq args.parts ){
		writeoutput( SerializeJSON( file ) );
	}else{
		pc = getpagecontext();
		pc.setHeader("X-Id", fileId );
	}

</cfscript>
