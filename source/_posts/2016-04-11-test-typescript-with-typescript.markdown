---
layout: post
published: true
title: Fight TypeScript with TypeScript
date: 2016-04-11 09:35
categories:
- dajsiepoznac
- typescript
- unit tests
description: My recipe for testing code written in TypeScript with more TypeScript, karma, jasmine and sinon
keywords: typescript, tdd, jasmine, karma, testing, dajsiepoznac
comments: true
---

Given that I'm fairly satisfied with the state of my server-side [Hydra][Hydra] library for [NancyFx][NancyFx] called
**Argolis** it is now time to write some client-side library to consume it. I did some spiking in another small project
and it was now time to do it properly. I've already had some experience with TypeScript and JSPM so I decided to give
these two a go.

Unfortunately getting the project setup right was harder than I'd hoped. Here's how I managed to get my first test to pass.

<!--more-->

## Test first

I want to proceed with a TDD approach but unlike before this time I want to write both my code and modules in TypeScript.

![fight fire with fire](/uploads/2016/04/FightFireWith_Fire.png)

Here's my first test. I will place all tests in `tests` folder and my modules in the `src` folder as you can see in the
import in line 2.

As you see I'm using ES6/TypeScript syntax here with module imports and arrow functions.

{% codeblock lang:js %}
import * as sinon from 'sinon';
import * as heracles from '../src/heracles';

describe('Hydra resource', () => {
    it('should load resource with RDF accept header', (done) => {
        sinon.stub(window, 'fetch');
    
        window.fetch.returns(Promise.resolve(new Response()));
    
        heracles.Hydra.load('http://example.com/resource')
            .then((res) => {
                expect(window.fetch.calledWithMatch('http://example.com/resource')).toBe(true);
        
                done();
            })
            .catch(done);
    });
    
    afterEach(() => {
        window.fetch.restore();
    });
});
{% endcodeblock %}

In my first test I want to check that `window.fetch` is called with the expected URL. To do that I'm using [sinon][sinon]
stub to set up a call (line 8) and verify correct parameters (line 12). To make it work sinon must be installed from jspm.
Browser other that Chrome and Opera would also need the whatwg-fetch package or similar

``` bash
jspm install npm:sinon npm:whatwg-fetch
```
 
### Let's run it

With the first test in place I wanted to run it so that it becomes [**<span style="color: red">red</span>**][red-test].

I've recently found the [Test'em][testem] and it looked very promising with the super-easy CI integration and convenient
command line UI. Unfortunately it turns out that it [doesn't like system.js](https://github.com/testem/testem/issues/784).
I've tried other solutions and eventually Karma worked.

#### Setting up karma

First, install karma, local npm packages and initialize karma

``` bash
npm install -g karma karma-jasmine jasmine-core
npm install -g karma-chrome-launcher 
npm install -g karma-systemjs systemjs
karma init
```

Second, set up systemjs so that karma can load TypeScript tests directly. This is possible thanks to the [karma-systemjs][ksjs].
To set it up add it as the ***first*** framework in karma and add systemjs configuration:
 
{% codeblock lang:js %}
module.exports = function(config) {
  config.set({
    frameworks: ['systemjs', 'jasmine'],
    
    files: [
      'tests/*-spec.ts'
    ],
    
    systemjs: {
      configFile: 'config.js',
      serveFiles: [
        'src/**/*.ts',
        'jspm_packages/**/*'
      ]
    }
  })
}
{% endcodeblock %}

The `systemjs` section reuses jspm configuration and sets up paths served by karma server.

The `config.js` file should look similar to the one below. 
Mind the `packages` and `transpiler` settings which make systemjs load selected typescript modules directly without upfront
transpilation.

{% codeblock lang:js %}
System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "typescript",
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  packages: {
    "src": {
      "defaultExtension": "ts"
    },
    "tests": {
      "defaultExtension": "ts"
    }
  },

  map: {
  }
});
{% endcodeblock %}

#### Let's run it for real now

If followed the above instructions you should be able to run karma server and have it start Chrome

``` bash
karma start
```

This should execute the first test and fail on missing implementation

``` text
Chrome 49.0.2623 (Windows 8.1 0.0.0) ERROR
  Error: Error: XHR error (404 Not Found) loading E:/experiments/karma-ts/src/heracles.ts
        Error loading E:/experiments/karma-ts/src/heracles.ts as "../src/heracles" from E:/experiments/karma-ts/tests/heracles-spec.ts
```

## Add some code

Let's fix the test by actually adding the first piece of code

{% codeblock lang:js %}
export class Hydra {
  static load(uri: string) {
    return window.fetch(uri);
  }
}
{% endcodeblock %}

If you haven't stopped the karma server it will notice the new file being added and rerun the test. The result should be 
similar to

``` text
INFO [watcher]: Added file "E:/experiments/karma-ts/src/heracles.ts".
Chrome 49.0.2623 (Windows 8.1 0.0.0): Executed 1 of 1 SUCCESS (0.009 secs / 0.005 secs)
```

## Summary

*Et voilà*, this was pleasantly simple. There are no build/cleanup steps required to execute the test, because systemjs
does the transpilation on the fly. Karma may not have the cool little terminal control panel and test summary but it is
an established testing tool and integrates well with many IDEs

## Bonus - typings

Speaking of IDE, Webstorm coloured a lot of my code red, because it doesn't recognize sinon and jasmin and fetch. To remedy
that there are [typings]. 

``` bash
npm install -g typings
```

Sinon and jasmine have an *official* typings package. There is also a repository with typings for `window.fetch`. They
are not all installed the same way though:

``` bash
typings install sinon --save
typings install jasmine --save --ambient
typings install github:ryan-codingintrigue/typescript-fetch/fetch.js.d.ts --save --ambient 
```

As you see jasmine and fetch typings are installed as *ambient*. This is because they populate the global scope (or window).
Otherwise typings would wrap them in a named module. After all modules can be installed under an alias.

Finally add a typings reference to you source and test files like

``` js
/// <reference path="../typings/main.d.ts" />
```

There you go, no there are far less source code errors and also some additional context help from the editor. And remember
not to commit the `typings` folder. Instead commit the `typings.json` file and run `typings install` to restore them.

[Hydra]: http://hydra-cg.org
[NancyFx]: http://github.com/nancyfx/nancy 
[testem]: https://github.com/testem/testem
[sinon]: http://sinonjs.org/
[red-test]: http://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html
[ksjs]: https://github.com/rolaveric/karma-systemjs
[typings]: https://github.com/typings/typings
