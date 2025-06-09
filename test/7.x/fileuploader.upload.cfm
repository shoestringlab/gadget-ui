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

	if( args.part eq 1 ){
		fileId = createUUID();
	}else{
		fileId = args.id;
	}
	args.temp_file = chunkPath;

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
