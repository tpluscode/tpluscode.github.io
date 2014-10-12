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
<p><!--:en--><img class="alignright" title="Semantic Web" alt="Semantic Web logo" src="http:&#47;&#47;semanticweb.org&#47;images&#47;Semantic-Web-Logo-by-W3C.png" width="129" height="155" &#47;>Recently I've been experimenting with <a href="http:&#47;&#47;semanticweb.org">Semantic Web<&#47;a> techonogies. Currently I'm trying to choose tools for editing the ontology and more importantly instances. There are a number of tools, both commercial and free including my favourites:&nbsp;<a href="http:&#47;&#47;protege.stanford.edu">Prot&eacute;g&eacute;<&#47;a>, <a href="http:&#47;&#47;neon-toolkit.org">NeON Toolkit<&#47;a>&nbsp;or <a href="http:&#47;&#47;www.topquadrant.com&#47;composer&#47;">Top Braid Composer<&#47;a>. Each of those have some problem. NeON is nice but desktop only, Top Braid is not free and&nbsp;Prot&eacute;g&eacute; is very complex. Not to mention it comes in versions 3.x and 4.x with <a href="http:&#47;&#47;protegewiki.stanford.edu&#47;wiki&#47;Protege4Migration">different set of functions<&#47;a> which only makes the confusion grow...</p>
<p>In my search I have found <a href="http:&#47;&#47;ontowiki.net&#47;Projects&#47;OntoWiki">OntoWiki<&#47;a>. It is web-based, seems user-friendly and it's recommended backend is Virtuoso, which I chose for it is Open Source and presumably mature and feature-rich. There is a walkthrough on <a href="http:&#47;&#47;code.google.com&#47;p&#47;ontowiki&#47;wiki&#47;UsingOntoWikiWithVirtuoso">setting up OntoWiki with Virtuoso<&#47;a>, which I followed. Unfortunately things don't always go right. Below are the problems I encountered and solutions which helped.</p>
<h1>Problem 1: Setting up ODBC<&#47;h1><br />
My server is running Windows 2008 64bit. for now I have installed Virtuoso trial using the msi package available for download from OpenLink's website. During installation it automatically sets up a System DSN:</p>
<p><a href="http:&#47;&#47;t-code.pl&#47;wp-content&#47;uploads&#47;2011&#47;11&#47;virtuoso-dsn.png"><img class="aligncenter size-medium wp-image-243" title="Default Virtuoso DSN" alt="" src="http:&#47;&#47;t-code.pl&#47;wp-content&#47;uploads&#47;2011&#47;11&#47;virtuoso-dsn-300x209.png" width="300" height="209" &#47;><&#47;a>There is a problem however. When I ran the test php script instead of graphs listed I got an error saying:</p>
<pre><code>[Microsoft][ODBC Driver Manager] The specified DSN contains an architecture mismatch between the Driver and Application<&#47;code><&#47;pre></p>
<h2>Solution<&#47;h2><br />
To resolve this a DSN must be created using 32-bit version of obdcad32.exe, which sits in c:\windows\sysWOW64\. There is a problem however: installing 64-bit Virtuoso package does not install 32-bti driver. To get those you must install the Connectivity Souite available as a free download from <a href="http:&#47;&#47;download.openlinksw.com&#47;virtwiz&#47;">OpenLink's website<&#47;a>. Then run odbcad32.exe to create a System DSN choosing OpenLink virtuoso driver. Now the php test script should work. Or should it?</p>
<h1>Problem 2: Unexpected T_PAAMAYIM_NEKUDOTAYIM<&#47;h1><br />
I'm not a PHP developer and so seeing the above for the first in my life was pretty confusing. All it means is "double colon". The problem comes from a file virtuoso.php,where it says:</p>
<pre class="brush: php; gutter: true">if ($result == $queryCache::ERFURT_CACHE_NO_HIT) {<br />
}<&#47;pre></p>
<h2>Solution<&#47;h2><br />
Numerous people on the web suggest that instead of the double colon the arrow (->) should be used to access a member on this variable. However this was not the case.&nbsp;ERFURT_CACHE_NO_HIT is a contant field and only changin the above to a static call on the class resolved this issue:</p>
<pre class="brush: php; gutter: true"> if ($result ==<br />
     Erfurt_Cache_Frontend_QueryCache::ERFURT_CACHE_NO_HIT) {</p>
<p>}<&#47;pre><br />
I have filed an <a href="https:&#47;&#47;github.com&#47;AKSW&#47;Erfurt&#47;issues&#47;5">issue<&#47;a> in Erfurt framework gir repository.</p>
<h1>Problem 3: Zend_Config_Ini::urlBase<&#47;h1><br />
Ok so finally I managed to run OntoWiki and my eyes saw the news&#47;logon page. My url for now is unintresting http:&#47;&#47;localhost:9454. Manual says to login as Admin with no password. Doing it points my browser to&nbsp;http:&#47;&#47;localhost:9454index.php&#47;application&#47;login. Diagnosis: wrong action attribute on form.</p>
<h2>Solution<&#47;h2><br />
I haven't actually resolved this. A workaround is described here:&nbsp;<a href="http:&#47;&#47;code.google.com&#47;p&#47;ontowiki&#47;issues&#47;detail?id=1004">http:&#47;&#47;code.google.com&#47;p&#47;ontowiki&#47;issues&#47;detail?id=1004<&#47;a></p>
<h1>Problem 4: URL routing<&#47;h1><br />
Even though I corrected how OntoWiki constructs URLs, when I tried to log in IIS returns 404 response for URL http:&#47;&#47;localhost:9454&#47;application&#47;login (and probably would for any URL). The reason is that IIS does not understand .htaccess files (obviously!)</p>
<h2>Solution<&#47;h2><br />
Google pointed me to this post:&nbsp;<a href="http:&#47;&#47;blog.wilgucki.pl&#47;2010&#47;12&#47;zend-framework-na-iis.html">http:&#47;&#47;blog.wilgucki.pl&#47;2010&#47;12&#47;zend-framework-na-iis.html<&#47;a>.</p>
<pre class="brush: xml; gutter: true"><?xml version="1.0" encoding="UTF-8"?><br />
<configuration><br />
<system.webServer><br />
  <handlers><br />
     <add name="deny ini" verb="*" path="*.ini" type="System.Web.HttpForbiddenHandler" &#47;><br />
  <&#47;handlers><br />
  <rewrite><br />
     <rules><br />
       <rule name="Don&#039;t rewrite physical files" stopProcessing="true"><br />
         <match url="((extensions|libraries).*|\.(js|ico|gif|jpg|png|css|php|swf|json))$" &#47;><br />
         <conditions logicalGrouping="MatchAny"><br />
           <add input="{REQUEST_FILENAME}" matchType="IsFile" pattern="" ignoreCase="false" &#47;><br />
           <add input="{REQUEST_FILENAME}" matchType="IsDirectory" pattern="" ignoreCase="false" &#47;><br />
         <&#47;conditions><br />
         <action type="None" &#47;><br />
       <&#47;rule><br />
       <rule name="Redirect favicon" stopProcessing="true"><br />
         <match url="^favicon\.(.*)$" &#47;><br />
         <action type="Redirect" url="application&#47;favicon.{R:1}" &#47;><br />
       <&#47;rule><br />
       <rule name="Rewrite" stopProcessing="true"><br />
         <match url="^.*$" &#47;><br />
         <serverVariables><br />
           <set name="ONTOWIKI_APACHE_MOD_REWRITE_ENABLED" value="true" &#47;><br />
         <&#47;serverVariables><br />
         <action type="Rewrite" url="index.php" &#47;><br />
       <&#47;rule><br />
     <&#47;rules><br />
   <&#47;rewrite><br />
<&#47;system.webServer><br />
<&#47;configuration><&#47;pre><br />
Basically you need to add the above web.config file to OntoWiki's root folder to add rules for ISS' URL rewrite module. You can read more on <a href="https:&#47;&#47;github.com&#47;AKSW&#47;OntoWiki&#47;wiki&#47;Install-on-IIS">OntoWiki's GitHub wiki<&#47;a>.</p>
<h1>Problem 5:&nbsp;Unknown user identifier (Admin)<&#47;h1><br />
OntoWki's wiki says that a fresh install should have a predefined user Admin. For me logging in fails with an error. Presumably this is due to invalid or incomplete model created by OntoWiki when it first ran. This model contains user credentials and user permissions.</p>
<h2><a href="http:&#47;&#47;t-code.pl&#47;wp-content&#47;uploads&#47;2011&#47;11&#47;ontowiki-unknown-user-login1.png"><img class="aligncenter size-full wp-image-248" title="ontowiki - unknown user login" alt="" src="http:&#47;&#47;t-code.pl&#47;wp-content&#47;uploads&#47;2011&#47;11&#47;ontowiki-unknown-user-login1.png" width="270" height="294" &#47;><&#47;a>Solution<&#47;h2><br />
The above problem remains a mystery, although I did manage to resolve it with help of&nbsp;<a href=" http:&#47;&#47;sebastian.tramp.name">Sebastian Tramp<&#47;a> from the University of Lepzig.</p>
<p>What I did was first log in to OntoWiki using Virtuoso's admin credentials, which works as access for <em>SuperAdmin<&#47;em>. Then I deleted Configuration KB as shown below.</p>
<p><a href="http:&#47;&#47;t-code.pl&#47;wp-content&#47;uploads&#47;2011&#47;11&#47;delete-knowledgebase.png"><img class="aligncenter size-full wp-image-253" title="delete knowledgebase" alt="" src="http:&#47;&#47;t-code.pl&#47;wp-content&#47;uploads&#47;2011&#47;11&#47;delete-knowledgebase.png" width="515" height="305" &#47;><&#47;a>This caused Virtuoso to complain it could not get access to %OntoWikiRoot%&#47;libraries\Erfurt\Erfurt\include\SysOntLocal.rdf due to configuration. However this was not the case.</p>
<p>What helped though was deleting those two files and then deleting Virtuoso Database to make sure I was starting from scratch.</p>
<p>As an effect, the next time I ran OntoWiki a proper model was created and I was then able to log in as Admin.<!--:--></p>
