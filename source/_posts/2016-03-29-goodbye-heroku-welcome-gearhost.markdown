---
layout: post
published: true
title: Goodbye Heroku, welcome Gearhost (for now)
date: 2016-03-29 13:25
categories:
- dajsiepoznac
- heroku
- gearhost
description: I've eventually given up on using Heroku for .NET and now deploy my nancy apps to Gearhost
comments: true
---

In a [previous post](/2016/03/mono-paket-heroku-deployment/) I detailed my struggle with deploying a .NET ([Nancy][Nancy])
application to Heroku. Longer story short, **I failed**. I guess it should be possible with .NET Core, but I don't plan
to migrate just yet, because I don't see clear benefits and there are some limitations. Running my application on Linux
is not a goal itself, so instead I looked for an alternative.

<!--more-->

## AppHarbor - for now I'll pass

Unfortunately, there aren't many options for hosting .NET code in the cloud. One provider I've known about for some time
now is [AppHarbor][AppHarbor]. Unfortunately it seems somewhat limited in terms of the deployment flow. As I understand,
the only way is to push code, much like with Heroku, which is then picked up and the Web Application is deployed. One the
up side AppHarbor also executes unit tests and does monitoring and load balancing but all in all it strikes me as poorly
documented and not at all customizable. 
 
That said I may yet try it in the future however for now I will be using a simpler option call [Gear Host][gh].

## Gear.host

Just like Heroku and AppHarbor, GearHost is a cloud hosting solution and free albeit with limitations. More about that
later.

![gearhost logo](/uploads/2016/03/gearhost-logo.png)

Upon logging in for the first time (surprisingly no GitHub login, etc.) we are presented with a simple dashboard from
which it is possible to create *Cloud Sites* and databases and buy/add SSL certificates.

### Cloud Sites

In the free plan each cloud site comes with

* 1 GB storage
* 1 GB bandwidth, which resets every 61 hrs
* 256 MB RAM, which resets every 60 minutes
* 60 minutes of CPU time, which resets every 24 hrs

I don't really understand how the running limit works for memory consumption. Needless to say, whenever these limits are
exceeded, the site becomes suspended until it resets. Paid plans come for $5 and $25 per month.

Each site comes with a minimal overview page where it is possible to view resource usage graph and statistics and recycle
the application pool.

### Publishing

Publishing can be done by copying the files directly over FTP and WebDeploy or in continuous deployment fashion from
GitHub, Bitbucket or Git repository hosted by GearHost. Personally I chose WebDeploy, because it plays nicely with my
AppVeyor setup. I was already publishing my web applications as zipped packages and pushing to GearHost. On AppVeyor I 
created testing environments. Here's a screenshot showing one of them:

![Web Deploy environment on AppVeyor](/uploads/2016/03/appveyor-deploy-env.png)

Whenever there is a successful build AppVeyor pushes the zipped web project to GearHost. To do that there must be an
`appveyor.yml` which defines when and what to deploy. In my case its relevant contents are as follows.

``` yaml
build:
  publish_wap: true  

configuration:  
  - Debug
  - Release 
  
deploy:
  - provider: Environment
    name: '[TEST] data.wikibus.org'
    on:
      Configuration: Debug
  - provider: Environment
    name: '[TEST] wikibus.org'
    on:
      Configuration: Debug
```

This means that:

1. msbuild will create zip packages for all Web Application projects within the solution
1. I'm building both Debug and Release
1. Debug build is automatically pushed to testing environment
 
### Other features

I've not used most of what GearHost has to offer but it seems featured enough. It is possible to configure per-site app
settings and connection string, attach custom domains and enable logging (accessible via FTP). There is also an add-ons
tab, but only a Scheduler addon is showing.

Outside Cloud Sites I mentioned certificates and databases. The former seem quite expensive but of course it is possible
to use one bought from a third-party vendor. Database is offered for free albeit with a very modest 5 MB size limitation.
of course larger databases are also available for $5 per month for up to 10 GB.

Lastly there an email tab, but I haven't been able to use this feature without verifying my account which means adding
credit card details to the account.

## Summary

I'm a bit unsure about the free account limitation. It will be enough for testing but it seems that hitting the ceiling
will be quite easy. I suppose I would try the $5 plan in the future to see how it works.

Other that that it's a very pleasant experience. The website is very simple and the hosting just works :)

[Nancy]: http://github.com/nancyfx/nancy
[AppHarbor]: https://appharbor.com/
[gh]: https://www.gearhost.com/
