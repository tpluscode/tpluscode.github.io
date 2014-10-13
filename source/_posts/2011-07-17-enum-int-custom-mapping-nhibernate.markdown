---
layout: post
status: publish
published: true
title: Mapping Enum to int with NHibernate
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 172
wordpress_url: http://t-code.pl/?p=172
date: !binary |-
  MjAxMS0wNy0xNyAyMzoyMTo0MSAtMDQwMA==
date_gmt: !binary |-
  MjAxMS0wNy0xNyAyMToyMTo0MSAtMDQwMA==
categories:
- Uncategorized
tags:
- nhibernate
comments:
- id: 3
  author: NHibernate IPAddress to nvarchar custom mapping | T+Code
  author_email: ''
  author_url: http://t-code.pl/2011/07/ipaddress-nvarchar-nhibernate-custom-mapping/
  date: !binary |-
    MjAxMS0wNy0xOCAyMDoxMjowNCAtMDQwMA==
  date_gmt: !binary |-
    MjAxMS0wNy0xOCAxODoxMjowNCAtMDQwMA==
  content: ! '[...] T+Code   var blog = T + Code; blog += new Content();    Skip to
    content HomeAbout meAbout T+CodeContact        &larr; Mapping Enum to int with
    NHibernate [...]'
---
<p><!--:pl--></p>
<div>
<p>I am pretty sure this subject has been raised numerous times already, but a quick google didn't really give that many results, hence this post.</p>
<p></div></p>
<h2>Is there a problem officer?</h2><br />
Some time ago, while still newbie with <a title="NHibernate" href="http://www.nhforge.org">NHibernate</a> I struggled with the default way Enum properties are mapped to database columns.</p>
<p>The problem with NHibernate is that by default it maps enums as nvarchar columns. In my beginnings with NH this caused me some data type mismatch related exceptions and to some extent minor frustration.</p>
<p>Personally I wanted enum values mapped as integer, my rationale being space requirements and better performance, especially if an index is applied over the column in question. As an example I will be using the minimalist mapping below:</p>
<pre class="brush: xml; gutter: false">
<property name="UserType" type="Example.UserTypeEnum" /></pre><br />
Now, as I metioned earlier, the above does not satisfy my expectations. In order to have the UserType property mapped to an int column I implemented a custom <a title="NHibernate manual: Custom Value Types" href="http://www.nhforge.org/doc/nh/en/index.html#mapping-types-custom">IUserType</a>.</p>
<h2>The solution: Custom Value Type</h2><br />
The idea of a custom type is simple. Developers can get NHibernate to persist your property's value to columns of types not supported by the default persisters. It could even be used to persist a property to multiple columns, somewhat like <a title="NHibernate manual: Components" href="http://www.nhforge.org/doc/nh/en/index.html#mapping-declaration-component">components</a>.</p>
<p>My solution is simpler than that though. Implementation consists of three classes:</p>
<ul>
<li>abstract UserType class, extending IUserType interface,</li>
<li>generic EnumAsInt32 class,</li>
<li>finally, implementation of the above.</li><br />
</ul><br />
The first class exists to simplify further implementations. The IUserType contains definitions for many more method than are actually required to tackle the issue at hand.</p>
<pre class="brush: csharp; gutter: true">public abstract class UserType : IUserType<br />
{<br />
    #region Implementation of IUserType</p>
<p>    bool IUserType.Equals(object x, object y)<br />
    {<br />
        return Equals(x, y);<br />
    }</p>
<p>    public int GetHashCode(object x)<br />
    {<br />
        return x == null ? 0 : x.GetHashCode();<br />
    }</p>
<p>    public abstract object NullSafeGet(IDataReader rs, string[] names, object owner);</p>
<p>    public abstract void NullSafeSet(IDbCommand cmd, object value, int index);</p>
<p>    public virtual object DeepCopy(object value)<br />
    {<br />
        return value;<br />
    }</p>
<p>    public virtual object Replace(object original, object target, object owner)<br />
    {<br />
        return original;<br />
    }</p>
<p>    public virtual object Assemble(object cached, object owner)<br />
    {<br />
        return cached;<br />
    }</p>
<p>    public virtual object Disassemble(object value)<br />
    {<br />
        return value;<br />
    }<br />
    ///<br />
<summary>
    /// The SQL types for the columns mapped by this type.<br />
    /// </summary><br />
    public abstract SqlType[] SqlTypes{ get;}</p>
<p>    ///<br />
<summary>
    /// The type returned by <c>NullSafeGet()</c><br />
    /// </summary><br />
    public abstract Type ReturnedType { get; }</p>
<p>    public bool IsMutable<br />
    {<br />
        get { return false; }<br />
    }</p>
<p>    #endregion<br />
}</pre><br />
The EnumAsInt32 class overrides the abstract methods of UserType and requires one generic argument - the type of mapped Enum type.</p>
<pre class="brush: csharp; gutter: true">public class EnumAsInt32<T> : UserType<br />
{<br />
    #region Overrides of UserType</p>
<p>    public override object NullSafeGet(IDataReader rs,<br />
        string[] names, object owner)<br />
    {<br />
        object obj = NHibernateUtil.String.NullSafeGet(rs, names);<br />
        if (obj == null)<br />
        {<br />
            return null;<br />
        }<br />
        return Enum.Parse(typeof(T), obj.ToString());<br />
    }</p>
<p>    public override void NullSafeSet(IDbCommand cmd,<br />
        object value, int index)<br />
    {<br />
        Debug.Assert(cmd != null);<br />
        if (value == null)<br />
        {<br />
            ((IDataParameter)cmd.Parameters[index]).Value = DBNull.Value;<br />
        }<br />
        else<br />
        {<br />
            ((IDataParameter)cmd.Parameters[index]).Value = (int)value;<br />
        }<br />
    }</p>
<p>    public override SqlType[] SqlTypes<br />
    {<br />
        get { return new[] { SqlTypeFactory.Int32 }; }<br />
    }</p>
<p>    public override Type ReturnedType<br />
    {<br />
        get { return typeof(T); }<br />
    }</p>
<p>    #endregion<br />
}</pre><br />
Implementation could end here, but with XML mappings, using generic types is pretty cumbersome. Personally I can never get the syntax right. For that reason it is easier to further extend&nbsp;EnumAsInt32.</p>
<pre class="brush: csharp; gutter: true">public class UserTypeEnumAsInt32<br />
    : EnumAsInt32<Example.UserTypeEnum><br />
{<br />
}</pre><br />
Simple as that. Too simple even, but the result is cleaner XML mapping:</p>
<pre class="brush: xml; gutter: true">
<property name="UserType" type="UserTypeEnumAsInt32" /></pre><br />
Of course the example lack namespaces, but otherwise it's a fully functional code.</p>
<p>Have fun coding! :)<!--:--></p>
