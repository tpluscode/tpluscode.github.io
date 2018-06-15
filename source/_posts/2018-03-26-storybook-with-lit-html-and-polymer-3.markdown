---
layout: post
published: true
title: How to set up storybook to play nice with lit-html-based element
date: 2018-03-26 21:15
categories:
- lit-html
- javascript
description: Setting up storybook to run with my custom elements using lit-html and Polymer 3
keywords: storybook, polymer 3, web components
comments: true
---

I'd like to share a few tips which might help you set up [@storybook/polymer][sb] with a JS-only elements. The
core issue was importing a base mixin class from Polymer 3, which causes the default babel configuration to 
transpile into an unusable bundle.

<!--more-->

## Background

In [my code][lit-any] I have a base class which uses Polymer's `PropertiesChanged` mixin to offload handling attributes
and properties:

{% codeblock lang:js %}
import { PropertiesChanged } from '@polymer/polymer/lib/mixins/properties-changed';

export default class LitAnyBase extends PropertiesChanged(HTMLElement) {

  /* rest of my code */

}
{% endcodeblock %}

There is not build step and the code works great when bundled using webpack in an actual web application.

## The issue with storybook

Unfortunately this does not work of out the box with Storybook for Web Components (maybe it will be renamed
after all). By design the storybook generates a shell `index.html` which loads web components polyfill and 
`custom-elements-es5-adapter.js`. The latter requires that all **ES6 be transpiled into ES5**. Otherwise any of
the code would not work in older browsers which do not support classes. 

The thing is though that it's an all or nothing approach. Without the adapter all code must be ES6, as per
[custom elements v1][v1] spec. With the adapter on other hand it is not possible to mix the two approaches. So what
happens when Storybook generates its bundle? My code gets transpiled as expected:

{% codeblock lang:js %}
var LitAnyBase = function (_PropertiesChanged) {
  _inherits(LitAnyBase, _PropertiesChanged);

  function LitAnyBase() {
    _classCallCheck(this, LitAnyBase);
    
      var _this = _possibleConstructorReturn(this, (LitAnyBase.__proto__ || Object.getPrototypeOf(LitAnyBase)).call(this));

      return _this;
  }
    
  /* the ugly ES5 continues here */
}
{% endcodeblock %}

`_PropertiesChanged` however would still be as ES6 class _(because it comes from `node_modules`?)_ even though
they both end up in the very same bundle. The effect is a sight many web component developers probably witnessed:

> TypeError: Class constructor PropertiesChanged cannot be invoked without 'new' 

## Solution

It had taken me a few hours of futile experiments with various webpack and babel configs until my colleague 
[Kamil][riscent] helped me out. Turns out all it took was a minimal babel setup. 

### Initial setup 

First things first, here are the steps I used to set up Storybook in my repository, similar to the
[Slow start guide](https://storybook.js.org/basics/slow-start-guide/)

1. `yarn add -D @storybook/polymer`
1. Create the NPM script
1. Create my [config]() and a first [story]()

When started, nothing will show and the error mentioned above will be reported in the console.

### Steps to fix

Turns out the fix is not so difficult but also not obvious for a weekend JS dev :joy:.
One, it's necessary to install babel presets:

```
yarn add -D babel-preset-react babel-preset-env babel-preset-es2015 babel-preset-stage-0
```
 
Next create `.babelrc` as follows. It is interesting that `es2015` in not required to be called out
explicitly but it has to be installed as a dependency nonetheless.

```json
{
  "presets": ["react", "env", "stage-0"]
}
```

Then also `yarn add -D babel-plugin-transform-decorators-legacy`.

Finally the simplest webpack config must be added next to storybooks config file.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      }
    ]
  }
};
```

It will cause all of `node_modules` to be loaded by babel which can take significantly more to build, but
hey, at least now my storybook works! :sparkles:

## Update for Storybook 4

I recently updated to Storybook `4.0.alpha.9`. It seems to be working fine despite some benign errors showing 
in the console. It didn't "just work" though. Right after upgrade I was running into similar issues with bundling.
To fix that the `babel-loader` needs a minor tweak:

```diff
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
+       exclude: /node_modules\/@webcomponents/
      }
    ]
```

[sb]: https://www.npmjs.com/package/@storybook/polymer
[lit-any]: https://github.com/wikibus/lit-any
[riscent]: https://twitter.com/riscent
[v1]: https://developers.google.com/web/fundamentals/web-components/customelements#define
