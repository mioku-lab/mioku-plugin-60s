---
title: 60s 插件配置
description: 在这里配置 60s 资讯插件的默认地区与回复行为。API 地址和超时请在「服务配置」页面配置。
fields:
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
