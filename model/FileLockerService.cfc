<cfcomponent output="false" singleton>
	<cfproperty name="filePath" inject="coldbox:setting:filePath"/>
	<cfproperty name="FileItemDAO" inject="model"/>
	<cfproperty name="FilePartDAO" inject="model"/>
	<cfproperty name="Utils" inject="model" />
	<cfproperty name="log" inject="logbox:logger:{this}" />
	<cfproperty name="cache" inject="cachebox:default"/>

	<cffunction name="init" returntype="model.FileLockerService">
		<cfset variables.separator = iif(expandpath("./") contains "/",de("/"),de("\"))/>
		<cfreturn this />
	</cffunction>

	<cffunction name="upload" access="public" returntype="any">
		<cfargument name="id" type="string" required="true" />
		<cfargument name="temp_file" type="string"  required="true" />
		<cfargument name="part" type="numeric" required="true" />
		<cfargument name="parts" type="numeric" required="true" />
		<cfargument name="filename" type="string" required="true" />
		<cfargument name="filesize" type="string" required="true" />

		<cfscript>
			local.result = {};
			if( arguments.part eq 1 ){
				local.result.fileId = createUUID();
			}else{
				local.result.fileId = arguments.id;
			}

			local.addedPart = variables.FilePartDAO.create( fileid = local.result.fileId, filepath = arguments.temp_file, filepart = arguments.part, parts = arguments.parts );

			if( arguments.part eq arguments.parts ){
				if( server.OS.name contains 'Windows' ){
					local.str = " copy /b ";
					local.files = variables.FilePartDAO.readByFileId( fileid = arguments.id );
					local.str = local.str & local.files.filepath[ 1 ];
					for( local.ix = 2; local.ix lte local.files.recordcount; local.ix++ ){
						local.str = local.str & "+" & local.files.filepath[ local.ix ];
					}
					local.str = local.str & " ""#variables.filepath##arguments.filename#""";

					//log.info( "Concatenating: " & local.str );
					local.runtime = createObject("java", "java.lang.Runtime");
					local.process_runtime = local.runtime.getRuntime();
					local.process_exec = local.process_runtime.exec( javacast( "string[]", ["cmd.exe", "/c", local.str]) );
					local.exitCode = local.process_exec.waitFor();
				}else{
					local.str = " cat ";
					local.files = variables.FilePartDAO.readByFileId( fileid = arguments.id );
					for( local.ix = 1; local.ix lte local.files.recordcount; local.ix++ ){
						//log.debug( "Concat file:" & arguments.filename & ", part: " & local.ix  );
						local.str = local.str & " " & local.files.filepath[ local.ix ];

					}
					local.str = local.str & " > ""#variables.filepath##arguments.filename#""";

					//log.info( "Concatenating: " & local.str );
					local.runtime = createObject("java", "java.lang.Runtime");
					local.process_runtime = local.runtime.getRuntime();
					local.process_exec = local.process_runtime.exec( javacast( "string[]", ["bash", "-c", local.str]) );
					local.exitCode = local.process_exec.waitFor();
				}
					//clean up
					if( fileExists( local.args['files'][local.ix] ) ){
						//log.info( "Deleting temp file:" & local.args['files'][local.ix] );
						fileDelete( local.args['files'][local.ix] );
					}
				}
				//clean up
				variables.FilePartDAO.delete( fileid = arguments.id );

				local.result.path = variables.viewFilePath;
				//local.result.tags = arguments.tags;
				local.result.filename = arguments.filename;
				local.result.disabled = 0;
				local.result.filesize = arguments.filesize;
				local.result.mimetype = arguments.mimetype;
				local.result.created = now();
			}
			return local.result;
		</cfscript>
	</cffunction>


</cfcomponent>
