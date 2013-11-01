#!/usr/bin/env python
import urllib2
import json
import cgi
import cgitb; 

cgitb.enable()

arguments = cgi.FieldStorage()
limit = 8
if "limit" in arguments:
	limit = arguments["limit"].value

url = "http://whisper.sh/latest/whispers?limit="+str(limit)
response = urllib2.urlopen(url).read()

print "Content-type: text/html\n\n"
print json.dumps(response)
