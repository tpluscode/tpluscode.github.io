---
layout: post
status: publish
published: true
title: The data source '...&rsquo; does not support sorting with IEnumerable data
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 256
wordpress_url: http://t-code.pl/?p=256
date: !binary |-
  MjAxMS0xMS0yMSAxMDowMTo1NyAtMDUwMA==
date_gmt: !binary |-
  MjAxMS0xMS0yMSAwOTowMTo1NyAtMDUwMA==
categories:
- Uncategorized
tags:
- .net
- c#
- datasets
comments: []
---
<p><!--:en-->We are currently refactoring a web application, which uses ObjectDataSources extensively. There are places in our app, where they are used for sorting grids, but there is a problem. We switched from DataTables to collections and now an exception occurs:</p>
<pre class="brush: text; gutter: true">The data source &lsquo;ods_DataSource&rsquo; does not support sorting with IEnumerable data.<br />
Automatic sorting is only supported with DataView, DataTable, and DataSet.</pre><br />
As Pradeem wrote on his <a href="http://technoesis.wordpress.com/2008/03/03/solution-to-error-the-data-source-ods_datasource-does-not-support-sorting-with-ienumerable-data-automatic-sorting-is-only-supported-with-dataview-datatable-and-dataset/">blog</a> there are two solutions to the above issue:</p>
<ol>
<li>Implement custom sorting.</li>
<li>Change IEnumerable datatype into one of these datatypes.</li><br />
</ol><br />
Eventually we would implement the former, but for the time being Pradeem gives a solution. There is however something wrong with his code so below I give you his snippet slightly modified to be an Extension method.</p>
<pre class="brush: csharp; gutter: true">public static class Util<br />
{<br />
   public static DataTable ToDataTable<T>(this IEnumerable<T> varlist)<br />
   {<br />
      DataTable dtReturn = new DataTable();<br />
      // column names<br />
      PropertyInfo[] oProps = null;<br />
      // Could add a check to verify that there is an element 0<br />
      foreach (T rec in varlist)<br />
      {<br />
         // Use reflection to get property names, to create table,<br />
         // Only first time, others will follow<br />
         if (oProps == null)<br />
         {<br />
            oProps = ((Type)rec.GetType()).GetProperties();<br />
            foreach (PropertyInfo pi in oProps)<br />
            {<br />
               // Note that we must check a nullable type<br />
               // else method will throw and error<br />
               Type colType = pi.PropertyType;<br />
               if ((colType.IsGenericType) &amp;&amp;<br />
                   (colType.GetGenericTypeDefinition() == typeof(Nullable)))<br />
               {<br />
                  // Since all the elements have same type<br />
                  // you can just take the first element and get type<br />
                  colType = colType.GetGenericArguments()[0];<br />
               }<br />
               dtReturn.Columns.Add(new DataColumn(pi.Name, colType));<br />
            }<br />
         }<br />
         DataRow dr = dtReturn.NewRow();<br />
         // Iterate through each property in PropertyInfo<br />
         foreach (PropertyInfo pi in oProps)<br />
         {<br />
            // Handle null values accordingly<br />
            dr[pi.Name] = pi.GetValue(rec, null) == null<br />
                          ? DBNull.Value<br />
                          : pi.GetValue(rec, null);<br />
         }<br />
         dtReturn.Rows.Add(dr);<br />
      }<br />
      return (dtReturn);<br />
   }<br />
}</pre><br />
So now instead of having a data source method</p>
<pre class="brush: csharp; gutter: true">public IList<Model> GetData()<br />
{<br />
   return DAL.GetData();<br />
}</pre><br />
You would have:</p>
<pre class="brush: csharp; gutter: true">public DataTable GetData()<br />
{<br />
   return DAL.GetData().ToDataTable();<br />
}</pre><br />
<!--:--></p>
