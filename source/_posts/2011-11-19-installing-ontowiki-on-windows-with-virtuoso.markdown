---
layout: post
status: publish
published: true
title: Installing OntoWiki on Windows with Virtuoso
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 242
wordpress_url: http://t-code.pl/?p=242
date: !binary |-
  MjAxMS0xMS0xOSAxNjo1MjozMyAtMDUwMA==
date_gmt: !binary |-
  MjAxMS0xMS0xOSAxNTo1MjozMyAtMDUwMA==
categories:
- Uncategorized
tags:
- semantic
- virtuoso
- ontowiki
comments: []
---
<p><!--:en--><img class="alignright" title="Semantic Web" alt="Semantic Web logo" src="http://semanticweb.org/images/Semantic-Web-Logo-by-W3C.png" width="129" height="155" />Recently I've been experimenting with <a href="http://semanticweb.org">Semantic Web</a> techonogies. Currently I'm trying to choose tools for editing the ontology and more importantly instances. There are a number of tools, both commercial and free including my favourites:&nbsp;<a href="http://protege.stanford.edu">Prot&eacute;g&eacute;</a>, <a href="http://neon-toolkit.org">NeON Toolkit</a>&nbsp;or <a href="http://www.topquadrant.com/composer/">Top Braid Composer</a>. Each of those have some problem. NeON is nice but desktop only, Top Braid is not free and&nbsp;Prot&eacute;g&eacute; is very complex. Not to mention it comes in versions 3.x and 4.x with <a href="http://protegewiki.stanford.edu/wiki/Protege4Migration">different set of functions</a> which only makes the confusion grow...</p>
<p>In my search I have found <a href="http://ontowiki.net/Projects/OntoWiki">OntoWiki</a>. It is web-based, seems user-friendly and it's recommended backend is Virtuoso, which I chose for it is Open Source and presumably mature and feature-rich. There is a walkthrough on <a href="http://code.google.com/p/ontowiki/wiki/UsingOntoWikiWithVirtuoso">setting up OntoWiki with Virtuoso</a>, which I followed. Unfortunately things don't always go right. Below are the problems I encountered and solutions which helped.</p>
<h1>Problem 1: Setting up ODBC</h1><br />
My server is running Windows 2008 64bit. for now I have installed Virtuoso trial using the msi package available for download from OpenLink's website. During installation it automatically sets up a System DSN:</p>
<p><a href="http://t-code.pl/wp-content/uploads/2011/11/virtuoso-dsn.png"><img class="aligncenter size-medium wp-image-243" title="Default Virtuoso DSN" alt="" src="http://t-code.pl/wp-content/uploads/2011/11/virtuoso-dsn-300x209.png" width="300" height="209" /></a>There is a problem however. When I ran the test php script instead of graphs listed I got an error saying:</p>
<pre><code>[Microsoft][ODBC Driver Manager] The specified DSN contains an architecture mismatch between the Driver and Application</code></pre></p>
<h2>Solution</h2><br />
To resolve this a DSN must be created using 32-bit version of obdcad32.exe, which sits in c:\windows\sysWOW64\. There is a problem however: installing 64-bit Virtuoso package does not install 32-bti driver. To get those you must install the Connectivity Souite available as a free download from <a href="http://download.openlinksw.com/virtwiz/">OpenLink's website</a>. Then run odbcad32.exe to create a System DSN choosing OpenLink virtuoso driver. Now the php test script should work. Or should it?</p>
<h1>Problem 2: Unexpected T_PAAMAYIM_NEKUDOTAYIM</h1><br />
I'm not a PHP developer and so seeing the above for the first in my life was pretty confusing. All it means is "double colon". The problem comes from a file virtuoso.php,where it says:</p>
<pre class="brush: php; gutter: true">if ($result == $queryCache::ERFURT_CACHE_NO_HIT) {<br />
}</pre></p>
<h2>Solution</h2><br />
Numerous people on the web suggest that instead of the double colon the arrow (->) should be used to access a member on this variable. However this was not the case.&nbsp;ERFURT_CACHE_NO_HIT is a contant field and only changin the above to a static call on the class resolved this issue:</p>
<pre class="brush: php; gutter: true"> if ($result ==<br />
     Erfurt_Cache_Frontend_QueryCache::ERFURT_CACHE_NO_HIT) {</p>
<p>}</pre><br />
I have filed an <a href="https://github.com/AKSW/Erfurt/issues/5">issue</a> in Erfurt framework gir repository.</p>
<h1>Problem 3: Zend_Config_Ini::urlBase</h1><br />
Ok so finally I managed to run OntoWiki and my eyes saw the news/logon page. My url for now is unintresting http://localhost:9454. Manual says to login as Admin with no password. Doing it points my browser to&nbsp;http://localhost:9454index.php/application/login. Diagnosis: wrong action attribute on form.</p>
<h2>Solution</h2><br />
I haven't actually resolved this. A workaround is described here:&nbsp;<a href="http://code.google.com/p/ontowiki/issues/detail?id=1004">http://code.google.com/p/ontowiki/issues/detail?id=1004</a></p>
<h1>Problem 4: URL routing</h1><br />
Even though I corrected how OntoWiki constructs URLs, when I tried to log in IIS returns 404 response for URL http://localhost:9454/application/login (and probably would for any URL). The reason is that IIS does not understand .htaccess files (obviously!)</p>
<h2>Solution</h2><br />
Google pointed me to this post:&nbsp;<a href="http://blog.wilgucki.pl/2010/12/zend-framework-na-iis.html">http://blog.wilgucki.pl/2010/12/zend-framework-na-iis.html</a>.</p>
<pre class="brush: xml; gutter: true"><?xml version="1.0" encoding="UTF-8"?><br />
<configuration><br />
<system.webServer><br />
  <handlers><br />
     <add name="deny ini" verb="*" path="*.ini" type="System.Web.HttpForbiddenHandler" /><br />
  </handlers><br />
  <rewrite><br />
     <rules><br />
       <rule name="Don&#039;t rewrite physical files" stopProcessing="true"><br />
         <match url="((extensions|libraries).*|\.(js|ico|gif|jpg|png|css|php|swf|json))$" /><br />
         <conditions logicalGrouping="MatchAny"><br />
           <add input="{REQUEST_FILENAME}" matchType="IsFile" pattern="" ignoreCase="false" /><br />
           <add input="{REQUEST_FILENAME}" matchType="IsDirectory" pattern="" ignoreCase="false" /><br />
         </conditions><br />
         <action type="None" /><br />
       </rule><br />
       <rule name="Redirect favicon" stopProcessing="true"><br />
         <match url="^favicon\.(.*)$" /><br />
         <action type="Redirect" url="application/favicon.{R:1}" /><br />
       </rule><br />
       <rule name="Rewrite" stopProcessing="true"><br />
         <match url="^.*$" /><br />
         <serverVariables><br />
           <set name="ONTOWIKI_APACHE_MOD_REWRITE_ENABLED" value="true" /><br />
         </serverVariables><br />
         <action type="Rewrite" url="index.php" /><br />
       </rule><br />
     </rules><br />
   </rewrite><br />
</system.webServer><br />
</configuration></pre><br />
Basically you need to add the above web.config file to OntoWiki's root folder to add rules for ISS' URL rewrite module. You can read more on <a href="https://github.com/AKSW/OntoWiki/wiki/Install-on-IIS">OntoWiki's GitHub wiki</a>.</p>
<h1>Problem 5:&nbsp;Unknown user identifier (Admin)</h1><br />
OntoWki's wiki says that a fresh install should have a predefined user Admin. For me logging in fails with an error. Presumably this is due to invalid or incomplete model created by OntoWiki when it first ran. This model contains user credentials and user permissions.</p>
<h2><a href="http://t-code.pl/wp-content/uploads/2011/11/ontowiki-unknown-user-login1.png"><img class="aligncenter size-full wp-image-248" title="ontowiki - unknown user login" alt="" src="http://t-code.pl/wp-content/uploads/2011/11/ontowiki-unknown-user-login1.png" width="270" height="294" /></a>Solution</h2><br />
The above problem remains a mystery, although I did manage to resolve it with help of&nbsp;<a href=" http://sebastian.tramp.name">Sebastian Tramp</a> from the University of Lepzig.</p>
<p>What I did was first log in to OntoWiki using Virtuoso's admin credentials, which works as access for <em>SuperAdmin</em>. Then I deleted Configuration KB as shown below.</p>
<p><a href="http://t-code.pl/wp-content/uploads/2011/11/delete-knowledgebase.png"><img class="aligncenter size-full wp-image-253" title="delete knowledgebase" alt="" src="http://t-code.pl/wp-content/uploads/2011/11/delete-knowledgebase.png" width="515" height="305" /></a>This caused Virtuoso to complain it could not get access to %OntoWikiRoot%/libraries\Erfurt\Erfurt\include\SysOntLocal.rdf due to configuration. However this was not the case.</p>
<p>What helped though was deleting those two files and then deleting Virtuoso Database to make sure I was starting from scratch.</p>
<p>As an effect, the next time I ran OntoWiki a proper model was created and I was then able to log in as Admin.<!--:--></p>
