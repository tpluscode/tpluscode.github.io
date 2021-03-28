/*! For license information please see 49e2c5097b39d9d96143.js.LICENSE.txt */
(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{117:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.NamedNode=void 0;e.NamedNode=class{constructor(t){this.termType="NamedNode",this.value=t}equals(t){return!!t&&"NamedNode"===t.termType&&t.value===this.value}}},214:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.BlankNode=void 0;e.BlankNode=class{constructor(t){this.termType="BlankNode",this.value=t}equals(t){return!!t&&"BlankNode"===t.termType&&t.value===this.value}}},215:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.DefaultGraph=void 0;class a{constructor(){this.termType="DefaultGraph",this.value=""}equals(t){return!!t&&"DefaultGraph"===t.termType}}e.DefaultGraph=a,a.INSTANCE=new a},216:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.Literal=void 0;const a=i(117);class s{constructor(t,e){this.termType="Literal",this.value=t,"string"==typeof e?(this.language=e,this.datatype=s.RDF_LANGUAGE_STRING):e?(this.language="",this.datatype=e):(this.language="",this.datatype=s.XSD_STRING)}equals(t){return!!t&&"Literal"===t.termType&&t.value===this.value&&t.language===this.language&&t.datatype.equals(this.datatype)}}e.Literal=s,s.RDF_LANGUAGE_STRING=new a.NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"),s.XSD_STRING=new a.NamedNode("http://www.w3.org/2001/XMLSchema#string")},217:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.Quad=void 0;e.Quad=class{constructor(t,e,i,a){this.termType="Quad",this.value="",this.subject=t,this.predicate=e,this.object=i,this.graph=a}equals(t){return!!t&&("Quad"===t.termType||!t.termType)&&this.subject.equals(t.subject)&&this.predicate.equals(t.predicate)&&this.object.equals(t.object)&&this.graph.equals(t.graph)}}},218:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.Variable=void 0;e.Variable=class{constructor(t){this.termType="Variable",this.value=t}equals(t){return!!t&&"Variable"===t.termType&&t.value===this.value}}},361:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});const a=i(362),s=i(364),r=i(115),n=i(367),o=i(368);class c extends r.Transform{constructor(t){super({readableObjectMode:!0}),this.activeTagStack=[],this.nodeIds={},t&&(Object.assign(this,t),this.options=t),this.dataFactory||(this.dataFactory=new o.DataFactory),this.baseIRI||(this.baseIRI=""),this.defaultGraph||(this.defaultGraph=this.dataFactory.defaultGraph()),this.saxStream=s.createStream(this.strict,{xmlns:!1,position:this.trackPosition}),this.strict||(this.saxStream._parser.looseCase="toString"),this.attachSaxListeners()}static parseNamespace(t,e){const i={};let a=!1;for(const e in t.attributes)e.startsWith("xmlns")&&(5===e.length?(a=!0,i[""]=t.attributes[e]):":"===e.charAt(5)&&(a=!0,i[e.substr(6)]=t.attributes[e]));const s=e&&e.ns?e.ns:[c.DEFAULT_NS];return a?s.concat([i]):s}static expandPrefixedTerm(t,e,i){const a=t.indexOf(":");let s,r;a>=0?(s=t.substr(0,a),r=t.substr(a+1)):(s="",r=t);let o=null,c=null;for(let t=e.length-1;t>=0;t--){const i=e[t][s];if(i){o=i;break}c||(c=e[t][""])}if(!o){if(s&&"xmlns"!==s)throw new n.ParseError(i,`The prefix '${s}' in term '${t}' was not bound.`);o=c||""}return{prefix:s,local:r,uri:o}}static isValidIri(t){return c.IRI_REGEX.test(t)}import(t){const e=new r.PassThrough({readableObjectMode:!0});t.on("error",t=>i.emit("error",t)),t.on("data",t=>e.push(t)),t.on("end",()=>e.push(null));const i=e.pipe(new c(this.options));return i}_transform(t,e,i){try{this.saxStream.write(t,e)}catch(t){return i(t)}i()}newParseError(t){return new n.ParseError(this,t)}valueToUri(t,e){return this.uriToNamedNode(a.resolve(t,e.baseIRI))}uriToNamedNode(t){if(!c.isValidIri(t))throw this.newParseError("Invalid URI: "+t);return this.dataFactory.namedNode(t)}validateNcname(t){if(!c.NCNAME_MATCHER.test(t))throw this.newParseError("Not a valid NCName: "+t)}attachSaxListeners(){this.saxStream.on("error",t=>this.emit("error",t)),this.saxStream.on("opentag",this.onTag.bind(this)),this.saxStream.on("text",this.onText.bind(this)),this.saxStream.on("closetag",this.onCloseTag.bind(this)),this.saxStream.on("doctype",this.onDoctype.bind(this))}onTag(t){const e=this.activeTagStack.length?this.activeTagStack[this.activeTagStack.length-1]:null;let i=u.RESOURCE;if(e&&(e.hadChildren=!0,i=e.childrenParseType),e&&e.childrenStringTags){const i=t.name;let a="";for(const e in t.attributes)a+=` ${e}="${t.attributes[e]}"`;const s=`<${`${i}${a}`}>`;e.childrenStringTags.push(s);const r={childrenStringTags:e.childrenStringTags};return r.childrenStringEmitClosingTag=`</${i}>`,void this.activeTagStack.push(r)}const a={};e?(a.language=e.language,a.baseIRI=e.baseIRI):a.baseIRI=this.baseIRI,this.activeTagStack.push(a),a.ns=c.parseNamespace(t,e),i===u.RESOURCE?this.onTagResource(t,a,e,!e):this.onTagProperty(t,a,e)}onTagResource(t,e,i,s){const r=c.expandPrefixedTerm(t.name,e.ns,this);e.childrenParseType=u.PROPERTY;let n=!0;if(r.uri===c.RDF){if(!s&&c.FORBIDDEN_NODE_ELEMENTS.indexOf(r.local)>=0)throw this.newParseError("Illegal node element name: "+r.local);switch(r.local){case"RDF":e.childrenParseType=u.RESOURCE;case"Description":n=!1}}const o=[],h=[];let l=null,d=!1,p=!1,T=null;for(const s in t.attributes){const r=t.attributes[s],n=c.expandPrefixedTerm(s,e.ns,this);if(i&&n.uri===c.RDF)switch(n.local){case"about":if(l)throw this.newParseError(`Only one of rdf:about, rdf:nodeID and rdf:ID can be present, while ${r} and ${l} where found.`);l=r;continue;case"ID":if(l)throw this.newParseError(`Only one of rdf:about, rdf:nodeID and rdf:ID can be present, while ${r} and ${l} where found.`);this.validateNcname(r),l="#"+r,d=!0;continue;case"nodeID":if(l)throw this.newParseError(`Only one of rdf:about, rdf:nodeID and rdf:ID can be present, while ${r} and ${l} where found.`);this.validateNcname(r),l=r,p=!0;continue;case"bagID":throw this.newParseError("rdf:bagID is not supported.");case"type":T=r;continue;case"aboutEach":throw this.newParseError("rdf:aboutEach is not supported.");case"aboutEachPrefix":throw this.newParseError("rdf:aboutEachPrefix is not supported.");case"li":throw this.newParseError("rdf:li on node elements are not supported.")}else if(n.uri===c.XML){if("lang"===n.local){e.language=""===r?null:r.toLowerCase();continue}if("base"===n.local){e.baseIRI=a.resolve(r,e.baseIRI);continue}}"xml"!==n.prefix&&n.uri&&(o.push(this.uriToNamedNode(n.uri+n.local)),h.push(r))}if(null!==l&&(e.subject=p?this.dataFactory.blankNode(l):this.valueToUri(l,e),d&&this.claimNodeId(e.subject)),e.subject||(e.subject=this.dataFactory.blankNode()),n){const t=this.uriToNamedNode(r.uri+r.local);this.emitTriple(e.subject,this.dataFactory.namedNode(c.RDF+"type"),t,i?i.reifiedStatementId:null)}if(i){if(i.predicate)if(i.childrenCollectionSubject){const t=this.dataFactory.blankNode();this.emitTriple(i.childrenCollectionSubject,i.childrenCollectionPredicate,t,i.reifiedStatementId),this.emitTriple(t,this.dataFactory.namedNode(c.RDF+"first"),e.subject,e.reifiedStatementId),i.childrenCollectionSubject=t,i.childrenCollectionPredicate=this.dataFactory.namedNode(c.RDF+"rest")}else{this.emitTriple(i.subject,i.predicate,e.subject,i.reifiedStatementId);for(let t=0;t<i.predicateSubPredicates.length;t++)this.emitTriple(e.subject,i.predicateSubPredicates[t],i.predicateSubObjects[t],null);i.predicateSubPredicates=[],i.predicateSubObjects=[],i.predicateEmitted=!0}for(let t=0;t<o.length;t++){const a=this.dataFactory.literal(h[t],e.datatype||e.language);this.emitTriple(e.subject,o[t],a,i.reifiedStatementId)}T&&this.emitTriple(e.subject,this.dataFactory.namedNode(c.RDF+"type"),this.uriToNamedNode(T),null)}}onTagProperty(t,e,i){const a=c.expandPrefixedTerm(t.name,e.ns,this);if(e.childrenParseType=u.RESOURCE,e.subject=i.subject,a.uri===c.RDF&&"li"===a.local?(i.listItemCounter||(i.listItemCounter=1),e.predicate=this.uriToNamedNode(a.uri+"_"+i.listItemCounter++)):e.predicate=this.uriToNamedNode(a.uri+a.local),a.uri===c.RDF&&c.FORBIDDEN_PROPERTY_ELEMENTS.indexOf(a.local)>=0)throw this.newParseError("Illegal property element name: "+a.local);e.predicateSubPredicates=[],e.predicateSubObjects=[];let s=!1,r=!1,n=null,o=!0;const h=[],l=[];for(const i in t.attributes){const a=t.attributes[i],d=c.expandPrefixedTerm(i,e.ns,this);if(d.uri===c.RDF)switch(d.local){case"resource":if(n)throw this.newParseError(`Found both rdf:resource (${a}) and rdf:nodeID (${n}).`);if(s)throw this.newParseError(`rdf:parseType is not allowed on property elements with rdf:resource (${a})`);e.hadChildren=!0,n=a,o=!1;continue;case"datatype":if(r)throw this.newParseError(`Found both non-rdf:* property attributes and rdf:datatype (${a}).`);if(s)throw this.newParseError(`rdf:parseType is not allowed on property elements with rdf:datatype (${a})`);e.datatype=this.valueToUri(a,e);continue;case"nodeID":if(r)throw this.newParseError(`Found both non-rdf:* property attributes and rdf:nodeID (${a}).`);if(e.hadChildren)throw this.newParseError(`Found both rdf:resource and rdf:nodeID (${a}).`);if(s)throw this.newParseError(`rdf:parseType is not allowed on property elements with rdf:nodeID (${a})`);this.validateNcname(a),e.hadChildren=!0,n=a,o=!0;continue;case"bagID":throw this.newParseError("rdf:bagID is not supported.");case"parseType":if(r)throw this.newParseError("rdf:parseType is not allowed when non-rdf:* property attributes are present");if(e.datatype)throw this.newParseError(`rdf:parseType is not allowed on property elements with rdf:datatype (${e.datatype.value})`);if(n)throw this.newParseError(`rdf:parseType is not allowed on property elements with rdf:nodeID or rdf:resource (${n})`);if("Resource"===a){s=!0,e.childrenParseType=u.PROPERTY;const t=this.dataFactory.blankNode();this.emitTriple(e.subject,e.predicate,t,e.reifiedStatementId),e.subject=t,e.predicate=null}else"Collection"===a?(s=!0,e.hadChildren=!0,e.childrenCollectionSubject=e.subject,e.childrenCollectionPredicate=e.predicate,o=!1):"Literal"===a&&(s=!0,e.childrenTagsToString=!0,e.childrenStringTags=[]);continue;case"ID":this.validateNcname(a),e.reifiedStatementId=this.valueToUri("#"+a,e),this.claimNodeId(e.reifiedStatementId);continue}else if(d.uri===c.XML&&"lang"===d.local){e.language=""===a?null:a.toLowerCase();continue}if("xml"!==d.prefix&&"xmlns"!==d.prefix&&d.uri){if(s||e.datatype)throw this.newParseError("Found illegal rdf:* properties on property element with attribute: "+a);e.hadChildren=!0,r=!0,h.push(this.uriToNamedNode(d.uri+d.local)),l.push(this.dataFactory.literal(a,e.datatype||e.language))}}if(null!==n){const t=e.subject;e.subject=o?this.dataFactory.blankNode(n):this.valueToUri(n,e),this.emitTriple(t,e.predicate,e.subject,e.reifiedStatementId);for(let t=0;t<h.length;t++)this.emitTriple(e.subject,h[t],l[t],null);e.predicateEmitted=!0}else o&&(e.predicateSubPredicates=h,e.predicateSubObjects=l,e.predicateEmitted=!1)}emitTriple(t,e,i,a){this.push(this.dataFactory.quad(t,e,i,this.defaultGraph)),a&&(this.push(this.dataFactory.quad(a,this.dataFactory.namedNode(c.RDF+"type"),this.dataFactory.namedNode(c.RDF+"Statement"),this.defaultGraph)),this.push(this.dataFactory.quad(a,this.dataFactory.namedNode(c.RDF+"subject"),t,this.defaultGraph)),this.push(this.dataFactory.quad(a,this.dataFactory.namedNode(c.RDF+"predicate"),e,this.defaultGraph)),this.push(this.dataFactory.quad(a,this.dataFactory.namedNode(c.RDF+"object"),i,this.defaultGraph)))}claimNodeId(t){if(!this.allowDuplicateRdfIds){if(this.nodeIds[t.value])throw this.newParseError(`Found multiple occurrences of rdf:ID='${t.value}'.`);this.nodeIds[t.value]=!0}}onText(t){const e=this.activeTagStack.length?this.activeTagStack[this.activeTagStack.length-1]:null;e&&(e.childrenStringTags?e.childrenStringTags.push(t):e.predicate&&(e.text=t))}onCloseTag(){const t=this.activeTagStack.pop();if(t.childrenStringEmitClosingTag&&t.childrenStringTags.push(t.childrenStringEmitClosingTag),t.childrenTagsToString&&(t.datatype=this.dataFactory.namedNode(c.RDF+"XMLLiteral"),t.text=t.childrenStringTags.join(""),t.hadChildren=!1),t.childrenCollectionSubject)this.emitTriple(t.childrenCollectionSubject,t.childrenCollectionPredicate,this.dataFactory.namedNode(c.RDF+"nil"),t.reifiedStatementId);else if(t.predicate)if(t.hadChildren||t.childrenParseType===u.PROPERTY){if(!t.predicateEmitted){const e=this.dataFactory.blankNode();this.emitTriple(t.subject,t.predicate,e,t.reifiedStatementId);for(let i=0;i<t.predicateSubPredicates.length;i++)this.emitTriple(e,t.predicateSubPredicates[i],t.predicateSubObjects[i],null)}}else this.emitTriple(t.subject,t.predicate,this.dataFactory.literal(t.text||"",t.datatype||t.language),t.reifiedStatementId)}onDoctype(t){t.replace(/<!ENTITY\s+([^\s]+)\s+["']([^"']+)["']\s*>/g,(t,e,i)=>(this.saxStream._parser.ENTITIES[e]=i,""))}}var u;e.RdfXmlParser=c,c.IRI_REGEX=/^([A-Za-z][A-Za-z0-9+-.]*):[^ "<>{}|\\\[\]`]*$/,c.MIME_TYPE="application/rdf+xml",c.RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#",c.XML="http://www.w3.org/XML/1998/namespace",c.XMLNS="http://www.w3.org/2000/xmlns/",c.DEFAULT_NS={xml:c.XML},c.FORBIDDEN_NODE_ELEMENTS=["RDF","ID","about","bagID","parseType","resource","nodeID","li","aboutEach","aboutEachPrefix"],c.FORBIDDEN_PROPERTY_ELEMENTS=["Description","RDF","ID","about","bagID","parseType","resource","nodeID","aboutEach","aboutEachPrefix"],c.NCNAME_MATCHER=/^([A-Za-z\xC0-\xD6\xD8-\xF6\u{F8}-\u{2FF}\u{370}-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}\u{10000}-\u{EFFFF}_])([A-Za-z\xC0-\xD6\xD8-\xF6\u{F8}-\u{2FF}\u{370}-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}\u{10000}-\u{EFFFF}_\-.0-9#xB7\u{0300}-\u{036F}\u{203F}-\u{2040}])*$/u,function(t){t[t.RESOURCE=0]="RESOURCE",t[t.PROPERTY=1]="PROPERTY"}(u=e.ParseType||(e.ParseType={}))},362:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),function(t){for(var i in t)e.hasOwnProperty(i)||(e[i]=t[i])}(i(363))},363:function(t,e,i){"use strict";function a(t){const e=[];let i=0;for(;i<t.length;)switch(t[i]){case"/":if("."===t[i+1])if("."===t[i+2]){if(!r(t[i+3])){e.push([]),i++;break}e.pop(),t[i+3]||e.push([]),i+=3}else{if(!r(t[i+2])){e.push([]),i++;break}t[i+2]||e.push([]),i+=2}else e.push([]),i++;break;case"#":case"?":e.length||e.push([]),e[e.length-1].push(t.substr(i)),i=t.length;break;default:e.length||e.push([]),e[e.length-1].push(t[i]),i++}return"/"+e.map(t=>t.join("")).join("/")}function s(t,e){let i=e+1;e>=0?"/"===t[e+1]&&"/"===t[e+2]&&(i=e+3):"/"===t[0]&&"/"===t[1]&&(i=2);const s=t.indexOf("/",i);if(s<0)return t;return t.substr(0,s)+a(t.substr(s))}function r(t){return!t||"#"===t||"?"===t||"/"===t}Object.defineProperty(e,"__esModule",{value:!0}),e.resolve=function(t,e){const i=(e=e||"").indexOf("#");if(i>0&&(e=e.substr(0,i)),!t.length){if(e.indexOf(":")<0)throw new Error(`Found invalid baseIRI '${e}' for value '${t}'`);return e}if(t.startsWith("?")){const i=e.indexOf("?");return i>0&&(e=e.substr(0,i)),e+t}if(t.startsWith("#"))return e+t;if(!e.length){const e=t.indexOf(":");if(e<0)throw new Error(`Found invalid relative IRI '${t}' for a missing baseIRI`);return s(t,e)}const r=t.indexOf(":");if(r>=0)return s(t,r);const n=e.indexOf(":");if(n<0)throw new Error(`Found invalid baseIRI '${e}' for value '${t}'`);const o=e.substr(0,n+1);if(0===t.indexOf("//"))return o+s(t,r);let c;if(e.indexOf("//",n)===n+1){if(c=e.indexOf("/",n+3),c<0)return e.length>n+3?e+"/"+s(t,r):o+s(t,r)}else if(c=e.indexOf("/",n+1),c<0)return o+s(t,r);if(0===t.indexOf("/"))return e.substr(0,c)+a(t);let u=e.substr(c);const h=u.lastIndexOf("/");return h>=0&&h<u.length-1&&(u=u.substr(0,h+1),"."===t[0]&&"."!==t[1]&&"/"!==t[1]&&t[2]&&(t=t.substr(1))),t=a(t=u+t),e.substr(0,c)+t},e.removeDotSegments=a,e.removeDotSegmentsOfPath=s},364:function(t,e,i){(function(t){!function(e){e.parser=function(t,e){return new r(t,e)},e.SAXParser=r,e.SAXStream=o,e.createStream=function(t,e){return new o(t,e)},e.MAX_BUFFER_LENGTH=65536;var a,s=["comment","sgmlDecl","textNode","tagName","doctype","procInstName","procInstBody","entity","attribName","attribValue","cdata","script"];function r(t,i){if(!(this instanceof r))return new r(t,i);!function(t){for(var e=0,i=s.length;e<i;e++)t[s[e]]=""}(this),this.q=this.c="",this.bufferCheckPosition=e.MAX_BUFFER_LENGTH,this.opt=i||{},this.opt.lowercase=this.opt.lowercase||this.opt.lowercasetags,this.looseCase=this.opt.lowercase?"toLowerCase":"toUpperCase",this.tags=[],this.closed=this.closedRoot=this.sawRoot=!1,this.tag=this.error=null,this.strict=!!t,this.noscript=!(!t&&!this.opt.noscript),this.state=_.BEGIN,this.strictEntities=this.opt.strictEntities,this.ENTITIES=this.strictEntities?Object.create(e.XML_ENTITIES):Object.create(e.ENTITIES),this.attribList=[],this.opt.xmlns&&(this.ns=Object.create(u)),this.trackPosition=!1!==this.opt.position,this.trackPosition&&(this.position=this.line=this.column=0),F(this,"onready")}e.EVENTS=["text","processinginstruction","sgmldeclaration","doctype","comment","opentagstart","attribute","opentag","closetag","opencdata","cdata","closecdata","error","end","ready","script","opennamespace","closenamespace"],Object.create||(Object.create=function(t){function e(){}return e.prototype=t,new e}),Object.keys||(Object.keys=function(t){var e=[];for(var i in t)t.hasOwnProperty(i)&&e.push(i);return e}),r.prototype={end:function(){C(this)},write:function(t){if(this.error)throw this.error;if(this.closed)return A(this,"Cannot write after close. Assign an onready handler.");if(null===t)return C(this);"object"==typeof t&&(t=t.toString());var i=0,a="";for(;a=U(t,i++),this.c=a,a;)switch(this.trackPosition&&(this.position++,"\n"===a?(this.line++,this.column=0):this.column++),this.state){case _.BEGIN:if(this.state=_.BEGIN_WHITESPACE,"\ufeff"===a)continue;M(this,a);continue;case _.BEGIN_WHITESPACE:M(this,a);continue;case _.TEXT:if(this.sawRoot&&!this.closedRoot){for(var r=i-1;a&&"<"!==a&&"&"!==a;)(a=U(t,i++))&&this.trackPosition&&(this.position++,"\n"===a?(this.line++,this.column=0):this.column++);this.textNode+=t.substring(r,i-1)}"<"!==a||this.sawRoot&&this.closedRoot&&!this.strict?(T(a)||this.sawRoot&&!this.closedRoot||O(this,"Text data outside of root node."),"&"===a?this.state=_.TEXT_ENTITY:this.textNode+=a):(this.state=_.OPEN_WAKA,this.startTagPosition=this.position);continue;case _.SCRIPT:"<"===a?this.state=_.SCRIPT_ENDING:this.script+=a;continue;case _.SCRIPT_ENDING:"/"===a?this.state=_.CLOSE_TAG:(this.script+="<"+a,this.state=_.SCRIPT);continue;case _.OPEN_WAKA:if("!"===a)this.state=_.SGML_DECL,this.sgmlDecl="";else if(T(a));else if(E(h,a))this.state=_.OPEN_TAG,this.tagName=a;else if("/"===a)this.state=_.CLOSE_TAG,this.tagName="";else if("?"===a)this.state=_.PROC_INST,this.procInstName=this.procInstBody="";else{if(O(this,"Unencoded <"),this.startTagPosition+1<this.position){var n=this.position-this.startTagPosition;a=new Array(n).join(" ")+a}this.textNode+="<"+a,this.state=_.TEXT}continue;case _.SGML_DECL:"[CDATA["===(this.sgmlDecl+a).toUpperCase()?(y(this,"onopencdata"),this.state=_.CDATA,this.sgmlDecl="",this.cdata=""):this.sgmlDecl+a==="--"?(this.state=_.COMMENT,this.comment="",this.sgmlDecl=""):"DOCTYPE"===(this.sgmlDecl+a).toUpperCase()?(this.state=_.DOCTYPE,(this.doctype||this.sawRoot)&&O(this,"Inappropriately located doctype declaration"),this.doctype="",this.sgmlDecl=""):">"===a?(y(this,"onsgmldeclaration",this.sgmlDecl),this.sgmlDecl="",this.state=_.TEXT):f(a)?(this.state=_.SGML_DECL_QUOTED,this.sgmlDecl+=a):this.sgmlDecl+=a;continue;case _.SGML_DECL_QUOTED:a===this.q&&(this.state=_.SGML_DECL,this.q=""),this.sgmlDecl+=a;continue;case _.DOCTYPE:">"===a?(this.state=_.TEXT,y(this,"ondoctype",this.doctype),this.doctype=!0):(this.doctype+=a,"["===a?this.state=_.DOCTYPE_DTD:f(a)&&(this.state=_.DOCTYPE_QUOTED,this.q=a));continue;case _.DOCTYPE_QUOTED:this.doctype+=a,a===this.q&&(this.q="",this.state=_.DOCTYPE);continue;case _.DOCTYPE_DTD:this.doctype+=a,"]"===a?this.state=_.DOCTYPE:f(a)&&(this.state=_.DOCTYPE_DTD_QUOTED,this.q=a);continue;case _.DOCTYPE_DTD_QUOTED:this.doctype+=a,a===this.q&&(this.state=_.DOCTYPE_DTD,this.q="");continue;case _.COMMENT:"-"===a?this.state=_.COMMENT_ENDING:this.comment+=a;continue;case _.COMMENT_ENDING:"-"===a?(this.state=_.COMMENT_ENDED,this.comment=S(this.opt,this.comment),this.comment&&y(this,"oncomment",this.comment),this.comment=""):(this.comment+="-"+a,this.state=_.COMMENT);continue;case _.COMMENT_ENDED:">"!==a?(O(this,"Malformed comment"),this.comment+="--"+a,this.state=_.COMMENT):this.state=_.TEXT;continue;case _.CDATA:"]"===a?this.state=_.CDATA_ENDING:this.cdata+=a;continue;case _.CDATA_ENDING:"]"===a?this.state=_.CDATA_ENDING_2:(this.cdata+="]"+a,this.state=_.CDATA);continue;case _.CDATA_ENDING_2:">"===a?(this.cdata&&y(this,"oncdata",this.cdata),y(this,"onclosecdata"),this.cdata="",this.state=_.TEXT):"]"===a?this.cdata+="]":(this.cdata+="]]"+a,this.state=_.CDATA);continue;case _.PROC_INST:"?"===a?this.state=_.PROC_INST_ENDING:T(a)?this.state=_.PROC_INST_BODY:this.procInstName+=a;continue;case _.PROC_INST_BODY:if(!this.procInstBody&&T(a))continue;"?"===a?this.state=_.PROC_INST_ENDING:this.procInstBody+=a;continue;case _.PROC_INST_ENDING:">"===a?(y(this,"onprocessinginstruction",{name:this.procInstName,body:this.procInstBody}),this.procInstName=this.procInstBody="",this.state=_.TEXT):(this.procInstBody+="?"+a,this.state=_.PROC_INST_BODY);continue;case _.OPEN_TAG:E(l,a)?this.tagName+=a:(P(this),">"===a?x(this):"/"===a?this.state=_.OPEN_TAG_SLASH:(T(a)||O(this,"Invalid character in tag name"),this.state=_.ATTRIB));continue;case _.OPEN_TAG_SLASH:">"===a?(x(this,!0),L(this)):(O(this,"Forward-slash in opening tag not followed by >"),this.state=_.ATTRIB);continue;case _.ATTRIB:if(T(a))continue;">"===a?x(this):"/"===a?this.state=_.OPEN_TAG_SLASH:E(h,a)?(this.attribName=a,this.attribValue="",this.state=_.ATTRIB_NAME):O(this,"Invalid attribute name");continue;case _.ATTRIB_NAME:"="===a?this.state=_.ATTRIB_VALUE:">"===a?(O(this,"Attribute without value"),this.attribValue=this.attribName,R(this),x(this)):T(a)?this.state=_.ATTRIB_NAME_SAW_WHITE:E(l,a)?this.attribName+=a:O(this,"Invalid attribute name");continue;case _.ATTRIB_NAME_SAW_WHITE:if("="===a)this.state=_.ATTRIB_VALUE;else{if(T(a))continue;O(this,"Attribute without value"),this.tag.attributes[this.attribName]="",this.attribValue="",y(this,"onattribute",{name:this.attribName,value:""}),this.attribName="",">"===a?x(this):E(h,a)?(this.attribName=a,this.state=_.ATTRIB_NAME):(O(this,"Invalid attribute name"),this.state=_.ATTRIB)}continue;case _.ATTRIB_VALUE:if(T(a))continue;f(a)?(this.q=a,this.state=_.ATTRIB_VALUE_QUOTED):(O(this,"Unquoted attribute value"),this.state=_.ATTRIB_VALUE_UNQUOTED,this.attribValue=a);continue;case _.ATTRIB_VALUE_QUOTED:if(a!==this.q){"&"===a?this.state=_.ATTRIB_VALUE_ENTITY_Q:this.attribValue+=a;continue}R(this),this.q="",this.state=_.ATTRIB_VALUE_CLOSED;continue;case _.ATTRIB_VALUE_CLOSED:T(a)?this.state=_.ATTRIB:">"===a?x(this):"/"===a?this.state=_.OPEN_TAG_SLASH:E(h,a)?(O(this,"No whitespace between attributes"),this.attribName=a,this.attribValue="",this.state=_.ATTRIB_NAME):O(this,"Invalid attribute name");continue;case _.ATTRIB_VALUE_UNQUOTED:if(!m(a)){"&"===a?this.state=_.ATTRIB_VALUE_ENTITY_U:this.attribValue+=a;continue}R(this),">"===a?x(this):this.state=_.ATTRIB;continue;case _.CLOSE_TAG:if(this.tagName)">"===a?L(this):E(l,a)?this.tagName+=a:this.script?(this.script+="</"+this.tagName,this.tagName="",this.state=_.SCRIPT):(T(a)||O(this,"Invalid tagname in closing tag"),this.state=_.CLOSE_TAG_SAW_WHITE);else{if(T(a))continue;g(h,a)?this.script?(this.script+="</"+a,this.state=_.SCRIPT):O(this,"Invalid tagname in closing tag."):this.tagName=a}continue;case _.CLOSE_TAG_SAW_WHITE:if(T(a))continue;">"===a?L(this):O(this,"Invalid characters in closing tag");continue;case _.TEXT_ENTITY:case _.ATTRIB_VALUE_ENTITY_Q:case _.ATTRIB_VALUE_ENTITY_U:var o,c;switch(this.state){case _.TEXT_ENTITY:o=_.TEXT,c="textNode";break;case _.ATTRIB_VALUE_ENTITY_Q:o=_.ATTRIB_VALUE_QUOTED,c="attribValue";break;case _.ATTRIB_VALUE_ENTITY_U:o=_.ATTRIB_VALUE_UNQUOTED,c="attribValue"}";"===a?(this[c]+=j(this),this.entity="",this.state=o):E(this.entity.length?p:d,a)?this.entity+=a:(O(this,"Invalid character in entity name"),this[c]+="&"+this.entity+a,this.entity="",this.state=o);continue;default:throw new Error(this,"Unknown state: "+this.state)}this.position>=this.bufferCheckPosition&&function(t){for(var i=Math.max(e.MAX_BUFFER_LENGTH,10),a=0,r=0,n=s.length;r<n;r++){var o=t[s[r]].length;if(o>i)switch(s[r]){case"textNode":w(t);break;case"cdata":y(t,"oncdata",t.cdata),t.cdata="";break;case"script":y(t,"onscript",t.script),t.script="";break;default:A(t,"Max buffer length exceeded: "+s[r])}a=Math.max(a,o)}var c=e.MAX_BUFFER_LENGTH-a;t.bufferCheckPosition=c+t.position}(this);return this},resume:function(){return this.error=null,this},close:function(){return this.write(null)},flush:function(){var t;w(t=this),""!==t.cdata&&(y(t,"oncdata",t.cdata),t.cdata=""),""!==t.script&&(y(t,"onscript",t.script),t.script="")}};try{a=i(115).Stream}catch(t){a=function(){}}var n=e.EVENTS.filter((function(t){return"error"!==t&&"end"!==t}));function o(t,e){if(!(this instanceof o))return new o(t,e);a.apply(this),this._parser=new r(t,e),this.writable=!0,this.readable=!0;var i=this;this._parser.onend=function(){i.emit("end")},this._parser.onerror=function(t){i.emit("error",t),i._parser.error=null},this._decoder=null,n.forEach((function(t){Object.defineProperty(i,"on"+t,{get:function(){return i._parser["on"+t]},set:function(e){if(!e)return i.removeAllListeners(t),i._parser["on"+t]=e,e;i.on(t,e)},enumerable:!0,configurable:!1})}))}o.prototype=Object.create(a.prototype,{constructor:{value:o}}),o.prototype.write=function(e){if("function"==typeof t&&"function"==typeof t.isBuffer&&t.isBuffer(e)){if(!this._decoder){var a=i(7).StringDecoder;this._decoder=new a("utf8")}e=this._decoder.write(e)}return this._parser.write(e.toString()),this.emit("data",e),!0},o.prototype.end=function(t){return t&&t.length&&this.write(t),this._parser.end(),!0},o.prototype.on=function(t,e){var i=this;return i._parser["on"+t]||-1===n.indexOf(t)||(i._parser["on"+t]=function(){var e=1===arguments.length?[arguments[0]]:Array.apply(null,arguments);e.splice(0,0,t),i.emit.apply(i,e)}),a.prototype.on.call(i,t,e)};var c="http://www.w3.org/XML/1998/namespace",u={xml:c,xmlns:"http://www.w3.org/2000/xmlns/"},h=/[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,l=/[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/,d=/[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,p=/[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;function T(t){return" "===t||"\n"===t||"\r"===t||"\t"===t}function f(t){return'"'===t||"'"===t}function m(t){return">"===t||T(t)}function E(t,e){return t.test(e)}function g(t,e){return!E(t,e)}var N,b,I,_=0;for(var D in e.STATE={BEGIN:_++,BEGIN_WHITESPACE:_++,TEXT:_++,TEXT_ENTITY:_++,OPEN_WAKA:_++,SGML_DECL:_++,SGML_DECL_QUOTED:_++,DOCTYPE:_++,DOCTYPE_QUOTED:_++,DOCTYPE_DTD:_++,DOCTYPE_DTD_QUOTED:_++,COMMENT_STARTING:_++,COMMENT:_++,COMMENT_ENDING:_++,COMMENT_ENDED:_++,CDATA:_++,CDATA_ENDING:_++,CDATA_ENDING_2:_++,PROC_INST:_++,PROC_INST_BODY:_++,PROC_INST_ENDING:_++,OPEN_TAG:_++,OPEN_TAG_SLASH:_++,ATTRIB:_++,ATTRIB_NAME:_++,ATTRIB_NAME_SAW_WHITE:_++,ATTRIB_VALUE:_++,ATTRIB_VALUE_QUOTED:_++,ATTRIB_VALUE_CLOSED:_++,ATTRIB_VALUE_UNQUOTED:_++,ATTRIB_VALUE_ENTITY_Q:_++,ATTRIB_VALUE_ENTITY_U:_++,CLOSE_TAG:_++,CLOSE_TAG_SAW_WHITE:_++,SCRIPT:_++,SCRIPT_ENDING:_++},e.XML_ENTITIES={amp:"&",gt:">",lt:"<",quot:'"',apos:"'"},e.ENTITIES={amp:"&",gt:">",lt:"<",quot:'"',apos:"'",AElig:198,Aacute:193,Acirc:194,Agrave:192,Aring:197,Atilde:195,Auml:196,Ccedil:199,ETH:208,Eacute:201,Ecirc:202,Egrave:200,Euml:203,Iacute:205,Icirc:206,Igrave:204,Iuml:207,Ntilde:209,Oacute:211,Ocirc:212,Ograve:210,Oslash:216,Otilde:213,Ouml:214,THORN:222,Uacute:218,Ucirc:219,Ugrave:217,Uuml:220,Yacute:221,aacute:225,acirc:226,aelig:230,agrave:224,aring:229,atilde:227,auml:228,ccedil:231,eacute:233,ecirc:234,egrave:232,eth:240,euml:235,iacute:237,icirc:238,igrave:236,iuml:239,ntilde:241,oacute:243,ocirc:244,ograve:242,oslash:248,otilde:245,ouml:246,szlig:223,thorn:254,uacute:250,ucirc:251,ugrave:249,uuml:252,yacute:253,yuml:255,copy:169,reg:174,nbsp:160,iexcl:161,cent:162,pound:163,curren:164,yen:165,brvbar:166,sect:167,uml:168,ordf:170,laquo:171,not:172,shy:173,macr:175,deg:176,plusmn:177,sup1:185,sup2:178,sup3:179,acute:180,micro:181,para:182,middot:183,cedil:184,ordm:186,raquo:187,frac14:188,frac12:189,frac34:190,iquest:191,times:215,divide:247,OElig:338,oelig:339,Scaron:352,scaron:353,Yuml:376,fnof:402,circ:710,tilde:732,Alpha:913,Beta:914,Gamma:915,Delta:916,Epsilon:917,Zeta:918,Eta:919,Theta:920,Iota:921,Kappa:922,Lambda:923,Mu:924,Nu:925,Xi:926,Omicron:927,Pi:928,Rho:929,Sigma:931,Tau:932,Upsilon:933,Phi:934,Chi:935,Psi:936,Omega:937,alpha:945,beta:946,gamma:947,delta:948,epsilon:949,zeta:950,eta:951,theta:952,iota:953,kappa:954,lambda:955,mu:956,nu:957,xi:958,omicron:959,pi:960,rho:961,sigmaf:962,sigma:963,tau:964,upsilon:965,phi:966,chi:967,psi:968,omega:969,thetasym:977,upsih:978,piv:982,ensp:8194,emsp:8195,thinsp:8201,zwnj:8204,zwj:8205,lrm:8206,rlm:8207,ndash:8211,mdash:8212,lsquo:8216,rsquo:8217,sbquo:8218,ldquo:8220,rdquo:8221,bdquo:8222,dagger:8224,Dagger:8225,bull:8226,hellip:8230,permil:8240,prime:8242,Prime:8243,lsaquo:8249,rsaquo:8250,oline:8254,frasl:8260,euro:8364,image:8465,weierp:8472,real:8476,trade:8482,alefsym:8501,larr:8592,uarr:8593,rarr:8594,darr:8595,harr:8596,crarr:8629,lArr:8656,uArr:8657,rArr:8658,dArr:8659,hArr:8660,forall:8704,part:8706,exist:8707,empty:8709,nabla:8711,isin:8712,notin:8713,ni:8715,prod:8719,sum:8721,minus:8722,lowast:8727,radic:8730,prop:8733,infin:8734,ang:8736,and:8743,or:8744,cap:8745,cup:8746,int:8747,there4:8756,sim:8764,cong:8773,asymp:8776,ne:8800,equiv:8801,le:8804,ge:8805,sub:8834,sup:8835,nsub:8836,sube:8838,supe:8839,oplus:8853,otimes:8855,perp:8869,sdot:8901,lceil:8968,rceil:8969,lfloor:8970,rfloor:8971,lang:9001,rang:9002,loz:9674,spades:9824,clubs:9827,hearts:9829,diams:9830},Object.keys(e.ENTITIES).forEach((function(t){var i=e.ENTITIES[t],a="number"==typeof i?String.fromCharCode(i):i;e.ENTITIES[t]=a})),e.STATE)e.STATE[e.STATE[D]]=D;function F(t,e,i){t[e]&&t[e](i)}function y(t,e,i){t.textNode&&w(t),F(t,e,i)}function w(t){t.textNode=S(t.opt,t.textNode),t.textNode&&F(t,"ontext",t.textNode),t.textNode=""}function S(t,e){return t.trim&&(e=e.trim()),t.normalize&&(e=e.replace(/\s+/g," ")),e}function A(t,e){return w(t),t.trackPosition&&(e+="\nLine: "+t.line+"\nColumn: "+t.column+"\nChar: "+t.c),e=new Error(e),t.error=e,F(t,"onerror",e),t}function C(t){return t.sawRoot&&!t.closedRoot&&O(t,"Unclosed root tag"),t.state!==_.BEGIN&&t.state!==_.BEGIN_WHITESPACE&&t.state!==_.TEXT&&A(t,"Unexpected end"),w(t),t.c="",t.closed=!0,F(t,"onend"),r.call(t,t.strict,t.opt),t}function O(t,e){if("object"!=typeof t||!(t instanceof r))throw new Error("bad call to strictFail");t.strict&&A(t,e)}function P(t){t.strict||(t.tagName=t.tagName[t.looseCase]());var e=t.tags[t.tags.length-1]||t,i=t.tag={name:t.tagName,attributes:{}};t.opt.xmlns&&(i.ns=e.ns),t.attribList.length=0,y(t,"onopentagstart",i)}function v(t,e){var i=t.indexOf(":")<0?["",t]:t.split(":"),a=i[0],s=i[1];return e&&"xmlns"===t&&(a="xmlns",s=""),{prefix:a,local:s}}function R(t){if(t.strict||(t.attribName=t.attribName[t.looseCase]()),-1!==t.attribList.indexOf(t.attribName)||t.tag.attributes.hasOwnProperty(t.attribName))t.attribName=t.attribValue="";else{if(t.opt.xmlns){var e=v(t.attribName,!0),i=e.prefix,a=e.local;if("xmlns"===i)if("xml"===a&&t.attribValue!==c)O(t,"xml: prefix must be bound to "+c+"\nActual: "+t.attribValue);else if("xmlns"===a&&"http://www.w3.org/2000/xmlns/"!==t.attribValue)O(t,"xmlns: prefix must be bound to http://www.w3.org/2000/xmlns/\nActual: "+t.attribValue);else{var s=t.tag,r=t.tags[t.tags.length-1]||t;s.ns===r.ns&&(s.ns=Object.create(r.ns)),s.ns[a]=t.attribValue}t.attribList.push([t.attribName,t.attribValue])}else t.tag.attributes[t.attribName]=t.attribValue,y(t,"onattribute",{name:t.attribName,value:t.attribValue});t.attribName=t.attribValue=""}}function x(t,e){if(t.opt.xmlns){var i=t.tag,a=v(t.tagName);i.prefix=a.prefix,i.local=a.local,i.uri=i.ns[a.prefix]||"",i.prefix&&!i.uri&&(O(t,"Unbound namespace prefix: "+JSON.stringify(t.tagName)),i.uri=a.prefix);var s=t.tags[t.tags.length-1]||t;i.ns&&s.ns!==i.ns&&Object.keys(i.ns).forEach((function(e){y(t,"onopennamespace",{prefix:e,uri:i.ns[e]})}));for(var r=0,n=t.attribList.length;r<n;r++){var o=t.attribList[r],c=o[0],u=o[1],h=v(c,!0),l=h.prefix,d=h.local,p=""===l?"":i.ns[l]||"",T={name:c,value:u,prefix:l,local:d,uri:p};l&&"xmlns"!==l&&!p&&(O(t,"Unbound namespace prefix: "+JSON.stringify(l)),T.uri=l),t.tag.attributes[c]=T,y(t,"onattribute",T)}t.attribList.length=0}t.tag.isSelfClosing=!!e,t.sawRoot=!0,t.tags.push(t.tag),y(t,"onopentag",t.tag),e||(t.noscript||"script"!==t.tagName.toLowerCase()?t.state=_.TEXT:t.state=_.SCRIPT,t.tag=null,t.tagName=""),t.attribName=t.attribValue="",t.attribList.length=0}function L(t){if(!t.tagName)return O(t,"Weird empty close tag."),t.textNode+="</>",void(t.state=_.TEXT);if(t.script){if("script"!==t.tagName)return t.script+="</"+t.tagName+">",t.tagName="",void(t.state=_.SCRIPT);y(t,"onscript",t.script),t.script=""}var e=t.tags.length,i=t.tagName;t.strict||(i=i[t.looseCase]());for(var a=i;e--;){if(t.tags[e].name===a)break;O(t,"Unexpected close tag")}if(e<0)return O(t,"Unmatched closing tag: "+t.tagName),t.textNode+="</"+t.tagName+">",void(t.state=_.TEXT);t.tagName=i;for(var s=t.tags.length;s-- >e;){var r=t.tag=t.tags.pop();t.tagName=t.tag.name,y(t,"onclosetag",t.tagName);var n={};for(var o in r.ns)n[o]=r.ns[o];var c=t.tags[t.tags.length-1]||t;t.opt.xmlns&&r.ns!==c.ns&&Object.keys(r.ns).forEach((function(e){var i=r.ns[e];y(t,"onclosenamespace",{prefix:e,uri:i})}))}0===e&&(t.closedRoot=!0),t.tagName=t.attribValue=t.attribName="",t.attribList.length=0,t.state=_.TEXT}function j(t){var e,i=t.entity,a=i.toLowerCase(),s="";return t.ENTITIES[i]?t.ENTITIES[i]:t.ENTITIES[a]?t.ENTITIES[a]:("#"===(i=a).charAt(0)&&("x"===i.charAt(1)?(i=i.slice(2),s=(e=parseInt(i,16)).toString(16)):(i=i.slice(1),s=(e=parseInt(i,10)).toString(10))),i=i.replace(/^0+/,""),isNaN(e)||s.toLowerCase()!==i?(O(t,"Invalid character entity"),"&"+t.entity+";"):String.fromCodePoint(e))}function M(t,e){"<"===e?(t.state=_.OPEN_WAKA,t.startTagPosition=t.position):T(e)||(O(t,"Non-whitespace before first tag."),t.textNode=e,t.state=_.TEXT)}function U(t,e){var i="";return e<t.length&&(i=t.charAt(e)),i}_=e.STATE,String.fromCodePoint||(N=String.fromCharCode,b=Math.floor,I=function(){var t,e,i=16384,a=[],s=-1,r=arguments.length;if(!r)return"";for(var n="";++s<r;){var o=Number(arguments[s]);if(!isFinite(o)||o<0||o>1114111||b(o)!==o)throw RangeError("Invalid code point: "+o);o<=65535?a.push(o):(t=55296+((o-=65536)>>10),e=o%1024+56320,a.push(t,e)),(s+1===r||a.length>i)&&(n+=N.apply(null,a),a.length=0)}return n},Object.defineProperty?Object.defineProperty(String,"fromCodePoint",{value:I,configurable:!0,writable:!0}):String.fromCodePoint=I)}(e)}).call(this,i(4).Buffer)},367:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});class a extends Error{constructor(t,e){const i=t.saxStream._parser;super(t.trackPosition?`Line ${i.line+1} column ${i.column+1}: ${e}`:e)}}e.ParseError=a},368:function(t,e,i){"use strict";var a=this&&this.__createBinding||(Object.create?function(t,e,i,a){void 0===a&&(a=i),Object.defineProperty(t,a,{enumerable:!0,get:function(){return e[i]}})}:function(t,e,i,a){void 0===a&&(a=i),t[a]=e[i]}),s=this&&this.__exportStar||function(t,e){for(var i in t)"default"===i||Object.prototype.hasOwnProperty.call(e,i)||a(e,t,i)};Object.defineProperty(e,"__esModule",{value:!0}),s(i(214),e),s(i(369),e),s(i(215),e),s(i(216),e),s(i(117),e),s(i(217),e),s(i(218),e)},369:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.DataFactory=void 0;const a=i(214),s=i(215),r=i(216),n=i(117),o=i(217),c=i(218);let u=0;e.DataFactory=class{constructor(t){this.blankNodeCounter=0,t=t||{},this.blankNodePrefix=t.blankNodePrefix||`df_${u++}_`}namedNode(t){return new n.NamedNode(t)}blankNode(t){return new a.BlankNode(t||`${this.blankNodePrefix}${this.blankNodeCounter++}`)}literal(t,e){return new r.Literal(t,e)}variable(t){return new c.Variable(t)}defaultGraph(){return s.DefaultGraph.INSTANCE}quad(t,e,i,a){return new o.Quad(t,e,i,a||this.defaultGraph())}fromTerm(t){switch(t.termType){case"NamedNode":return this.namedNode(t.value);case"BlankNode":return this.blankNode(t.value);case"Literal":return t.language?this.literal(t.value,t.language):t.datatype.equals(r.Literal.XSD_STRING)?this.literal(t.value):this.literal(t.value,this.fromTerm(t.datatype));case"Variable":return this.variable(t.value);case"DefaultGraph":return this.defaultGraph();case"Quad":return this.quad(this.fromTerm(t.subject),this.fromTerm(t.predicate),this.fromTerm(t.object),this.fromTerm(t.graph))}}fromQuad(t){return this.fromTerm(t)}resetBlankNodeCounter(){this.blankNodeCounter=0}}},483:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),function(t){for(var i in t)e.hasOwnProperty(i)||(e[i]=t[i])}(i(361))}}]);
//# sourceMappingURL=49e2c5097b39d9d96143.js.map