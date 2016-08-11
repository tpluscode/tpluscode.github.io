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
jspm i html=github:Hypercubed/systemjs-plugin-html --dev
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

Now it's possible to import the library and use its functionality in the custom element.

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
don't import them in any of your source files. Read on to see why.


## Bundling for Bower

Instead of importing in your element directly, create a main html file in the root of your project. This will be the main
entrypoint for consumers to import. The common practice is to name the file same as the repository so you will see
`paper-input/paper-input.html` etc. I named my repository `md-ed` so I added an `md-ed.html` file with all the bower
dependencies.

``` html
<link rel="import" href="../paper-input/paper-textarea.html" />
<link rel="import" href="../paper-tabs/paper-tabs.html" />
<link rel="import" href="../iron-pages/iron-pages.html" />
<script src="../marked/lib/marked.js"></script>
```

It's important that the paths don't include `bower_components`. On the consumer side, the elements will already
live alongside other bower dependencies.

You will also want to add the file to you bower.json as `"main": "md-ed.html"`.

Finally, the code is almost ready to bundle. Bundling is done by running the JSPM CLI. It has a number of options. For
universal consumer I've found the `bundle-sfx` command works best, because it allows creating UMD or universal packages
which require neither any specific module loader nor JSPM/SystemJS. Elements bundled this way will be possible to consume
using bower just like any other element. 

I usually add the bundling command to NPM scripts

{% codeblock lang:js %}
{
  "scripts": {
    "build-bower": "jspm bundle-sfx src/md-ed - marked bower/build.js --format global --globals \"{'marked': 'marked'}\""
  }
}
{% endcodeblock %}

`src/md-ed - marked dist/build.js` means that the root `src/md-ed.ts` file will be bundled into `dist/build.js` but will
not include the marked library.

`--format global` creates a bundle without any module loaders.

Finally, the `--globals "{'marked': 'marked'}"` switch is required for some excluded modules when bundling. It tells
JSPM what global variable to assume for the given dependencies.

I'm intentionally not minifying the contents. The consumer will do so when bundling his or her actual application.

Now, bindling will create a `bower/build.js` with transpiled and bundled scripts and `bower/build.html` with
[vulcanized][vulcanize] files. Interestingly, the html must exist beforehand, which looks like a bug in the SystemJS html
plugin. Simply create one before running the bundle command

``` bash
mkdir dist
touch build.html
npm run build-bower
```

The last step is add the bundled files to the main html. Here's how it looks for me:

``` html
<link rel="import" href="../paper-input/paper-textarea.html" />
<link rel="import" href="../paper-tabs/paper-tabs.html" />
<link rel="import" href="../iron-pages/iron-pages.html" />
<link rel="import" href="bower/build.html" />
<script>
    var System = System || {};
    System.register = System.register || function(){};
</script>
<script src="../marked/lib/marked.js"></script>
<script src="bower/build.js"></script>
```

There is some additional boilerplate here. The first script is a remedy for another shortcoming of the systemjs-plugin-html.
It doesn't play nice with the `bundle-sfx` command and leaves some references to System which won't work when simply
referencing the bundled js file.

Oh, and don't exclude the dist folder from git. You'll want to push the bundled files with everything else.

### For JSPM

## Conclusion

[elements]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
[polymer]: http://polymer-project.org
[es-naming]: http://benmccormick.org/2015/09/14/es5-es6-es2016-es-next-whats-going-on-with-javascript-versioning/
[PolymerTS]: https://github.com/nippur72/PolymerTS
[taming]: http://blog.charto.net/typescript/Taming-Polymer-with-SystemJS-and-TypeScript-part-1/
[el]: https://elements.polymer-project.org
[cust]: https://customelements.io
[vulcanize]: https://github.com/Polymer/vulcanize