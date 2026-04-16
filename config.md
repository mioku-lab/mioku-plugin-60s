---
title: 60s 插件配置
description: 在这里配置 60s 资讯插件的 API 地址、触发方式、默认地区与回复行为
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
    description: 开启后只有 `60s` 或 `/60s` 前缀消息才会触发插件。关闭后，`it`、`金价`、`地区+油价`、`地区天气`、`摸鱼日报`、`epic`、`历史上的今天`、`ai` 都可直接触发。

  - key: base.trigger.prefixes
    label: 命令前缀列表
    type: json
    description: 前缀匹配列表，仅在“命令是否必须带前缀”开启时生效。默认是 `[\"60s\", \"/60s\"]`。

  - key: base.behavior.quoteReply
    label: 是否引用回复
    type: switch
    description: 开启后，插件发送结果会附带引用当前消息的回复段。

  - key: base.behavior.includeImages
    label: 是否发送图片
    type: switch
    description: 兼容旧配置项。当前插件优先将信息渲染为 Markdown 截图发送，通常无需开启该项。

  - key: base.behavior.maxItems
    label: 列表最大条数
    type: number
    description: 列表型结果单次最多展示多少条，避免截图过长。
    placeholder: 6


  - key: base.defaults.exchangeCurrency
    label: 默认汇率基准货币
    type: text
    description: AI 或工具调用查询汇率但未传货币代码时使用的默认值，例如 `CNY`、`USD`。
    placeholder: CNY

  - key: base.defaults.fuelRegion
    label: 默认油价地区
    type: text
    description: 查询油价但用户消息中未包含地区时使用的默认地区，例如 `杭州`、`成都郫县`。留空则必须由用户提供。
    placeholder: 杭州

  - key: base.defaults.weatherQuery
    label: 默认天气地区
    type: text
    description: 查询天气但用户消息中未包含地区时使用的默认地区，例如 `杭州`、`北京海淀`。留空则必须由用户提供。
    placeholder: 杭州

  - key: base.defaults.itNewsLimit
    label: 默认 IT 资讯条数
    type: number
    description: 执行 `it` 指令时默认返回的资讯条数，插件会限制在 1 到 50 之间。
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
