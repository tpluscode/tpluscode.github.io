---
layout: post
status: publish
published: true
title: Mapping System.Net.IPAddress as nvarchar with NHibernate
date: !binary |-
  MjAxMS0wNy0xOCAyMDoxMTo1NiAtMDQwMA==
categories:
- .net
- nhibernate
redirect_from:
- /2011/07/ipaddress-nvarchar-nhibernate-custom-mapping/
---

<!--more-->

Without further ado, here's an implementation of [IUserType][custom-type], which allows writing and reading instances of 
[IPAddress][IPAddress] from a nvarchar column.

The class inherits from the abstract UserType class described in my [previous post](/2011/07/enum-int-custom-mapping-nhibernate/)

``` c#
public class IpAddressAsString : UserType
{
  #region Overrides of UserType

  public override object NullSafeGet(IDataReader rs, string[] names, object owner)
  {
    object obj = NHibernateUtil.String.NullSafeGet(rs, names);
    if (obj == null)
    {
      return null;
    }
    return IPAddress.Parse(obj.ToString());
  }

  public override void NullSafeSet(IDbCommand cmd, object value, int index)
  {
    Check.Require(cmd != null);
    if (value == null)
    {
      ((IDataParameter)cmd.Parameters[index]).Value = DBNull.Value;
    }
    else
    {
      ((IDataParameter)cmd.Parameters[index]).Value = value.ToString();
    }
  }

  public override SqlType[] SqlTypes
  {
    get { return new SqlType[] { SqlTypeFactory.GetString(15) }; }
  }

  public override Type ReturnedType
  {
    get { return typeof(IPAddress); }
  }

  #endregion
}
```

I'd recently used this class to stored failed and successful logon attempts. Again it's just too simple but I'm happy to share.


[custom-type]: http://www.nhforge.org/doc/nh/en/index.html#mapping-types-custom
[IPAddress]: http://msdn.microsoft.com/en-us/library/system.net.ipaddress.aspx