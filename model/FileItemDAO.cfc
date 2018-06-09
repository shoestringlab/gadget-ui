<cfcomponent output="false" singleton>
	<cfproperty name="dsn" inject="coldbox:datasource:mydsn">
	<cfproperty name="mongoDb" inject="coldbox:setting:mongoDb"/>
	<cfproperty name="mongoDbName" inject="coldbox:setting:mongoDbName"/>
	<cfproperty name="mongoClient" inject="coldbox:setting:mongoClient"/>
	<cfproperty name="viewFilePath" inject="coldbox:setting:viewFilePath"/>

	<cffunction name="init" returntype="model.FileItemDAO">

		<cfreturn this />
	</cffunction>

	<cffunction name="create" access="public" output="false" returntype="string">
		<cfargument name="_id" type="string" required="true" />
		<cfargument name="filename" type="string" required="true" />
		<cfargument name="filesize" type="numeric" required="true" />
		<cfargument name="tags" type="string" required="true" />
		<cfargument name="md5" type="string" required="true" />
		<cfargument name="mimetype" type="string" required="true" />
		<cfargument name="personId" type="numeric" required="true" />
		<cfargument name="tile" type="string" required="true" />
		<cfargument name="created" type="date" required="false" default="#now()#">
		<cfargument name="disabled" type="boolean" required="false" default="0" />
		<!--- 	{
					  "_id" : <ObjectId>,
					  "length" : <num>,
					  "chunkSize" : <num>,
					  "uploadDate" : <timestamp>,
					  "md5" : <hash>,
					  "filename" : <string>,
					  "contentType" : <string>,
					  "aliases" : <string array>,
					  "metadata" : <dataObject>,
					} --->
		<cfscript>
			local.aliaspath = '/index.cfm/FileLocker/viewFile?fileid=';
			local.args = {};
			local.args['_id'] = arguments._id;
			local.args['length'] = javacast( "long", arguments.filesize );
			local.args['chunkSize'] = javacast( "long", 1024 * 1024 );
			local.args['uploadDate'] = arguments.created;
			local.args['filename'] = arguments.filename;
			local.args['md5'] = arguments.md5;
			local.args['contentType'] = arguments.mimetype;
			local.args['aliases'] = "";

			local.args.metadata = {};
			local.args.metadata['tags'] = arguments.tags;
			local.args.metadata['personId'] = arguments.personId;
			local.args.metadata['created'] = arguments.created;
			local.args.metadata['tile'] = arguments.tile;
			local.args.metadata['disabled'] = 0;
			mongoDb['fs.files'].insert( local.args );

			local.result = local.args['_id'].toString();
			return local.result;
		</cfscript>

	</cffunction>

	<!--- 	{
			  "_id" : <ObjectId>,
			  "files_id" : <ObjectId>,
			  "n" : <num>,
			  "data" : <binary>
			} --->

	<cffunction name="createChunk" access="public" returntype="void">
		<cfargument name="files_id" type="any" required="true" />
		<cfargument name="n" type="numeric" required="true" />
		<cfargument name="data" type="any" required="true" />

		<cfscript>
/*				local.chunk = {};
			local.chunk[ '_id' ] = arguments._id;
			local.chunk[ 'n' ] = arguments.n;
			local.chunk[ 'files_id' ] = arguments.files_id;
			local.chunk[ 'data' ] = arguments.data;	*/
			//mongoDb['fs.chunks'].insert( local.chunk );
			local.db = variables.mongoClient.getDB( variables.mongoDbName );
			local.gfs = createobject("java", "com.mongodb.gridfs.GridFS").init( javacast( "com.mongodb.DB", local.db ) );
			local.chunk = createObject( "java", "com.mongodb.BasicDBObject").init("files_id", arguments.files_id)
               	.append("n", arguments.n)
               	.append("data", arguments.data);
			local.db.getCollection( "fs.chunks" ).save( chunk );

		</cfscript>
	</cffunction>

	<cffunction name="read" access="public" output="false" returntype="any">
		<cfargument name="personId" type="numeric" required="true" />
		<cfargument name="fileId" type="string" required="true" />

		<cfscript>
			local.db = variables.mongoClient.getDB( variables.mongoDbName );
			local.gfs = createobject("java", "com.mongodb.gridfs.GridFS").init( javacast( "com.mongodb.DB", local.db ) );
			local.q = createObject( "java", "com.mongodb.BasicDBObject").init();
			local.q.put( "metadata.personId", arguments.personId );
			local.q.put( "_id", createobject("java", "org.bson.types.ObjectId").init( arguments.fileId )  );
			local.results = local.gfs.find( local.q );
			return local.results;
		</cfscript>
	</cffunction>

	<cffunction name="readByIdList" access="public" output="false" returntype="any">
		<cfargument name="personId" type="numeric" required="true" />
		<cfargument name="idList" type="string" required="true" />
		<cfargument name="tiles" type="string" required="false" default="false" />
		<cfscript>
			local.idArray = [];
			local.i = 1;
			local.idList = listToArray( arguments.idList );
			for( local.i = 1; local.i lte arraylen( local.idList ); local.i++ ){
				local.idArray[ local.i ] = createobject("java", "org.bson.types.ObjectId").init( local.idList[ local.i ] );
			}

			local.files = mongoDb['fs.files'].find( { "_id" : { "$in": local.idArray }, "metadata.personId" : arguments.personId } );

			local.fileLocker = [];
			while( local.files.hasNext() ){
			local.rec = local.files.next();
			local.file = {
					"fileid" = local.rec._id.toString(),
					"filename" = local.rec.filename,
					"filesize" = local.rec.length,
					"tags" = local.rec.metadata.tags,
					"mimetype" = local.rec.contenttype,
					"created" = local.rec.metadata.created,
					"disabled" = local.rec.metadata.disabled
				};
			if( arguments.tiles ){
				local.file[ "tile" ] = local.rec.metadata.tile;
			}
			arrayappend(local.fileLocker, local.file );
			}
			return local.fileLocker;

		</cfscript>
	</cffunction>

 	<cffunction name="update" access="public" output="false" returntype="boolean">
		<cfargument name="fileId" type="string" required="true" />
		<cfargument name="filename" type="string" required="true" />
		<cfargument name="tags" type="string" required="true" />
		<cfargument name="personId" type="numeric" required="true" />
		<cfargument name="tile" type="string" required="false"/>

		<cfscript>
			local.db = variables.mongoClient.getDB( variables.mongoDbName );
			local.gfs = createobject("java", "com.mongodb.gridfs.GridFS").init( javacast( "com.mongodb.DB", local.db ) );
			local.objectId =  createobject("java", "org.bson.types.ObjectId").init( arguments.fileId );
			if( isNull( arguments.tile ) ){
				mongoDb['fs.files'].update( { "_id" : local.objectid, "metadata.personId" : arguments.personId },
						{"$set" : { "metadata.tags": arguments.tags,
									"filename" : arguments.filename }});
			}else{
				mongoDb['fs.files'].update( { "_id" : local.objectid, "metadata.personId" : arguments.personId },
						{"$set" : { "metadata.tags": arguments.tags,
									"filename" : arguments.filename,
									"metadata.tile" : arguments.tile }});
			}
			return true;
		</cfscript>
	</cffunction>

	<cffunction name="delete" access="public" output="false" returntype="any">
		<cfargument name="fileId" type="string" required="true" />
		<cfargument name="personId" type="numeric" required="true" />

		<cfset local.objectId =  createobject("java", "org.bson.types.ObjectId").init( arguments.fileId ) />
		<!--- <cftry> --->
			<cfset mongoDb['fs.files'].update({ "_id" : local.objectid, "metadata.personId" : arguments.personId }, {"$set" : {"metadata.disabled": 1}}) />
		<!--- <cfcatch type="any">
			<cfreturn false />
		</cfcatch>
		</cftry>		 --->
		<cfreturn true/>
	</cffunction>

	<cffunction name="restore" access="public" output="false" returntype="boolean">
		<cfargument name="fileId" type="string" required="true" />
		<cfargument name="personId" type="numeric" required="true" />
		<cfscript>
			local.db = variables.mongoClient.getDB( variables.mongoDbName );
			local.gfs = createobject("java", "com.mongodb.gridfs.GridFS").init( javacast( "com.mongodb.DB", local.db ) );
			local.objectId =  createobject("java", "org.bson.types.ObjectId").init( arguments.fileId );
			mongoDb['fs.files'].update({ "_id" : local.objectid, "metadata.personId" : arguments.personId }, {"$set" : {"metadata.disabled": 0}});
			return true;
		</cfscript>
	</cffunction>

	<cffunction name="remove" access="public" output="false" returntype="any">
		<cfargument name="fileId" type="string" required="true" />
		<cfargument name="personId" type="numeric" required="true" />

		<cfscript>
			local.objectId = createobject("java", "org.bson.types.ObjectId").init( arguments.fileId );
			local.file = mongoDb['fs.chunks'].remove( { "files_id" : local.objectId } );
			local.file = mongoDb['fs.files'].remove( { "_id" : local.objectId , "metadata.personId" : arguments.personId } );
		</cfscript>
		<cfreturn true/>
	</cffunction>

	<cffunction name="recycle" access="public" output="false" returntype="boolean">
		<cfargument name="personId" type="numeric" required="true" />

		<cfscript>
			local.files = mongoDb['fs.files'].find( { "metadata.disabled" : 1, "metadata.personId" : arguments.personId } )
			local.fileLocker = arraynew(1);
			while( local.files.hasNext() ){
				local.rec = local.files.next();
				local.file = {
						"fileid" : local.rec._id
					};
				arrayappend(local.fileLocker, local.file );
				for( local.i = 1; local.i lte arraylen( local.fileLocker); local.i++ ){
					local.file = mongoDb['fs.chunks'].remove( { "files_id" : local.fileLocker[i].fileid } );
					local.file = mongoDb['fs.files'].remove( { "metadata.disabled" : 1, "metadata.personId" : arguments.personId } ) ;
				}
			}

			return true;
		</cfscript>
	</cffunction>

	<cffunction name="readMany" access="public" output="false" returntype="array">
		<cfargument name="personId" type="numeric" required="true" />
		<cfargument name="offset" type="numeric" default="0" required="false" />
		<cfargument name="limit" type="numeric" default="20" required="false" />
		<cfargument name="sortBy" type="string" default="filename" required="false" />
		<cfargument name="sortDirection" type="numeric" default="1" required="false" />
		<cfargument name="disabled" type="numeric" required="false" default="0" />

		<cfset local.fileLocker = arraynew(1) />
		<!--- <cfset local.sort = { "#arguments.sortBy#" : arguments.sortDirection } />
		<cfset local.files = mongoDb['files'].find( { "personId" : arguments.personId, "disabled" : arguments.disabled } ).sort( { "#arguments.sortBy#" : int( arguments.sortDirection ) } ) /> --->
		<cfscript>
			/*	local.sort = { "#arguments.sortBy#" : arguments.sortDirection };
			local.files = mongoDb['fs.files'].find( { "metadata.personId" : arguments.personId, "metadata.disabled" : arguments.disabled } ).sort( { "#arguments.sortBy#" : int( arguments.sortDirection ) } );

			while( local.files.hasNext() ){
			local.rec = local.files.next();
			local.file = {
					"fileid" = local.rec._id.toString(),
					"filename" = local.rec.filename,
					"filesize" = local.rec.length,
					"tags" = local.rec.metadata.tags,
					"mimetype" = local.rec.contenttype,
					"created" = local.rec.metadata.created,
					"disabled" = local.rec.metadata.disabled,
					"tile" = local.rec.metadata.tile
				};
			arrayappend(local.fileLocker, local.file );
			}	*/

			local.db = variables.mongoClient.getDB( variables.mongoDbName );
			local.gfs = createobject("java", "com.mongodb.gridfs.GridFS").init( local.db );
			local.q = createObject( "java", "com.mongodb.BasicDBObject").init();
			local.q.put( "metadata.personId", arguments.personId );
			local.q.put( "metadata.disabled", arguments.disabled );
			local.results = local.gfs.find( local.q ); //.limit();
			for( i = 1; i lte arraylen( local.results ); i++ ){
				local.fileLocker[i] = {};
				local.fileLocker[i]['fileid'] = local.results[i].getId().toString();
				local.fileLocker[i]['filename'] = local.results[i].getFileName();
				local.fileLocker[i]['filesize'] = local.results[i].getLength();
				local.fileLocker[i]['mimetype'] = local.results[i].getContentType();
				local.fileLocker[i]['tags'] = local.results[i].getMetadata().get("tags");
				local.fileLocker[i]['created'] = local.results[i].getMetadata().get( "created" );
				local.fileLocker[i]['disabled'] = local.results[i].getMetadata().get( "disabled" );
			}
		</cfscript>

		<cfreturn local.fileLocker/>
	</cffunction>

	<cffunction name="getStats" access="public" returntype="struct">
		<cfargument name="personId" type="numeric" required="true" />

		<cfscript>
			local.stats = { "recycleCount" : readDisabledCount( personId = arguments.personId ),
				"totals" : getLockerSize( personId = arguments.personId )
			};
			return local.stats;
		</cfscript>

	</cffunction>

	<cffunction name="readDisabledCount" access="public" returntype="numeric">
		<cfargument name="personId" type="numeric" required="true" />
		<cfscript>
			local.result =  mongoDb['fs.files'].aggregate(
					{ "$match": { "metadata.personId" : arguments.personId, "metadata.disabled": 1 }},
					{ "$group": { "_id": "null", "count": { "$sum": 1 } } }
				) ;
			local.result = local.result.results();
				if( arrayIsEmpty( local.result ) ){
				return 0;
			}else{
				return local.result[1]['count'];
			}
		</cfscript>
	</cffunction>


	<cffunction name="getLockerSize" access="public" returntype="struct">
		<cfargument name="personId" type="numeric" required="true" />

		<cfscript>
			local.stats = { "total" : 0, "deletedTotal" : 0 };
			local.result = mongoDb['fs.files'].aggregate(
					{ "$match": { "metadata.personId" : arguments.personId }},
				 	{ "$group": {
				 		"_id": "$metadata.disabled",
				        totalSize: { "$sum": "$length" }
				 	} }
				);
			local.result = local.result.results();
			for( local.i = 1; local.i lte arraylen( local.result ); local.i++ ){
				if( NOT local.result[ local.i ]["_id"] )
					local.stats[ "total" ] = local.result[ local.i ].totalSize;
				else
					local.stats[ "deletedTotal" ] = local.result[ local.i ].totalSize;
			}
			return local.stats;
		</cfscript>

	</cffunction>

</cfcomponent>