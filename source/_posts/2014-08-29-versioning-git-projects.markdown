---
layout: post
status: publish
published: true
title: Versioning .NET git projects
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 348
wordpress_url: http://t-code.pl/?p=348
date: !binary |-
  MjAxNC0wOC0yOSAxMzoxODoyMyAtMDQwMA==
date_gmt: !binary |-
  MjAxNC0wOC0yOSAxMToxODoyMyAtMDQwMA==
categories:
- Uncategorized
tags:
- .net
- c#
- visual studio
comments: []
---
<h1><a href="#solution">TL; DR; click here<&#47;a><&#47;h1><br />
I myself have always struggled with proper versioning of .NET software. I'm not alone:</p>
<ul>
<li><a href="http:&#47;&#47;stackoverflow.com&#47;questions&#47;3768261&#47;best-practices-guidance-for-maintaining-assembly-version-numbers">Best practices&#47;guidance for maintaining assembly version numbers<&#47;a><&#47;li>
<li><a href="http:&#47;&#47;stackoverflow.com&#47;questions&#47;64602&#47;what-are-differences-between-assemblyversion-assemblyfileversion-and-assemblyin">What are differences between AssemblyVersion, AssemblyFileVersion and AssemblyInformationalVersion?<&#47;a><&#47;li><br />
<&#47;ul><br />
A linked issue, which adds to the complexity is mixing .NET versioning with NuGet SemVer guidelines. This has been described for example in this <a href="http:&#47;&#47;ruthlesslyhelpful.net&#47;2012&#47;03&#47;05&#47;build-numbering-and-versioning&#47;">blog post<&#47;a>.</p>
<h1>Setting version numbers in .NET projects<&#47;h1><br />
Empty .NET projects come with a AssemblyInfo.cs file, which contains assembly attributes, most notably</p>
<pre class="brush: csharp; gutter: true">[assembly: AssemblyVersion("2.3")]<br />
[assembly: AssemblyFileVersion("2.3.4.1556")]<&#47;pre><br />
The first line determines the version of the program or library. That's the number you mean when you say that you add reference to library version 2.3. The second number is a more detailed numberm which can be incremented separately, for example to distinguish subsequent versions, which did not introduce any breaking changes. Although there is no such requirement, it's probably sensible to keep the first two numbers aligned.</p>
<h1>Constructing version numbers<&#47;h1></p>
<h2>(One of) the Microsoft way(s)<&#47;h2><br />
Let's take the assembly version number from above:&nbsp;<em>2.3.4.1556.<&#47;em> It is constructed from four integers separated by dots.</p>
<ul>
<li>2 - major version<&#47;li>
<li>3 - minor version<&#47;li>
<li>4 - build version<&#47;li>
<li>1556 - revision<&#47;li><br />
<&#47;ul><br />
I personally find these monikers quite misleading. Is build number an automatically incremented? Does it make sense actually? Exact same source code would yield a different number on a build server and each developer's machine.</p>
<p>And what about revision number? With centralized versioon control systems like SVN traditionally I would see the commit number be used here. So the above would mean that the code was built from revision 1556. This has a number of problems:</p>
<ol>
<li><strong>each version segment cannot exceed 65535<&#47;strong> - a problem for large repositories, probably shared between multiple projects in an organization<&#47;li>
<li><strong>this will not work with git or mercurial&nbsp;<&#47;strong>- decentralized VCS use numeric commit numbers only locally - if at all. And SHA1 is a no-go, becasue version number cannot contain alpha characters<&#47;li><br />
<&#47;ol></p>
<h2>The other microsoft way<&#47;h2><br />
Out of the box .NET projects offer another way of automatically numbering assemblies at each build. It is possible to declare the assembly version attribute as</p>
<pre class="brush: csharp; gutter: true">[assembly: AssemblyVersion("2.3.*")]<&#47;pre><br />
It will produce a number like 2.3.5354.19262. The build number is calculated as number of days since January 1st 2000 and the second is the number of 2 second intervals (rember the 65k limit) since midnight on a given day. Thus every time a project is built a different number will be caluclated. However this is a very bad pattern IMO and should be discouraged. Most importantly there is no link between the number and the source code used. You could build you software and the build it again from outdated files and get a higher version number (sic!).</p>
<h2>MSBuild community tasks<&#47;h2><br />
There is a project on <a href="https:&#47;&#47;github.com&#47;loresoft&#47;msbuildtasks">GitHub<&#47;a>&nbsp;and <a href="https:&#47;&#47;nuget.org&#47;packages&#47;MSBuildTasks">NuGet<&#47;a>, which contains various <a href="http:&#47;&#47;msdn.microsoft.com&#47;en-us&#47;library&#47;ms171466.aspx">MSBuild tasks<&#47;a>, which can extend the build process to include automated calculation of the assembly version number based on various algorithms called, ta dam, <a href="https:&#47;&#47;github.com&#47;loresoft&#47;msbuildtasks&#47;blob&#47;master&#47;Source&#47;MSBuild.Community.Tasks&#47;Version.cs">Version<&#47;a>. It offers a number of options to better manage the version number such as storing and updating a version number text file and automatically incrementing build&#47;revision numbers. Simple as it may be, it's still poorly documented and requires manual fitting into your build process by modifying the msbuild targets.</p>
<p>The version file as another down side if you want to use a build server, because in some cases you would have to alter the build process to commit the changed version file.</p>
<h2>And what about major and&nbsp;minor<&#47;h2><br />
Another obstacle is actually managing the major and minor numbers. You can keep it in the AssemblyInfo.cs, version file or MSBuild task declaration. When you want to increment the version you have to remember to modify the wherever it is stored. If you want to create a tag for each version you have to also remember!</p>
<h1><a name="solution">Simple, better way<&#47;a><&#47;h1><br />
I've just recently come accross a simple solution for projects that use git as their version control. Here's how it works:</p>
<ol>
<li>You create a tag in your repository to set the major and minor version, for example&nbsp;<strong>v2.3<&#47;strong>.<&#47;li>
<li>You apply some more changes in <strong>13<&#47;strong> commits.<&#47;li>
<li>You build your project<&#47;li>
<li>The version is calculated as <strong>2.3.13<&#47;strong>, which means that the program was built from source code <strong>13<&#47;strong> commits ahead of tag <strong>v2.3<&#47;strong>.<&#47;li><br />
<&#47;ol><br />
<a href="http:&#47;&#47;t-code.pl&#47;wp-content&#47;uploads&#47;2014&#47;08&#47;git-ver.png"><img class="aligncenter size-full wp-image-351" alt="git versioning" src="http:&#47;&#47;t-code.pl&#47;wp-content&#47;uploads&#47;2014&#47;08&#47;git-ver.png" width="265" height="306" &#47;><&#47;a></p>
<p>The project is called Zoltu.Versioning and is <a href="https:&#47;&#47;www.nuget.org&#47;packages&#47;Zoltu.Versioning&#47;">available from NuGet<&#47;a>. The great thing is that it requires almost no preparations whatsoever. Just remove the existing version attributes from AssemblyInfo.cs and install the nuget package. Now whenever you create a new tag in git, your version number will always be up to date and aligned with changes in your repository. Also when some other developer (or build server) clones your code and checks out some previous revision, the version will be always in line with the point in your source code history.</p>
<h2>Limitations<&#47;h2><br />
The only requirement is that the .git folder is present (ie. code must be a clone). Git however is not required, because the package uses&nbsp;<a href="https:&#47;&#47;www.nuget.org&#47;packages&#47;LibGit2Sharp">LibGit2Sharp<&#47;a> internally to find tags and process commit history. This could be an obstacle for some build servers. With TeamCity for example it is necessary that the source <a href="http:&#47;&#47;stackoverflow.com&#47;questions&#47;17555931&#47;how-do-i-get-teamcity-to-create-the-git-directory-when-cloning-a-repo-for-build">code is checked out on agent and not on server<&#47;a>.</p>
