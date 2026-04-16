---
title: 60s 插件配置
description: 在这里配置 60s 资讯插件的 API 地址、命令前缀、默认查询参数和返回行为
fields:
  - key: base.api.baseUrl
    label: 60s API 地址
    type: text
    description: 60s 服务地址。默认使用官方公开实例，也可以改成你自己部署的 60s API 服务地址。
    placeholder: https://60s.viki.moe

  - key: base.api.timeoutMs
    label: 请求超时毫秒
    type: number
    description: 插件请求 60s API 时的超时时间。网络较慢或自建服务响应较慢时可以适当调大。
    placeholder: 15000

  - key: base.trigger.requirePrefix
    label: 命令是否必须带前缀
    type: switch
    description: 开启后只有带前缀的消息才会触发 60s 插件。默认前缀列表同时支持 `60s` 和 `/60s`。

  - key: base.trigger.prefixes
    label: 命令前缀列表
    type: json
    description: 60s 插件识别命令时使用的前缀数组。默认是 `[\"60s\", \"/60s\"]`，所以默认不需要 `/`。插件会按顺序匹配这些前缀。

  - key: base.behavior.quoteReply
    label: 是否引用回复
    type: switch
    description: 开启后，插件在发送新闻、天气、油价等结果时会附带引用当前消息的回复段。

  - key: base.behavior.includeImages
    label: 是否发送图片
    type: switch
    description: 开启后，遇到 60s 新闻、Epic 游戏、天气这类接口带图片字段时，插件会把图片一并发出来。

  - key: base.behavior.maxItems
    label: 列表最大条数
    type: number
    description: 新闻、历史、Epic、IT 资讯等列表型结果单次最多展示多少条，避免消息过长。
    placeholder: 6

  - key: base.defaults.exchangeCurrency
    label: 默认汇率基准货币
    type: text
    description: 执行 `60s 汇率` 但没有额外提供货币代码时使用的默认值，例如 `CNY`、`USD`。
    placeholder: CNY

  - key: base.defaults.fuelRegion
    label: 默认油价地区
    type: text
    description: 执行 `60s 油价` 但用户没有提供地区时使用的默认地区，例如 `杭州`、`成都郫县`。留空则必须由用户提供。
    placeholder: 杭州

  - key: base.defaults.weatherQuery
    label: 默认天气地区
    type: text
    description: 执行 `60s 天气` 但用户没有提供地区时使用的默认地区，例如 `杭州`、`北京海淀`。留空则必须由用户提供。
    placeholder: 杭州

  - key: base.defaults.itNewsLimit
    label: 默认 IT 资讯条数
    type: number
    description: 执行 `60s it` 但用户没有指定条数时默认返回的资讯条数，插件会限制在 1 到 50 之间。
    placeholder: 5
---

```mioku-fields
keys:
  - base.api.baseUrl
  - base.api.timeoutMs
  - base.trigger.requirePrefix
  - base.trigger.prefixes
```

```mioku-fields
keys:
  - base.behavior.quoteReply
  - base.behavior.includeImages
  - base.behavior.maxItems
```

```mioku-fields
keys:
  - base.defaults.exchangeCurrency
  - base.defaults.fuelRegion
  - base.defaults.weatherQuery
  - base.defaults.itNewsLimit
```
