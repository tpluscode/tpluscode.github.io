---
layout: post
published: false
title: Publishing Polymer elements written in TypeScript (with dependencies)
date: 2016-06-19 22:45
categories:
- polymer
- typescript
description: A subjective guide to authoring and publishing custom elements written in Polymer with TypeScript
keywords: polymer, typescript, bundling, publishing, modules
comments: true
---

I love consuming [custom elements][elements] but writing them in [Polymer][polymer] with ES5 is far from ideal. ES6 ([or
more correctly ES2015][es-naming]) offers some improvement but it is still not officially supported by the Polymer team
and their toolset. 

Thankfully there is [PolymerTS][PolymerTS] which offers a vastly improved Polymer API, mainly thanks to decorators. It 
also let's developers take advantage of ES6 modules but there is one problem: how do you publish element with dependencies
both on JSPM packages and another elements from Bower?

<!--more-->

## TL;DR; Just show me the code

I've created two example repositories:
 
1. [`md-ed` - a component written in PolymerTS](https://github.com/tpluscode/md-ed)
1. [sample usage with Bower](https://github.com/tpluscode/md-ed-sample/tree/bower)
1. [sample usage with JSPM](https://github.com/tpluscode/md-ed-sample/tree/jspm)

## Repo setup

Inspired by the [Taming Polymer post][taming] by Juha Järvi, the initial setup involves preparing JSPM, SystemJS and 
TypeScript. The original post however, discusses creating apps. Here I will show how to create, publish and consume a
reusable element. 

**First**, bootstrap JSPM by running `jspm init`. All question can be left with default answers except choosing TypeScript 
as the transpiler.

**Second**, instruct SystemJS to assume `ts` as the default extension when loading out code. I usually place it in the 
`src` folder and so update `config.js` file accordingly by adding the `packages` property for the sources folder.

{% codeblock lang:js %}
System.config({
  
  packages: {
    "src": {
      "defaultExtension": "ts"
    }
  }
  
});
{% endcodeblock %}

**Lastly**, you will need PolymerTS itself and SystemJS plugin for loading HTML files using the ES6 `import` syntax. They
are installed by running:

```
bower init
bower i nippur72/PolymerTS --save
jspm i html=github:Hypercubed/systemjs-plugin-html
```

Note that unlike Juha Järvi, I install systemjs-plugin-html from jspm and not bower. It is also crucial that you explicitly
set the name for the plugin by installing with `html=` prefix. Otherwise bundling which I explain later in this post will
not work.

## Creating elements

### Internal dependencies and HTML templates

Because I'm using SystemJS with a transpiler, each element will be split into separate html and ts files. The HTML will 
contain the `<dom-module>` element but no script. Instead, each of the elements' code will import the template using the
import syntax via the systemjs-plugin-html plugin. Note the `.html!` suffix. 

{% codeblock lang:js %}
import './md-ed.html!'
import {DefaultMdBehavior} from 'DefaultMdBehavior';

@component('md-ed')
@behavior(DefaultMdBehavior)
class MdEd extends polymer.Base {
}

MdEd.register();
{% endcodeblock %}

Similarly, any shared module or other local elements can be referenced using modules. Above you can see the second line
which imports a behavior.

### External library dependencies

With the help of JSPM and SystemJS, your elements written in TypeScript (or ES6 I imagine) can reference virtually any
external library. They can be packaged as AMD or CommonJS modules or as globals. JSPM unifies the module definitions so
that most libraries simply work in the browser.

The example component uses the [marked](https://github.com/chjj/marked) library to parse markdown. It is an npm module
which I install with JSPM as usual

``` bash
jspm i npm:marked
```

Now, it's possible to import the library and use its functionality in the custom element.

{% codeblock lang:js %}
import 'marked';

class MdEd extends polymer.Base {

    @property({ notify: true })
    markdown:String;
    
    @observe('markdown')
    _markdownChanged(md) {
        var html = marked(md);
        // do something with parsed markdown
    }
}
{% endcodeblock %}

### External web component dependencies

Most web components are currently installed with bower. This is true for Google's elements from [elements.polymer-project.org][el]
and most I've seen on [customelements.io][cust]. Bower is used because it creates a flat directory structure which allows
for predictable import links. Unfortunately, there is no built-in way for importing such dependencies. Also bundling won't
work for elements which explicitly import polymer.html. There is currently no way to exclude certain imports from the bundle
which causes multiple Polymers. Needless to say, it is bad.

So, if you need to reference a third party component like some Iron or Paper Elements simply install them from bower but
don't import them in any of your source files. Instead they will be imported in th.

## Publishing for Bower

Follow the instructions below if you want to publish you element to be consumed from Bower.

### Bundling

Bundling is done by running the JSPM CLI which has a number of options. For universal consumer I've found the `bundle-sfx`
command works best, because it allows creating UMD or universal packages which require neither any specific module loader
nor JSPM/SystemJS. Elements bundled this way will be possible to consume using bower just like any other element. 

I usually add the bundling command to NPM scripts:

{% codeblock lang:js %}
{
  "scripts": {
    "build-bower": "jspm bundle-sfx src/md-ed - marked dist/bower/build.js --format global --globals \"{'marked': 'marked'}\""
  }
}
{% endcodeblock %}

`src/md-ed - marked dist/build/build.js` means that the root `src/md-ed.ts` file and it's dependent modules will be bundled 
into `dist/bower/build.js` but will not include the marked library. The marked library will be added later as a bower
dependency.

`--format global` creates a bundle without any module loaders. This is enough for bower and web components.

Finally, the `--globals "{'marked': 'marked'}"` switch is required for some excluded modules when bundling. It tells
JSPM what global variable to to use when injecting dependencies into your bundled modules.

I'm intentionally not minifying the contents. The consumer will do so when bundling his or her actual application.

Now, running `npm run build-bower` will create a `bower/dist/build.js` with transpiled and bundled scripts and `bower/dist/build.html`
with [vulcanized][vulcanize] files. Interestingly, the html must exist beforehand, which looks like a bug in the SystemJS html
plugin. Simply create one before running the npm script:

``` bash
mkdir dist
touch build.html
npm run build-bower
```

Oh, and don't exclude the `dist` folder from git. You'll want to push the bundled files with everything else.

### Packaging

Most components published with Bower include a html file named same as the repository (and element). My element is called
`md-ed` and so I created a `md-ed.html` file in the root of my repository. This will be the main entrypoint for consumers
to import. Here's the complete file:

``` html
<!-- imports of bower dependencies -->
<link rel="import" href="../polymer-ts/polymer-ts.min.html"/>
<link rel="import" href="../paper-input/paper-textarea.html" />
<link rel="import" href="../paper-tabs/paper-tabs.html" />
<link rel="import" href="../iron-pages/iron-pages.html" />
<script src="../marked/lib/marked.js"></script>

<!-- import of bundled HTML files -->
<link rel="import" href="dist/bower/build.html" />

<!-- this is required due to a bug in HTML loader for SystemJS -->
<script>
    var System = System || {};
    System.register = System.register || function(){};
</script>

<!-- referencing the bundled, transpiled code of the element -->
<script src="dist/bower/build.js"></script>
```

At the top I added bower dependencies. It's important that the paths don't include `bower_components`. On the consumer 
side, the elements will already live alongside other bower dependencies. I include all component dependencies and marked,
which I excluded from the bundle. Shall you choose not to exclude some dependency, you would then keep it out of your
bower entrypoint.

Below the bundled files are referenced. There is some additional boilerplate here. The extra script is a remedy for another 
shortcoming of the systemjs-plugin-html. It doesn't play nice with the `bundle-sfx` command and leaves some references to
SystemJS. This is simply to avoid `System is undefined` errors.
 
Finally, you may also want to add the file to you bower.json as `"main": "md-ed.html"`.

{% codeblock lang:json %}
{
  "name": "md-ed",
  "main": "md-ed.html"
}
{% endcodeblock %}

### Consuming

Consuming with Bower is as easy as it gets. Simply install the element:

``` bash
bower install --save tpluscode/md-ed
```

add an import `<link>` and use the element on you page:

``` html
<!doctype html>
<html>
<head>
    <script src="bower_components/webcomponentsjs/webcomponents.min.js"></script>
    <link rel="import" href="bower_components/md-ed/md-ed.html"/>
</head>
<body>
    <md-ed></md-ed>
</body>
</html>
```

## Publishing for JSPM

Follow the instructions below if you want to publish you element to be consumed from JSPM.

### Bundling

Unfortunately, the same bundling command doesn't work for both Bower and JSPM. I've found that for JSPM it is best to
use the `jspm bundle` command which produces a similar output but for use exclusively with SystemJS and no other module
loaders. The npm script is similar but simpler than the command used for Bower:

{% codeblock lang:js %}
{
  "scripts": {
    "build-jspm": "jspm bundle src/md-ed - marked dist/jspm/bundle.js"
  }
}
{% endcodeblock %}

It produces a similar output - combined scripts in `dist/jspm/bundle.js` file and vulcanized `dist/jspm/bundle.html`. Here
the marked library is also excluded from the bundle.

### Packaging

For consumers to be able to use your JSPM package it is also necessary to create a main entrypoint. For that purpose I 
created an `md-ed.js` file in the root of the repository.

``` js
import "bower_components/polymer-ts/polymer-ts.min.html!";
import "bower_components/paper-input/paper-textarea.html!";
import "bower_components/paper-tabs/paper-tabs.html!";
import "bower_components/iron-pages/iron-pages.html!";

import './dist/jspm/bundle.html!'
import './dist/jspm/bundle'

System.import('src/md-ed.ts');
```

The outline is very similar to Bower's entrypoint: 

1. Import bower dependencies with HTML plugin
1. Import the bundled HTML and scripts
1. Load the element from the bundle

The last step is necessary because JSPM bundles don't immediately load any modules. They are just used to combine multiple
modules in one script.

For the element's package to be installed correctly, the configuration file must include the main file, similarly to that
of bower.

A perceptive reader will notice that I'm using ES6 module syntax here. SystemJS can handle this just fine provided the
format option is set in `package.json`. Here's mine, with both entrypoint script and the format set.

{% codeblock lang:json %}
{
  "jspm": {
    "main": "md-ed.js",
    "format": "es6"
  }
}
{% endcodeblock %}

### Consuming

Consumers, in order to us the element, must install it using JSPM but also install the necessary bower packages. The
easiest seems to be installing the same element from both JSPM **and** bower. This way, albeit cumbersome when updating,
will ensure that all necessary dependencies are pulled as well. To install the sample element one would eun the two 
commands

``` bash
bower i tpluscode/md-ed --save
jspm i github:tpluscode/md-ed
```

Typically there would be single application module, like app.js, which references all it's dependencies. For our jspm
component the import would be a simple

``` js
import 'tpluscode/md-ed`
```

At runtime, it will pull all necessary files from bower and jspm components. The main index.html file will then reference
the app.js script and uses SystemJS to load the add.

``` html
<!doctype html>
        <html>
<head>
    <script src="jspm_packages/system.js"></script>
    <script src="config.js"></script>
    <script src="bower_components/webcomponentsjs/webcomponents.min.js"></script>
</head>
<body>

<md-ed></md-ed>

<script>
    System.import('app');
</script>
</body>
</html>
```

## Conclusion

[elements]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
[polymer]: http://polymer-project.org
[es-naming]: http://benmccormick.org/2015/09/14/es5-es6-es2016-es-next-whats-going-on-with-javascript-versioning/
[PolymerTS]: https://github.com/nippur72/PolymerTS
[taming]: http://blog.charto.net/typescript/Taming-Polymer-with-SystemJS-and-TypeScript-part-1/
[el]: https://elements.polymer-project.org
[cust]: https://customelements.io
[vulcanize]: https://github.com/Polymer/vulcanize