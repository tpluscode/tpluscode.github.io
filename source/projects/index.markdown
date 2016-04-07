---
layout: page
title: "My projects"
date: 2014-10-14 11:11
comments: false
sharing: false
footer: true
---

{% for project in site.projects reversed %}
<div class="project{% if project.print == false %} no-print{% endif %}">
  <h2>
      {% if project.href %}<a href="{{ project.href }}" target="_blank">{% endif %}
      {{ project.name }}
      {% if project.href %}</a>{% endif %}
  </h2>
  <h4>{{ project.when }}</h4>
  <p>{{ project.description }}</p>

  {% for tech in project.technologies %}
  <ul class="talent">
      <li class="last">{{ tech }}</li>
  </ul>
  {% endfor %}
  <div class="clearfix" ></div>
</div>
{% endfor %}