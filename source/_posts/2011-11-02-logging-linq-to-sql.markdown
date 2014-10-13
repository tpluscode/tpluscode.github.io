---
layout: post
status: publish
published: true
title: Logging Linq to SQL
author:
  display_name: Tomasz Pluskiewicz
  login: admin
  email: tomasz@t-code.pl
  url: http://www.t-code.pl
author_login: admin
author_email: tomasz@t-code.pl
author_url: http://www.t-code.pl
wordpress_id: 234
wordpress_url: http://t-code.pl/?p=234
date: !binary |-
  MjAxMS0xMS0wMiAxMDo1NDozNCAtMDQwMA==
date_gmt: !binary |-
  MjAxMS0xMS0wMiAwOTo1NDozNCAtMDQwMA==
categories:
- Uncategorized
tags:
- linq to sql
- l2s
- log4net
comments: []
---
<p><!--:en-->There are time when you need a quick way to debug Linq to SQL.&nbsp;Inspired by this <a title="Debugging LINQ to SQL SubmitChanges()" href="http://stackoverflow.com/questions/86685/debugging-linq-to-sql-submitchanges/90025#90025">answer to a StackOverflow question</a>&nbsp;I easily combined log4net and Linq to SQL. This way I avoided the console, which is not an option in the case of a web application.</p>
<p>It is possible to set the Log property of your DataContext. Log is a TextWriter, so I created a simple TextWriter implementation. Not sure which methods L2S uses, I overrided Write and WriteLine where they take string and object parameters. Each implementation simply logs to log4net but, naturally, it could use any logging library.</p>
<pre class="brush: csharp; gutter: true">public partial class YourDataContext<br />
{<br />
   partial void OnCreated()<br />
   {<br />
      #if DEBUG<br />
         this.Log = new LogWriter();<br />
      #endif<br />
   }</p>
<p>   class LogWriter : TextWriter<br />
   {<br />
      public override Encoding Encoding<br />
      {<br />
         get { return Encoding.UTF8; }<br />
      }</p>
<p>      public override void Write(string format, object arg0)<br />
      {<br />
         // logging goes here<br />
      }</p>
<p>      public override void Write(object value)<br />
      {<br />
         // logging goes here<br />
      }</p>
<p>      public override void Write(string format, object arg0,<br />
         object arg1)<br />
      {<br />
         // logging goes here<br />
      }</p>
<p>      public override void Write(string format, object arg0,<br />
         object arg1, object arg2)<br />
      {<br />
         // logging goes here<br />
      }</p>
<p>      public override void Write(string format,<br />
         params object[] arg)<br />
      {<br />
         // logging goes here<br />
      }</p>
<p>      public override void Write(string value)<br />
      {<br />
         // logging goes here<br />
      }</p>
<p>      public override void WriteLine(string format,<br />
         object arg0)<br />
      {<br />
         // logging goes here<br />
      }</p>
<p>      public override void WriteLine(object value)<br />
      {<br />
         // logging goes here<br />
      }</p>
<p>      public override void WriteLine(string format,<br />
         object arg0, object arg1)<br />
      {<br />
         // logging goes here<br />
      }</p>
<p>      public override void WriteLine(string format,<br />
         object arg0, object arg1, object arg2)<br />
      {<br />
         // logging goes here<br />
      }</p>
<p>      public override void WriteLine(string format,<br />
         params object[] arg)<br />
      {<br />
         // logging goes here<br />
      }</p>
<p>      public override void WriteLine(string value)<br />
      {<br />
         // logging goes here<br />
      }<br />
   }<br />
}</pre><br />
In my case I used log4net and here is my configuration, which logs to a file:</p>
<pre class="brush: xml; gutter: true"><log4net><br />
   <appender name="LinqFile"<br />
      type="log4net.Appender.FileAppender"><br />
      <file value="Logs/Linq2Sql.txt" /><br />
      <appendToFile value="true" /><br />
      <layout type="log4net.Layout.PatternLayout"><br />
         <conversionPattern value="%message%newline" /><br />
      </layout><br />
    </appender></p>
<p>   <logger name="YourDataContext"><br />
      <level value="ALL" /><br />
      <appender-ref ref="LinqFile" /><br />
    </logger><br />
</log4net></pre><br />
This is just enough to have Linq 2 SQL output saved in a text file. Just change level to OFF in XML config to disable L2S logging altogether.<!--:--></p>
