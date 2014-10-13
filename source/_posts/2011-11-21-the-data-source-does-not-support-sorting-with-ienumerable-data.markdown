---
layout: post
status: publish
published: true
title: The data source '...&rsquo; does not support sorting with IEnumerable data
date: !binary |-
  MjAxMS0xMS0yMSAxMDowMTo1NyAtMDUwMA==
categories:
- .net
tags:
- .net
- c#
- datasets
redirect_from:
- /2011/11/the-data-source-does-not-support-sorting-with-ienumerable-data/
comments: true
---

We are currently refactoring a web application, which uses ObjectDataSources extensively. There are places in our app, 
where they are used for sorting grids, but there is a problem. We switched from DataTables to collections and now an 
exception occurs:

```
The data source &lsquo;ods_DataSource&rsquo; does not support sorting with IEnumerable data.
Automatic sorting is only supported with DataView, DataTable, and DataSet.
```

<!--more-->

As Pradeem wrote on his [blog][pradeem] there are two solutions to the above issue:

1. Implement custom sorting
1. Change IEnumerable datatype into one of these datatypes.

Eventually we would implement the former, but for the time being Pradeem gives a solution. There is however something 
wrong with his code so below I give you his snippet slightly modified to be an Extension method.

``` c#
public static class Util
{
   public static DataTable ToDataTable<T>(this IEnumerable<T> varlist)
   {
      DataTable dtReturn = new DataTable();
      // column names
      PropertyInfo[] oProps = null;
      // Could add a check to verify that there is an element 0
      foreach (T rec in varlist)
      {
         // Use reflection to get property names, to create table,
         // Only first time, others will follow
         if (oProps == null)
         {
            oProps = ((Type)rec.GetType()).GetProperties();
            foreach (PropertyInfo pi in oProps)
            {
               // Note that we must check a nullable type
               // else method will throw and error
               Type colType = pi.PropertyType;
               if ((colType.IsGenericType) &amp;&amp;
                   (colType.GetGenericTypeDefinition() == typeof(Nullable)))
               {
                  // Since all the elements have same type
                  // you can just take the first element and get type
                  colType = colType.GetGenericArguments()[0];
               }
               dtReturn.Columns.Add(new DataColumn(pi.Name, colType));
            }
         }
         DataRow dr = dtReturn.NewRow();
         // Iterate through each property in PropertyInfo
         foreach (PropertyInfo pi in oProps)
         {
            // Handle null values accordingly
            dr[pi.Name] = pi.GetValue(rec, null) == null
                          ? DBNull.Value
                          : pi.GetValue(rec, null);
         }
         dtReturn.Rows.Add(dr);
      }
      return (dtReturn);
   }
}
```

So now instead of having a data source method

``` c#
public IList<Model> GetData()
{
   return DAL.GetData();
}
```

You would have:

``` c#
public DataTable GetData()
{
   return DAL.GetData().ToDataTable();
}
```

[pradeem]: http://technoesis.wordpress.com/2008/03/03/solution-to-error-the-data-source-ods_datasource-does-not-support-sorting-with-ienumerable-data-automatic-sorting-is-only-supported-with-dataview-datatable-and-dataset/