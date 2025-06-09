<cfscript>
	args.id = gethttprequestdata().headers['x-id'];
	args.filename = gethttprequestdata().headers['x-filename'];
	args.filesize = gethttprequestdata().headers['x-filesize'];
	args.part = gethttprequestdata().headers['x-filepart'];
	args.parts = gethttprequestdata().headers['x-parts'];
	args.temp_file = gethttprequestdata().headers['x-client-body-file'];
	if( structkeyexists( gethttprequestdata().headers, 'x-tags') ){
		args.tags = gethttprequestdata().headers['x-tags'];
	}else{
		args.tags = "";
	}
	args.mimetype = gethttprequestdata().headers['x-mimetype'];
	args.hasTile = gethttprequestdata().headers['x-hastile'];
	args.personId = request.user.personId;
	rc.file = FileLockerService.upload( argumentcollection = local );
	rc.showResponse = false;
</cfscript>
