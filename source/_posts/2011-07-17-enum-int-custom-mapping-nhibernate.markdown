---
layout: post
status: publish
published: true
title: Mapping Enum to int with NHibernate
date: !binary |-
  MjAxMS0wNy0xNyAyMzoyMTo0MSAtMDQwMA==
categories:
- .net
- nhibernate
redirect_from:
- /2011/07/enum-int-custom-mapping-nhibernate/
---

I am pretty sure this subject has been raised numerous times already, but a quick google didn't really give that many 
results, hence this post.

## Is there a problem officer?

Some time ago, while still newbie with [NHibernate](http://www.nhforge.org) I struggled with the default way Enum 
properties are mapped to database columns.

<!--more-->

The problem with NHibernate is that by default it maps enums as nvarchar columns. In my beginnings with NH this caused 
me some data type mismatch related exceptions and to some extent minor frustration.

Personally I wanted enum values mapped as integer, my rationale being space requirements and better performance, 
especially if an index is applied over the column in question. As an example I will be using the minimalist mapping below:

``` xml
<property name="UserType" type="Example.UserTypeEnum" />
```

Now, as I metioned earlier, the above does not satisfy my expectations. In order to have the UserType property mapped to 
an int column I implemented a custom [IUserType](http://www.nhforge.org/doc/nh/en/index.html#mapping-types-custom).

## The solution: Custom Value Type

The idea of a custom type is simple. Developers can get NHibernate to persist your property's value to columns of types 
not supported by the default persisters. It could even be used to persist a property to multiple columns, somewhat like 
[components](http://www.nhforge.org/doc/nh/en/index.html#mapping-declaration-component)

My solution is simpler than that though. Implementation consists of three classes:

1. abstract UserType class, extending IUserType interface,
1. generic EnumAsInt32 class,
1. finally, implementation of the above.

The first class exists to simplify further implementations. The IUserType contains definitions for many more method than 
are actually required to tackle the issue at hand.

``` c#
public abstract class UserType : IUserType
{
    #region Implementation of IUserType

    bool IUserType.Equals(object x, object y)
    {
        return Equals(x, y);
    }

    public int GetHashCode(object x)
    {
        return x == null ? 0 : x.GetHashCode();
    }

    public abstract object NullSafeGet(IDataReader rs, string[] names, object owner);

    public abstract void NullSafeSet(IDbCommand cmd, object value, int index);

    public virtual object DeepCopy(object value)
    {
        return value;
    }

    public virtual object Replace(object original, object target, object owner)
    {
        return original;
    }

    public virtual object Assemble(object cached, object owner)
    {
        return cached;
    }

    public virtual object Disassemble(object value)
    {
        return value;
    }

    /// <summary>
    /// The SQL types for the columns mapped by this type.
    /// </summary>
    public abstract SqlType[] SqlTypes{ get;}

    /// <summary>
    /// The type returned by <c>NullSafeGet()</c>
    /// </summary>
    public abstract Type ReturnedType { get; }

    public bool IsMutable
    {
        get { return false; }
    }
    #endregion
}
```
The EnumAsInt32 class overrides the abstract methods of UserType and requires one generic argument - the type of mapped Enum type.

``` c#
public class EnumAsInt32<T> : UserType
{
    #region Overrides of UserType

    public override object NullSafeGet(IDataReader rs, string[] names, object owner)
    {
        object obj = NHibernateUtil.String.NullSafeGet(rs, names);
        if (obj == null)
        {
            return null;
        }
        return Enum.Parse(typeof(T), obj.ToString());
    }

    public override void NullSafeSet(IDbCommand cmd, object value, int index)
    {
        Debug.Assert(cmd != null);
        if (value == null)
        {
            ((IDataParameter)cmd.Parameters[index]).Value = DBNull.Value;
        }
        else
        {
            ((IDataParameter)cmd.Parameters[index]).Value = (int)value;
        }
    }

    public override SqlType[] SqlTypes
    {
        get { return new[] { SqlTypeFactory.Int32 }; }
    }

    public override Type ReturnedType
    {
        get { return typeof(T); }
    }

    #endregion
}
```

Implementation could end here, but with XML mappings, using generic types is pretty cumbersome. Personally I can never
get the syntax right. For that reason it is easier to further extend EnumAsInt32.

``` c#
public class UserTypeEnumAsInt32
    : EnumAsInt32<Example.UserTypeEnum>
{
}
```

Simple as that. Too simple even, but the result is cleaner XML mapping:

``` xml
<property name="UserType" type="UserTypeEnumAsInt32" />
```

Of course the example lack namespaces, but otherwise it's a fully functional code.

Have fun coding! :)
