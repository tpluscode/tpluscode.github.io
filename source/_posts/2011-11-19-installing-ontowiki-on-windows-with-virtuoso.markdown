---
layout: post
status: publish
published: true
title: Installing OntoWiki on Windows with Virtuoso
date: !binary |-
  MjAxMS0xMS0xOSAxNjo1MjozMyAtMDUwMA==
categories:
- Semantic Web
- virtuoso
- ontowiki
redirect_from:
- /2011/11/installing-ontowiki-on-windows-with-virtuoso/
comments: true
---

{% img right http://semanticweb.org/images/Semantic-Web-Logo-by-W3C.png 129 155 'Semantic Web' 'Semantic Web logo' %}

Recently I've been experimenting with [Semantic Web](http://semanticweb.org) techonogies. Currently I'm trying to choose
tools for editing the ontology and more importantly instances. There are a number of tools, both commercial and free
including my favourites: [Protégé](http://protege.stanford.edu), [NeON toolkit](http://neon-toolkit.org) or
[Top Braid Composer](http://www.topquadrant.com/composer/). Each of those have some problem. NeON is nice but desktop
only, Top Braid is not free and Prot&eacute;g&eacute; is very complex. Not to mention it comes in versions 3.x and 4.x
with [different set of functions][protege-comparison] which only makes the confusion grow...

<!--more-->

In my search I have found [OntoWiki][ontowiki]. It is web-based, seems user-friendly and
it's recommended backend is Virtuoso, which I chose for it is Open Source and presumably mature and feature-rich. There
is a walkthrough on [setting up OntoWiki with Virtuoso][ontowiki+virtuoso], which I followed. Unfortunately things don't
always go right. Below are the problems I encountered and solutions which helped.

## Problem 1: Setting up ODBC

My server is running Windows 2008 64bit. for now I have installed Virtuoso trial using the msi package available for
download from OpenLink's website. During installation it automatically sets up a System DSN:

{% img center http://t-code.pl/wp-content/uploads/2011/11/virtuoso-dsn.png 300 209 Default Virtuoso DSN %} There is a
problem however. When I ran the test php script instead of graphs listed I got an error saying:

```
[Microsoft][ODBC Driver Manager] The specified DSN contains an architecture mismatch between the Driver and Application
```

### Solution

To resolve this a DSN must be created using 32-bit version of obdcad32.exe, which sits in c:\windows\sysWOW64\. There is
a problem however: installing 64-bit Virtuoso package does not install 32-bti driver. To get those you must install the
Connectivity Suite available as a free download from [OpenLink's website](http://download.openlinksw.com/virtwiz/).
Then run odbcad32.exe to create a System DSN choosing OpenLink virtuoso driver. Now the php test script should work.
Or should it?

## Problem 2: Unexpected T_PAAMAYIM_NEKUDOTAYIM

I'm not a PHP developer and so seeing the above for the first in my life was pretty confusing. All it means is "double
colon". The problem comes from a file virtuoso.php,where it says:

``` php
if ($result == $queryCache::ERFURT_CACHE_NO_HIT) {
}
```

### Solution

Numerous people on the web suggest that instead of the double colon the arrow (->) should be used to access a member on
this variable. However this was not the case. ERFURT_CACHE_NO_HIT is a constant field and only changing the above to a
static call on the class resolved this issue:

``` php
if ($result ==
     Erfurt_Cache_Frontend_QueryCache::ERFURT_CACHE_NO_HIT) {
}
```

I have filed an [issue](https://github.com/AKSW/Erfurt/issues/5) in Erfurt framework git repository.

## Problem 3: Zend_Config_Ini::urlBase

Ok so finally I managed to run OntoWiki and my eyes saw the news/logon page. My url for now is uninteresting 
http://localhost:9454. Manual says to login as Admin with no password. Doing it points my browser to 
http://localhost:9454index.php/application/login. Diagnosis: wrong action attribute on form.

### Solution

I haven't actually resolved this. A workaround is described here: [http://code.google.com/p/ontowiki/issues/detail?id=1004](http://code.google.com/p/ontowiki/issues/detail?id=1004)

## Problem 4: URL routing

Even though I corrected how OntoWiki constructs URLs, when I tried to log in IIS returns 404 response for URL 
http://localhost:9454/application/login (and probably would for any URL). The reason is that IIS does not understand 
.htaccess files (obviously!)

### Solution

Google pointed me to this post: [http://blog.wilgucki.pl/2010/12/zend-framework-na-iis.html](http://blog.wilgucki.pl/2010/12/zend-framework-na-iis.html).

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
<system.webServer>
  <handlers>
     <add name="deny ini" verb="*" path="*.ini" type="System.Web.HttpForbiddenHandler" />
  </handlers>
  <rewrite>
     <rules>
       <rule name="Don&#039;t rewrite physical files" stopProcessing="true">
         <match url="((extensions|libraries).*|\.(js|ico|gif|jpg|png|css|php|swf|json))$" />
         <conditions logicalGrouping="MatchAny">
           <add input="{REQUEST_FILENAME}" matchType="IsFile" pattern="" ignoreCase="false" />
           <add input="{REQUEST_FILENAME}" matchType="IsDirectory" pattern="" ignoreCase="false" />
         </conditions>
         <action type="None" />
       </rule>
       <rule name="Redirect favicon" stopProcessing="true">
         <match url="^favicon\.(.*)$" />
         <action type="Redirect" url="application/favicon.{R:1}" />
       </rule>
       <rule name="Rewrite" stopProcessing="true">
         <match url="^.*$" />
         <serverVariables>
           <set name="ONTOWIKI_APACHE_MOD_REWRITE_ENABLED" value="true" />
         </serverVariables>
         <action type="Rewrite" url="index.php" />
       </rule>
     </rules>
   </rewrite>
</system.webServer>
</configuration>
```

Basically you need to add the above web.config file to OntoWiki's root folder to add rules for ISS' URL rewrite module.
You can read more on [OntoWiki's GitHub wiki](https://github.com/AKSW/OntoWiki/wiki/Install-on-IIS)

## Problem 5: Unknown user identifier (Admin)

OntoWki's wiki says that a fresh install should have a predefined user Admin. For me logging in fails with an error.
Presumably this is due to invalid or incomplete model created by OntoWiki when it first ran. This model contains user
credentials and user permissions.

{% img center http://t-code.pl/wp-content/uploads/2011/11/ontowiki-unknown-user-login1.png 270 294 'ontowiki - unknown user login' %}

### Solution

The above problem remains a mystery, although I did manage to resolve it with help of [Sebastian Tramp](http://sebastian.tramp.name)
from the University of Lepzig.

What I did was first log in to OntoWiki using Virtuoso's admin credentials, which works as access for <em>SuperAdmin</em>.
Then I deleted Configuration KB as shown below.

{% img center uploads/2011/11/delete-knowledgebase.png 515 305 'delete knowledgebase' %}

This caused Virtuoso to complain it could not get access to `%OntoWikiRoot%/libraries\Erfurt\Erfurt\include\SysOntLocal.rdf`
due to configuration. However this was not the case.

What helped though was deleting those two files and then deleting Virtuoso Database to make sure I was starting from scratch.

As an effect, the next time I ran OntoWiki a proper model was created and I was then able to log in as Admin.

[ontowiki+virtuoso]: http://code.google.com/p/ontowiki/wiki/UsingOntoWikiWithVirtuoso
[ontowiki]: http://ontowiki.net/Projects/OntoWiki
[protege-comparison]: http://protegewiki.stanford.edu/wiki/Protege4Migration