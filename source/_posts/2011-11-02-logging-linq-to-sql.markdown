---
layout: post
status: publish
published: true
title: Logging Linq to SQL
date: !binary |-
  MjAxMS0xMS0wMiAxMDo1NDozNCAtMDQwMA==
categories:
- .net
tags:
- linq to sql
- l2s
- log4net
redirect_from:
- /2011/11/logging-linq-to-sql/
comments: true
---
There are times when you need a quick way to debug Linq to SQL. Inspired by this [answer to a StackOverflow question][soverflow] 
I easily combined log4net and Linq to SQL. This way I avoided the console, which is not an option in the case of a web application.

<!--more-->

It is possible to set the Log property of your DataContext. Log is a TextWriter, so I created a simple TextWriter 
implementation. Not sure which methods L2S uses, I overrided Write and WriteLine where they take string and object 
parameters. Each implementation simply logs to log4net but, naturally, it could use any logging library.

``` c#
public partial class YourDataContext
{
   partial void OnCreated()
   {
      #if DEBUG
         this.Log = new LogWriter();
      #endif
   }

    class LogWriter : TextWriter
    {
        public override Encoding Encoding
        {
            get { return Encoding.UTF8; }
        }

        public override void Write(string format, object arg0)
        {
            // logging goes here
        }

        public override void Write(object value)
        {
            // logging goes here
        }

        public override void Write(string format, object arg0, object arg1)
        {
            // logging goes here
        }

        public override void Write(string format, object arg0, object arg1, object arg2)
        {
            // logging goes here
        }

        public override void Write(string format, params object[] arg)
        {
            // logging goes here
        }

        public override void Write(string value)
        {
            // logging goes here
        }

        public override void WriteLine(string format, object arg0)
        {
            // logging goes here
        }

        public override void WriteLine(object value)
        {
           // logging goes here
        }

        public override void WriteLine(string format, object arg0, object arg1)
        {
            // logging goes here
        }

        public override void WriteLine(string format, object arg0, object arg1, object arg2)
        {
            // logging goes here
        }

        public override void WriteLine(string format, params object[] arg)
        {
            // logging goes here
        }

        public override void WriteLine(string value)
        {
            // logging goes here
        }
    }
}
```

In my case I used log4net and here is my configuration, which logs to a file:

``` xml
<log4net>
   <appender name="LinqFile"
      type="log4net.Appender.FileAppender">
      <file value="Logs/Linq2Sql.txt" />
      <appendToFile value="true" />
      <layout type="log4net.Layout.PatternLayout">
         <conversionPattern value="%message%newline" />
      </layout>
    </appender>

  <logger name="YourDataContext">
      <level value="ALL" />
      <appender-ref ref="LinqFile" />
    </logger>
</log4net>
```

This is just enough to have Linq 2 SQL output saved in a text file. Just change level to OFF in XML config to
disable L2S logging altogether.

[soverflow]: http://stackoverflow.com/questions/86685/debugging-linq-to-sql-submitchanges/90025#90025