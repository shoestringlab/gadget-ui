<!---Copyright 2016 Robert Munn
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
--->
<cfcomponent output="false">
	<cffunction name="init" returntype="model.FilePartDAO">
		<cfreturn this />
	</cffunction>

	<cffunction name="create" access="public" returntype="boolean">
		<cfargument name="fileid" type="string" required="true" />
		<cfargument name="filepath" type="string" required="true" />
		<cfargument name="filepart" type="numeric" required="true" />
		<cfargument name="parts" type="numeric" required="true" />

		<cfquery name="local.create">
			INSERT INTO filepart
			( fileId, filepath, filepart, parts )

			VALUES(
				<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.fileid#"/>,
				<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.filepath#"/>,
				<cfqueryparam cfsqltype="cf_sql_numeric" value="#arguments.filepart#"/>,
				<cfqueryparam cfsqltype="cf_sql_numeric" value="#arguments.parts#"/>
			)
		</cfquery>

		<cfreturn true />
	</cffunction>

	<cffunction name="readByFileId" access="public" returntype="query">
		<cfargument name="fileid" type="string" required="true" />

		<cfquery name="local.read">
			SELECT	fileId, filepath, filepart, parts
			FROM	filepart
			WHERE	fileId = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.fileid#" />
			ORDER BY filepart
		</cfquery>

		<cfreturn local.read />

	</cffunction>

	<cffunction name="update" access="public" returntype="boolean">
		<cfargument name="fileid" type="string" required="true" />
		<cfargument name="filepath" type="string" required="true" />
		<cfargument name="filepart" type="numeric" required="true" />
		<cfargument name="parts" type="numeric" required="true" />

		<cftry>
			<cfquery name="local.update">
				UPDATE	filepart
				set 	filepath = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.filepath#"/>,
						parts = <cfqueryparam cfsqltype="cf_sql_numeric" value="#arguments.parts#"/>
				WHERE	fileId = <cfqueryparam cfsqltype="cf_sql_integer" value="#arguments.fileId#" />
				AND		filepart = <cfqueryparam cfsqltype="cf_sql_integer" value="#arguments.filepart#" />
			</cfquery>
		<cfcatch type="database">
			<cfreturn false />
		</cfcatch>

		</cftry>
		<cfreturn true />
	</cffunction>

	<cffunction name="delete" access="public" returntype="boolean">
		<cfargument name="fileid" type="string" required="true" />

		<cftry>
		<cfquery name="local.delete">
			DELETE 	FROM filepart
			WHERE	fileId = <cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.fileid#" />
		</cfquery>

		<cfcatch type="database">
			<cfreturn false />
		</cfcatch>

		</cftry>
		<cfreturn true />
	</cffunction>

</cfcomponent>
