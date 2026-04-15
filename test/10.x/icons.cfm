<cfdirectory action="list" directory="#expandpath( "../bower_components/open-iconic/png" )#" name="icons">

<cfset ics = [] />

<cfloop query="icons">
	<cfset myicon = {} />
	<cfif right( icons.name, 7 ) eq "-8x.png" >
		<cfset myicon.name = replace( icons.name, "-8x", "" ) />
		<cfset arrayappend( ics, myicon ) />
	</cfif>
</cfloop>

<cfoutput>#SerializeJSON( ics )#</cfoutput>