# koishi-plugin-im

[OSPP 2024 项目](https://summer-ospp.ac.cn/org/prodetail/2490f0533)

Koishi 作为聊天机器人底层基于名为 Satori 的协议开发，官方提供了超过 15 个聊天平台的适配。得益于 Satori 协议的通用性设计，开发者得以以更低的成本开发出跨平台、可扩展、高性能的聊天应用，并将机器人运行在世界上几乎所有聊天平台上。

然而，仅仅实现已有的聊天平台并不能完全发挥 Satori 协议的表达能力。因此，本项目希望设计一个运行在 Satori / Koishi 架构上的独立聊天平台。任何 Koishi 机器人的用户可以直接在网页或 App 中访问聊天界面，并与其他用户聊天。诚然，完成独立聊天平台是一个很大的工程，但基础设施的设计和代码将会由 Satori / Koishi 架构直接提供，本项目的参与者只需完成其中的上层部分。

本项目的呈现形式为名为 IM（Instant Message，即时通信）的 Koishi 插件。在任意 Koishi 应用安装此查看即可在 Koishi WebUI 中扩展出上述聊天平台。
