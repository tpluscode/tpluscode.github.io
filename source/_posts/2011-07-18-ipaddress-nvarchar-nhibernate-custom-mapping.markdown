---
layout: post
status: publish
published: true
title: Mapping System.Net.IPAddress as nvarchar with NHibernate
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 182
wordpress_url: http://t-code.pl/?p=182
date: !binary |-
  MjAxMS0wNy0xOCAyMDoxMTo1NiAtMDQwMA==
date_gmt: !binary |-
  MjAxMS0wNy0xOCAxODoxMTo1NiAtMDQwMA==
categories:
- Uncategorized
tags:
- nhibernate
- .net
- c#
comments: []
---
<p style="text-align: justify;">Without further ado, here's an implementation of <a href="http:&#47;&#47;www.nhforge.org&#47;doc&#47;nh&#47;en&#47;index.html#mapping-types-custom">IUserType<&#47;a>, which allows writing and reading instances of <a title="IPAddress class on MSDN" href="http:&#47;&#47;msdn.microsoft.com&#47;en-us&#47;library&#47;system.net.ipaddress.aspx">IPAddress<&#47;a> from a nvarchar column.<&#47;p></p>
<p style="text-align: justify;">The class inherits from the abstract UserType class described in my <a title="Mapowanie typu Enum na int z użyciem NHibernate" href="http:&#47;&#47;t-code.pl&#47;2011&#47;07&#47;enum-int-custom-mapping-nhibernate&#47;">previous post<&#47;a>.<&#47;p></p>
<pre class="brush: csharp; gutter: true">public class IpAddressAsString : UserType<br />
{<br />
  #region Overrides of UserType</p>
<p>  public override object NullSafeGet(IDataReader rs, string[] names, object owner)<br />
  {<br />
    object obj = NHibernateUtil.String.NullSafeGet(rs, names);<br />
    if (obj == null)<br />
    {<br />
      return null;<br />
    }<br />
    return IPAddress.Parse(obj.ToString());<br />
  }</p>
<p>  public override void NullSafeSet(IDbCommand cmd, object value, int index)<br />
  {<br />
    Check.Require(cmd != null);<br />
    if (value == null)<br />
    {<br />
      ((IDataParameter)cmd.Parameters[index]).Value = DBNull.Value;<br />
    }<br />
    else<br />
    {<br />
      ((IDataParameter)cmd.Parameters[index]).Value = value.ToString();<br />
    }<br />
  }</p>
<p>  public override SqlType[] SqlTypes<br />
  {<br />
    get { return new SqlType[] { SqlTypeFactory.GetString(15) }; }<br />
  }</p>
<p>  public override Type ReturnedType<br />
  {<br />
    get { return typeof(IPAddress); }<br />
  }</p>
<p>  #endregion<br />
}<&#47;pre></p>
<p style="text-align: justify;">I'd recently used this class to stored failed and successful logon attempts. Again it's just too simple but I'm happy to share.<&#47;p></p>
<p style="text-align: justify;">I'm awaiting comments!<&#47;p><br />
<!--:--></p>
