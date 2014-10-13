---
layout: post
status: publish
published: true
title: Versioning .NET git projects
date: !binary |-
  MjAxNC0wOC0yOSAxMzoxODoyMyAtMDQwMA==
categories:
- .NET
tags:
- .net
- c#
- visual studio
- git
 versioning
redirect_from:
- /2014/08/versioning-git-projects/ 
---

I myself have always struggled with proper versioning of .NET software. I'm not alone:

* [Best practices/guidance for maintaining assembly version numbers](http://stackoverflow.com/questions/3768261/best-practices-guidance-for-maintaining-assembly-version-numbers)
* [What are differences between AssemblyVersion, AssemblyFileVersion and AssemblyInformationalVersion?](http://stackoverflow.com/questions/64602/what-are-differences-between-assemblyversion-assemblyfileversion-and-assemblyin)

A linked issue, which adds to the complexity is mixing .NET versioning with NuGet SemVer guidelines.
This has been described for example in this [blog post](http://ruthlesslyhelpful.net/2012/03/05/build-numbering-and-versioning/)

<!--more-->

TL; DR; [click here](#solution)

## Setting version numbers in .NET projects

Empty .NET projects come with a AssemblyInfo.cs file, which contains assembly attributes, most notably

``` c#
[assembly: AssemblyVersion("2.3")]
[assembly: AssemblyFileVersion("2.3.4.1556")]
```

The first line determines the version of the program or library. That's the number you mean when you say that you add
reference to library version 2.3. The second number is a more detailed number which can be incremented separately, for
example to distinguish subsequent versions, which did not introduce any breaking changes. Although there is no such
requirement, it's probably sensible to keep the first two numbers aligned.

## Constructing version numbers
### (One of) the Microsoft way(s)

Let's take the assembly version number from above: `2.3.4.1556`. It is constructed from four integers
separated by dots.

* 2 - major version
* 3 - minor version
* 4 - build version
* 1556 - revision

I personally find these monikers quite misleading. Is build number an automatically incremented? Does it make sense
actually? Exact same source code would yield a different number on a build server and each developer's machine.

And what about revision number? With centralized version control systems like SVN traditionally I would see the commit
number be used here. So the above would mean that the code was built from revision 1556. This has a number of problems:

1. __each version segment cannot exceed 65535__ - a problem for large repositories, probably shared between multiple projects in an organization
1. __this will not work with git or mercurial__ - decentralized VCS use numeric commit numbers only locally - if at all. And SHA1 is a no-go, because version number cannot contain alpha characters</li><br />

### The other microsoft way

Out of the box .NET projects offer another way of automatically numbering assemblies at each build. It is possible to
declare the assembly version attribute as

``` c#
[assembly: AssemblyVersion("2.3.*")]
```

It will produce a number like 2.3.5354.19262. The build number is calculated as number of days since January 1st 2000
and the second is the number of 2 second intervals (rember the 65k limit) since midnight on a given day. Thus every time
a project is built a different number will be calculated. However this is a very bad pattern IMO and should be
discouraged. Most importantly there is no link between the number and the source code used. You could build you software
and the build it again from outdated files and get a higher version number (sic!).

### MSBuild community tasks

There is a project on [GitHub](https://github.com/loresoft/msbuildtasks) and [NuGet](https://nuget.org/packages/MSBuildTasks), 
which contains various [MSBuild tasks](http://msdn.microsoft.com/en-us/library/ms171466.aspx), which can extend the build 
process to include automated calculation of the assembly version number based on various algorithms called, ta dam, 
[Version](https://github.com/loresoft/msbuildtasks/blob/master/Source/MSBuild.Community.Tasks/Version.cs). It offers a 
number of options to better manage the version number such as storing and updating a version number text file and
automatically incrementing build/revision numbers. Simple as it may be, it's still poorly documented and requires manual 
fitting into your build process by modifying the msbuild targets.

The version file as another down side if you want to use a build server, because in some cases you would have to alter 
the build process to commit the changed version file.

### And what about major and minor

Another obstacle is actually managing the major and minor numbers. You can keep it in the AssemblyInfo.cs, version file 
or MSBuild task declaration. When you want to increment the version you have to remember to modify the wherever it is 
stored. If you want to create a tag for each version you have to also remember!

## <a name="solution">Simple, better way</a>
I've just recently come across a simple solution for projects that use git as their version control. Here's how it works:

1. You create a tag in your repository to set the major and minor version, for example __v2.3__.
1. You apply some more changes in __13__ commits.
1. You build your project
1. The version is calculated as __2.3.13__, which means that the program was built from source code __13__ commits ahead of tag __v2.3__.

![git-ver](/uploads/2014/08/git-ver.png)

The project is called Zoltu.Versioning and is [available from NuGet](https://www.nuget.org/packages/Zoltu.Versioning/).
The great thing is that it requires almost no preparations whatsoever. Just remove the existing version attributes from
AssemblyInfo.cs and install the nuget package. Now whenever you create a new tag in git, your version number will always
be up to date and aligned with changes in your repository. Also when some other developer (or build server) clones your
code and checks out some previous revision, the version will be always in line with the point in your source code history.

### Limitations

The only requirement is that the .git folder is present (ie. code must be a clone). Git however is not required, because
the package uses [LibGit2Sharp](https://www.nuget.org/packages/LibGit2Sharp) internally to find tags and process commit
history. This could be an obstacle for some build servers. With TeamCity for example it is necessary that the source
[code is checked out on agent and not on server](http://stackoverflow.com/questions/17555931/how-do-i-get-teamcity-to-create-the-git-directory-when-cloning-a-repo-for-build)
