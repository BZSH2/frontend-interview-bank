import { Difficulty } from '@prisma/client';

export type ImportedSeedQuestion = {
  title: string;
  summary: string;
  categoryKey: 'vue';
  difficulty: Difficulty;
  tags: string[];
  content: string;
  answer: string;
  hasExplanation: false;
  aliases?: string[];
};

export const importedVueSeriesQuestions: ImportedSeedQuestion[] = [
  {
    title: '说说你对vue的理解?',
    summary: 'Web是World Wide Web的简称，中文译为万维网我们可以将它规划成如下的几个时代来进行理解',
    categoryKey: 'vue',
    difficulty: Difficulty.MEDIUM,
    tags: ['Vue', '高频题'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/vue.html\n\n题目：说说你对vue的理解?\n\n请结合以下要点作答：\n1. Web是World Wide Web的简称，中文译为万维网我们可以将它规划成如下的几个时代来进行理解\n2. 石器时代指的就是我们的静态网页，可以欣赏一下1997的Apple官网\n3. 最早的网页是没有数据库的，可以理解成就是一张可以在网络上浏览的报纸，直到CGI技术的出现通过 CGI Perl 运行一小段代码与数据库或文件系统进行交互，如当时的Google（1998年）\n4. Model：模型层，负责处理业务逻辑以及和服务器端进行交互\n5. View：视图层：负责将数据模型转化为UI展示出来，可以简单的理解为HTML页面\n6. ViewModel：视图模型层，用来连接Model和View，是Model和View之间的通信桥梁',
    answer:
      '参考答案要点：\n- Web是World Wide Web的简称，中文译为万维网我们可以将它规划成如下的几个时代来进行理解\n- 石器时代指的就是我们的静态网页，可以欣赏一下1997的Apple官网\n- 最早的网页是没有数据库的，可以理解成就是一张可以在网络上浏览的报纸，直到CGI技术的出现通过 CGI Perl 运行一小段代码与数据库或文件系统进行交互，如当时的Google（1998年）\n- Model：模型层，负责处理业务逻辑以及和服务器端进行交互\n- View：视图层：负责将数据模型转化为UI展示出来，可以简单的理解为HTML页面\n- ViewModel：视图模型层，用来连接Model和View，是Model和View之间的通信桥梁',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '说说你对SPA（单页应用）的理解?',
    summary:
      'SPA（single-page application），翻译过来就是单页应用 SPA 是一种网络应用程序或网站的模型，它通过动态重写当前页面来与用户交互…',
    categoryKey: 'vue',
    difficulty: Difficulty.MEDIUM,
    tags: ['Vue', '高频题'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/spa.html\n\n题目：说说你对SPA（单页应用）的理解?\n\n请结合以下要点作答：\n1. SPA（single-page application），翻译过来就是单页应用 SPA 是一种网络应用程序或网站的模型，它通过动态重写当前页面来与用户交互，这种方法避免了页面之间切换打断用户体验在单页应用中，所有必要的代码（ HTML 、 JavaScript 和 CSS ）都通过单个页面的加载而检索，或者根据需要（通常是为响应用户操作）动态装载适当的资源并添加到页面页面在任何时间点都不会重新加载，也不会将控制转移到其他页面举个例子来讲就是一个杯子，早上装的牛奶，中午装的是开水，晚上装的是茶，我们发现，变的始终是杯子里的内容，而杯子始终是那个杯子结构如下图\n2. 我们熟知的JS框架如 react , vue , angular , ember 都属于 SPA\n3. 上面大家已经对单页面有所了解了，下面来讲讲多页应用MPA（MultiPage-page application），翻译过来就是多页应用在 MPA 中，每个页面都是一个主页面，都是独立的当我们在访问另一个页面的时候，都需要重新加载 html 、 css 、 js 文件，公共文件则根据需求按需加载如下图\n4. 具有桌面应用的即时性、网站的可移植性和可访问性\n5. 用户体验好、快，内容的改变不需要重新加载整个页面\n6. 良好的前后端分离，分工更明确',
    answer:
      '参考答案要点：\n- SPA（single-page application），翻译过来就是单页应用 SPA 是一种网络应用程序或网站的模型，它通过动态重写当前页面来与用户交互，这种方法避免了页面之间切换打断用户体验在单页应用中，所有必要的代码（ HTML 、 JavaScript 和 CSS ）都通过单个页面的加载而检索，或者根据需要（通常是为响应用户操作）动态装载适当的资源并添加到页面页面在任何时间点都不会重新加载，也不会将控制转移到其他页面举个例子来讲就是一个杯子，早上装的牛奶，中午装的是开水，晚上装的是茶，我们发现，变的始终是杯子里的内容，而杯子始终是那个杯子结构如下图\n- 我们熟知的JS框架如 react , vue , angular , ember 都属于 SPA\n- 上面大家已经对单页面有所了解了，下面来讲讲多页应用MPA（MultiPage-page application），翻译过来就是多页应用在 MPA 中，每个页面都是一个主页面，都是独立的当我们在访问另一个页面的时候，都需要重新加载 html 、 css 、 js 文件，公共文件则根据需求按需加载如下图\n- 具有桌面应用的即时性、网站的可移植性和可访问性\n- 用户体验好、快，内容的改变不需要重新加载整个页面\n- 良好的前后端分离，分工更明确',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'Vue中的v-show和v-if怎么理解？',
    summary:
      '我们都知道在 vue 中 v-show 与 v-if 的作用效果是相同的(不含v-else)，都能控制元素在页面是否显示',
    categoryKey: 'vue',
    difficulty: Difficulty.EASY,
    tags: ['Vue', '高频题', '渲染'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/show_if.html\n\n题目：Vue中的v-show和v-if怎么理解？\n\n请结合以下要点作答：\n1. 我们都知道在 vue 中 v-show 与 v-if 的作用效果是相同的(不含v-else)，都能控制元素在页面是否显示\n2. 在用法上也是相同的\n3. 控制手段： v-show 隐藏则是为该元素添加 css--display:none ， dom 元素依旧还在。 v-if 显示隐藏是将 dom 元素整个添加或删除\n4. 当表达式为 true 的时候，都会占据页面的位置\n5. 当表达式都为 false 时，都不会占据页面位置\n6. v-show 由 false 变为 true 的时候不会触发组件的生命周期',
    answer:
      '参考答案要点：\n- 我们都知道在 vue 中 v-show 与 v-if 的作用效果是相同的(不含v-else)，都能控制元素在页面是否显示\n- 在用法上也是相同的\n- 控制手段： v-show 隐藏则是为该元素添加 css--display:none ， dom 元素依旧还在。 v-if 显示隐藏是将 dom 元素整个添加或删除\n- 当表达式为 true 的时候，都会占据页面的位置\n- 当表达式都为 false 时，都不会占据页面位置\n- v-show 由 false 变为 true 的时候不会触发组件的生命周期',
    hasExplanation: false,
    aliases: ['v-if 和 v-show 的区别'],
  },
  {
    title: 'Vue实例挂载的过程中发生了什么?',
    summary: '我们都听过知其然知其所以然这句话',
    categoryKey: 'vue',
    difficulty: Difficulty.HARD,
    tags: ['Vue', '高频题', '渲染'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/new_vue.html\n\n题目：Vue实例挂载的过程中发生了什么?\n\n请结合以下要点作答：\n1. 我们都听过知其然知其所以然这句话\n2. 那么不知道大家是否思考过 new Vue() 这个过程中究竟做了些什么？\n3. 过程中是如何完成数据的绑定，又是如何将数据渲染到视图的等等\n4. 在调用 beforeCreate 之前，数据初始化并未完成，像 data 、 props 这些属性无法访问到\n5. 到了 created 的时候，数据已经初始化完成，能够访问 data 、 props 这些属性，但这时候并未完成 dom 的挂载，因此无法访问到 dom 元素\n6. 挂载方法是调用 vm.$mount 方法',
    answer:
      '参考答案要点：\n- 我们都听过知其然知其所以然这句话\n- 那么不知道大家是否思考过 new Vue() 这个过程中究竟做了些什么？\n- 过程中是如何完成数据的绑定，又是如何将数据渲染到视图的等等\n- 在调用 beforeCreate 之前，数据初始化并未完成，像 data 、 props 这些属性无法访问到\n- 到了 created 的时候，数据已经初始化完成，能够访问 data 、 props 这些属性，但这时候并未完成 dom 的挂载，因此无法访问到 dom 元素\n- 挂载方法是调用 vm.$mount 方法',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '说说你对Vue生命周期的理解?',
    summary:
      '生命周期 （Life Cycle） 的概念应用很广泛，特别是在政治、经济、环境、技术、社会等诸多领域经常出现，其基本涵义可以通俗地理解为“从摇篮到坟墓” …',
    categoryKey: 'vue',
    difficulty: Difficulty.HARD,
    tags: ['Vue', '高频题', '生命周期'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/lifecycle.html\n\n题目：说说你对Vue生命周期的理解?\n\n请结合以下要点作答：\n1. 生命周期 （Life Cycle） 的概念应用很广泛，特别是在政治、经济、环境、技术、社会等诸多领域经常出现，其基本涵义可以通俗地理解为“从摇篮到坟墓” （Cradle-to-Grave） 的整个过程在 Vue 中实例从创建到销毁的过程就是生命周期，即指从创建、初始化数据、编译模板、挂载Dom→渲染、更新→渲染、卸载等一系列过程我们可以把组件比喻成工厂里面的一条流水线，每个工人（生命周期）站在各自的岗位，当任务流转到工人身边的时候，工人就开始工作PS：在 Vue 生命周期钩子会自动绑定 this 上下文到实例中，因此你可以访问数据，对 property 和方法进行运算这意味着 你不能使用箭头函数来定义一个生命周期方法 (例如 created: () => this.fetchTodos() )\n2. Vue生命周期总共可以分为8个阶段：创建前后, 载入前后,更新前后,销毁前销毁后，以及一些特殊场景的生命周期\n3. Vue 生命周期流程图\n4. 初始化 vue 实例，进行数据观测\n5. 完成数据观测，属性与方法的运算， watch 、 event 事件回调的配置\n6. 可调用 methods 中的方法，访问和修改data数据触发响应式渲染 dom ，可通过 computed 和 watch 完成数据计算',
    answer:
      '参考答案要点：\n- 生命周期 （Life Cycle） 的概念应用很广泛，特别是在政治、经济、环境、技术、社会等诸多领域经常出现，其基本涵义可以通俗地理解为“从摇篮到坟墓” （Cradle-to-Grave） 的整个过程在 Vue 中实例从创建到销毁的过程就是生命周期，即指从创建、初始化数据、编译模板、挂载Dom→渲染、更新→渲染、卸载等一系列过程我们可以把组件比喻成工厂里面的一条流水线，每个工人（生命周期）站在各自的岗位，当任务流转到工人身边的时候，工人就开始工作PS：在 Vue 生命周期钩子会自动绑定 this 上下文到实例中，因此你可以访问数据，对 property 和方法进行运算这意味着 你不能使用箭头函数来定义一个生命周期方法 (例如 created: () => this.fetchTodos() )\n- Vue生命周期总共可以分为8个阶段：创建前后, 载入前后,更新前后,销毁前销毁后，以及一些特殊场景的生命周期\n- Vue 生命周期流程图\n- 初始化 vue 实例，进行数据观测\n- 完成数据观测，属性与方法的运算， watch 、 event 事件回调的配置\n- 可调用 methods 中的方法，访问和修改data数据触发响应式渲染 dom ，可通过 computed 和 watch 完成数据计算',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '为什么Vue中的v-if和v-for不建议一起用?',
    summary:
      'v-if 指令用于条件性地渲染一块内容。这块内容只会在指令的表达式返回 true 值的时候被渲染',
    categoryKey: 'vue',
    difficulty: Difficulty.EASY,
    tags: ['Vue', '高频题', '渲染'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/if_for.html\n\n题目：为什么Vue中的v-if和v-for不建议一起用?\n\n请结合以下要点作答：\n1. v-if 指令用于条件性地渲染一块内容。这块内容只会在指令的表达式返回 true 值的时候被渲染\n2. v-for 指令基于一个数组来渲染一个列表。 v-for 指令需要使用 item in items 形式的特殊语法，其中 items 是源数据数组或者对象，而 item 则是被迭代的数组元素的别名\n3. 在 v-for 的时候，建议设置 key 值，并且保证每个 key 值是独一无二的，这便于 diff 算法进行优化\n4. 永远不要把 v-if 和 v-for 同时用在同一个元素上，带来性能方面的浪费（每次渲染都会先循环再进行条件判断）\n5. 如果避免出现这种情况，则在外层嵌套 template （页面渲染不生成 dom 节点），在这一层进行v-if判断，然后在内部进行v-for循环\n6. 如果条件出现在循环内部，可通过计算属性 computed 提前过滤掉那些不需要显示的项',
    answer:
      '参考答案要点：\n- v-if 指令用于条件性地渲染一块内容。这块内容只会在指令的表达式返回 true 值的时候被渲染\n- v-for 指令基于一个数组来渲染一个列表。 v-for 指令需要使用 item in items 形式的特殊语法，其中 items 是源数据数组或者对象，而 item 则是被迭代的数组元素的别名\n- 在 v-for 的时候，建议设置 key 值，并且保证每个 key 值是独一无二的，这便于 diff 算法进行优化\n- 永远不要把 v-if 和 v-for 同时用在同一个元素上，带来性能方面的浪费（每次渲染都会先循环再进行条件判断）\n- 如果避免出现这种情况，则在外层嵌套 template （页面渲染不生成 dom 节点），在这一层进行v-if判断，然后在内部进行v-for循环\n- 如果条件出现在循环内部，可通过计算属性 computed 提前过滤掉那些不需要显示的项',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'SPA（单页应用）首屏加载速度慢怎么解决？',
    summary:
      '首屏时间（First Contentful Paint），指的是浏览器从响应用户输入网址地址，到首屏内容渲染完成的时间，此时整个网页不一定要全部渲染完成，…',
    categoryKey: 'vue',
    difficulty: Difficulty.MEDIUM,
    tags: ['Vue', '高频题', '渲染'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/first_page_time.html\n\n题目：SPA（单页应用）首屏加载速度慢怎么解决？\n\n请结合以下要点作答：\n1. 首屏时间（First Contentful Paint），指的是浏览器从响应用户输入网址地址，到首屏内容渲染完成的时间，此时整个网页不一定要全部渲染完成，但需要展示当前视窗需要的内容\n2. 首屏加载可以说是用户体验中 最重要 的环节\n3. 利用 performance.timing 提供的数据：\n4. 资源文件体积是否过大\n5. 资源是否重复发送请求去加载了\n6. 加载脚本的时候，渲染内容堵塞了',
    answer:
      '参考答案要点：\n- 首屏时间（First Contentful Paint），指的是浏览器从响应用户输入网址地址，到首屏内容渲染完成的时间，此时整个网页不一定要全部渲染完成，但需要展示当前视窗需要的内容\n- 首屏加载可以说是用户体验中 最重要 的环节\n- 利用 performance.timing 提供的数据：\n- 资源文件体积是否过大\n- 资源是否重复发送请求去加载了\n- 加载脚本的时候，渲染内容堵塞了',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '为什么data属性是一个函数而不是一个对象？',
    summary: 'vue 实例的时候定义 data 属性既可以是一个对象，也可以是一个函数',
    categoryKey: 'vue',
    difficulty: Difficulty.EASY,
    tags: ['Vue', '高频题', '响应式'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/data.html\n\n题目：为什么data属性是一个函数而不是一个对象？\n\n请结合以下要点作答：\n1. vue 实例的时候定义 data 属性既可以是一个对象，也可以是一个函数\n2. 组件中定义 data 属性，只能是一个函数\n3. 如果为组件 data 直接定义为一个对象\n4. 根实例对象 data 可以是对象也可以是函数（根实例是单例），不会产生数据污染情况\n5. 组件实例对象 data 必须为函数，目的是为了防止多个组件实例对象之间共用一个 data ，产生数据污染。采用函数的形式， initData 时会将其作为工厂函数都会返回全新 data 对象',
    answer:
      '参考答案要点：\n- vue 实例的时候定义 data 属性既可以是一个对象，也可以是一个函数\n- 组件中定义 data 属性，只能是一个函数\n- 如果为组件 data 直接定义为一个对象\n- 根实例对象 data 可以是对象也可以是函数（根实例是单例），不会产生数据污染情况\n- 组件实例对象 data 必须为函数，目的是为了防止多个组件实例对象之间共用一个 data ，产生数据污染。采用函数的形式， initData 时会将其作为工厂函数都会返回全新 data 对象',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'Vue中给对象添加新属性界面不刷新?',
    summary: '我们从一个例子开始',
    categoryKey: 'vue',
    difficulty: Difficulty.MEDIUM,
    tags: ['Vue', '高频题'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/data_object_add_attrs.html\n\n题目：Vue中给对象添加新属性界面不刷新?\n\n请结合以下要点作答：\n1. 我们从一个例子开始\n2. 定义一个 p 标签，通过 v-for 指令进行遍历\n3. 然后给 botton 标签绑定点击事件，我们预期点击按钮时，数据新增一个属性，界面也 新增一行\n4. Vue.set()\n5. Object.assign()\n6. $forcecUpdated()',
    answer:
      '参考答案要点：\n- 我们从一个例子开始\n- 定义一个 p 标签，通过 v-for 指令进行遍历\n- 然后给 botton 标签绑定点击事件，我们预期点击按钮时，数据新增一个属性，界面也 新增一行\n- Vue.set()\n- Object.assign()\n- $forcecUpdated()',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'Vue中组件和插件有什么区别？',
    summary: '回顾以前对组件的定义：',
    categoryKey: 'vue',
    difficulty: Difficulty.EASY,
    tags: ['Vue', '高频题', '组件'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/components_plugin.html\n\n题目：Vue中组件和插件有什么区别？\n\n请结合以下要点作答：\n1. 回顾以前对组件的定义：\n2. 组件就是把图形、非图形的各种逻辑均抽象为一个统一的概念（组件）来实现开发的模式，在 Vue 中每一个 .vue 文件都可以视为一个组件\n3. 降低整个系统的耦合度，在保持接口不变的情况下，我们可以替换不同的组件快速完成需求，例如输入框，可以替换为日历、时间、范围等组件作具体的实现\n4. 调试方便，由于整个系统是通过组件组合起来的，在出现问题的时候，可以用排除法直接移除组件，或者根据报错的组件快速定位问题，之所以能够快速定位，是因为每个组件之间低耦合，职责单一，所以逻辑会比分析整个系统要简单\n5. 提高可维护性，由于每个组件的职责单一，并且组件在系统中是被复用的，所以对代码进行优化可获得系统的整体升级\n6. 添加全局方法或者属性。如: vue-custom-element',
    answer:
      '参考答案要点：\n- 回顾以前对组件的定义：\n- 组件就是把图形、非图形的各种逻辑均抽象为一个统一的概念（组件）来实现开发的模式，在 Vue 中每一个 .vue 文件都可以视为一个组件\n- 降低整个系统的耦合度，在保持接口不变的情况下，我们可以替换不同的组件快速完成需求，例如输入框，可以替换为日历、时间、范围等组件作具体的实现\n- 调试方便，由于整个系统是通过组件组合起来的，在出现问题的时候，可以用排除法直接移除组件，或者根据报错的组件快速定位问题，之所以能够快速定位，是因为每个组件之间低耦合，职责单一，所以逻辑会比分析整个系统要简单\n- 提高可维护性，由于每个组件的职责单一，并且组件在系统中是被复用的，所以对代码进行优化可获得系统的整体升级\n- 添加全局方法或者属性。如: vue-custom-element',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'Vue组件间通信方式都有哪些?',
    summary: '开始之前，我们把 组件间通信 这个词进行拆分',
    categoryKey: 'vue',
    difficulty: Difficulty.HARD,
    tags: ['Vue', '高频题', '组件通信', '组件'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/communication.html\n\n题目：Vue组件间通信方式都有哪些?\n\n请结合以下要点作答：\n1. 开始之前，我们把 组件间通信 这个词进行拆分\n2. 都知道组件是 vue 最强大的功能之一， vue 中每一个 .vue 我们都可以视之为一个组件通信指的是发送者通过某种媒体以某种格式来传递信息到收信者以达到某个目的。广义上，任何信息的交通都是通信 组件间通信 即指组件( .vue )通过某种方式来传递信息以达到某个目的举个栗子我们在使用 UI 框架中的 table 组件，可能会往 table 组件中传入某些数据，这个本质就形成了组件之间的通信\n3. 在古代，人们通过驿站、飞鸽传书、烽火报警、符号、语言、眼神、触碰等方式进行信息传递，到了今天，随着科技水平的飞速发展，通信基本完全利用有线或无线电完成，相继出现了有线电话、固定电话、无线电话、手机、互联网甚至视频电话等各种通信方式从上面这段话，我们可以看到通信的本质是信息同步，共享回到 vue 中，每个组件之间的都有独自的作用域，组件间的数据是无法共享的但实际开发工作中我们常常需要让组件之间共享数据，这也是组件通信的目的要让它们互相之间能进行通讯，这样才能构成一个有机的完整系统\n4. 父子组件之间的通信\n5. 兄弟组件之间的通信\n6. 祖孙与后代组件之间的通信',
    answer:
      '参考答案要点：\n- 开始之前，我们把 组件间通信 这个词进行拆分\n- 都知道组件是 vue 最强大的功能之一， vue 中每一个 .vue 我们都可以视之为一个组件通信指的是发送者通过某种媒体以某种格式来传递信息到收信者以达到某个目的。广义上，任何信息的交通都是通信 组件间通信 即指组件( .vue )通过某种方式来传递信息以达到某个目的举个栗子我们在使用 UI 框架中的 table 组件，可能会往 table 组件中传入某些数据，这个本质就形成了组件之间的通信\n- 在古代，人们通过驿站、飞鸽传书、烽火报警、符号、语言、眼神、触碰等方式进行信息传递，到了今天，随着科技水平的飞速发展，通信基本完全利用有线或无线电完成，相继出现了有线电话、固定电话、无线电话、手机、互联网甚至视频电话等各种通信方式从上面这段话，我们可以看到通信的本质是信息同步，共享回到 vue 中，每个组件之间的都有独自的作用域，组件间的数据是无法共享的但实际开发工作中我们常常需要让组件之间共享数据，这也是组件通信的目的要让它们互相之间能进行通讯，这样才能构成一个有机的完整系统\n- 父子组件之间的通信\n- 兄弟组件之间的通信\n- 祖孙与后代组件之间的通信',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '说说你对双向绑定的理解?',
    summary:
      '我们先从单向绑定切入单向绑定非常简单，就是把 Model 绑定到 View ，当我们用 JavaScript 代码更新 Model 时， View 就会自…',
    categoryKey: 'vue',
    difficulty: Difficulty.MEDIUM,
    tags: ['Vue', '高频题', '响应式'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/bind.html\n\n题目：说说你对双向绑定的理解?\n\n请结合以下要点作答：\n1. 我们先从单向绑定切入单向绑定非常简单，就是把 Model 绑定到 View ，当我们用 JavaScript 代码更新 Model 时， View 就会自动更新双向绑定就很容易联想到了，在单向绑定的基础上，用户更新了 View ， Model 的数据也自动被更新了，这种情况就是双向绑定举个栗子\n2. 当用户填写表单时， View 的状态就被更新了，如果此时可以自动更新 Model 的状态，那就相当于我们把 Model 和 View 做了双向绑定关系图如下\n3. 我们都知道 Vue 是数据双向绑定的框架，双向绑定由三个重要部分构成\n4. 数据层（Model）：应用的数据及业务逻辑\n5. 视图层（View）：应用的展示效果，各类UI组件\n6. 业务逻辑层（ViewModel）：框架封装的核心，它负责将数据与视图关联起来',
    answer:
      '参考答案要点：\n- 我们先从单向绑定切入单向绑定非常简单，就是把 Model 绑定到 View ，当我们用 JavaScript 代码更新 Model 时， View 就会自动更新双向绑定就很容易联想到了，在单向绑定的基础上，用户更新了 View ， Model 的数据也自动被更新了，这种情况就是双向绑定举个栗子\n- 当用户填写表单时， View 的状态就被更新了，如果此时可以自动更新 Model 的状态，那就相当于我们把 Model 和 View 做了双向绑定关系图如下\n- 我们都知道 Vue 是数据双向绑定的框架，双向绑定由三个重要部分构成\n- 数据层（Model）：应用的数据及业务逻辑\n- 视图层（View）：应用的展示效果，各类UI组件\n- 业务逻辑层（ViewModel）：框架封装的核心，它负责将数据与视图关联起来',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '说说你对nexttick的理解?',
    summary:
      '在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM',
    categoryKey: 'vue',
    difficulty: Difficulty.EASY,
    tags: ['Vue', '高频题', '响应式'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/nexttick.html\n\n题目：说说你对nexttick的理解?\n\n请结合以下要点作答：\n1. 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM\n2. 我们可以理解成， Vue 在更新 DOM 时是异步执行的。当数据发生变化， Vue 将开启一个异步更新队列，视图需要等队列中所有数据变化完成之后，再统一进行更新\n3. 构建一个 vue 实例\n4. 把回调函数放入callbacks等待执行\n5. 将执行函数放到微任务或者宏任务中\n6. 事件循环到了微任务或者宏任务，执行函数依次执行callbacks中的回调',
    answer:
      '参考答案要点：\n- 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM\n- 我们可以理解成， Vue 在更新 DOM 时是异步执行的。当数据发生变化， Vue 将开启一个异步更新队列，视图需要等队列中所有数据变化完成之后，再统一进行更新\n- 构建一个 vue 实例\n- 把回调函数放入callbacks等待执行\n- 将执行函数放到微任务或者宏任务中\n- 事件循环到了微任务或者宏任务，执行函数依次执行callbacks中的回调',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '说说你对vue的mixin的理解，有什么应用场景？',
    summary:
      'Mixin 是面向对象程序设计语言中的类，提供了方法的实现。其他类可以访问 mixin 类的方法而不必成为其子类',
    categoryKey: 'vue',
    difficulty: Difficulty.MEDIUM,
    tags: ['Vue', '高频题'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/mixin.html\n\n题目：说说你对vue的mixin的理解，有什么应用场景？\n\n请结合以下要点作答：\n1. Mixin 是面向对象程序设计语言中的类，提供了方法的实现。其他类可以访问 mixin 类的方法而不必成为其子类\n2. Mixin 类通常作为功能模块使用，在需要该功能时“混入”，有利于代码复用又避免了多继承的复杂\n3. 先来看一下官方定义\n4. 优先递归处理 mixins\n5. 先遍历合并 parent 中的 key ，调用 mergeField 方法进行合并，然后保存在变量 options\n6. 再遍历 child ，合并补上 parent 中没有的 key ，调用 mergeField 方法进行合并，保存在变量 options',
    answer:
      '参考答案要点：\n- Mixin 是面向对象程序设计语言中的类，提供了方法的实现。其他类可以访问 mixin 类的方法而不必成为其子类\n- Mixin 类通常作为功能模块使用，在需要该功能时“混入”，有利于代码复用又避免了多继承的复杂\n- 先来看一下官方定义\n- 优先递归处理 mixins\n- 先遍历合并 parent 中的 key ，调用 mergeField 方法进行合并，然后保存在变量 options\n- 再遍历 child ，合并补上 parent 中没有的 key ，调用 mergeField 方法进行合并，保存在变量 options',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '说说你对slot的理解？slot使用场景有哪些？',
    summary: '在HTML中 slot 元素 ，作为 Web Components 技术套件的一部分，是Web组件内的一个占位符',
    categoryKey: 'vue',
    difficulty: Difficulty.EASY,
    tags: ['Vue', '高频题', '组件'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/slot.html\n\n题目：说说你对slot的理解？slot使用场景有哪些？\n\n请结合以下要点作答：\n1. 在HTML中 slot 元素 ，作为 Web Components 技术套件的一部分，是Web组件内的一个占位符\n2. 该占位符可以在后期使用自己的标记语言填充\n3. template 不会展示到页面中，需要用先获取它的引用，然后添加到 DOM 中，\n4. v-slot 属性只能在 <template> 上使用，但在只有默认插槽时可以在组件标签上使用\n5. 默认插槽名为 default ，可以省略default直接写 v-slot\n6. 缩写为 # 时不能不写参数，写成 #default',
    answer:
      '参考答案要点：\n- 在HTML中 slot 元素 ，作为 Web Components 技术套件的一部分，是Web组件内的一个占位符\n- 该占位符可以在后期使用自己的标记语言填充\n- template 不会展示到页面中，需要用先获取它的引用，然后添加到 DOM 中，\n- v-slot 属性只能在 <template> 上使用，但在只有默认插槽时可以在组件标签上使用\n- 默认插槽名为 default ，可以省略default直接写 v-slot\n- 缩写为 # 时不能不写参数，写成 #default',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'Vue.observable你有了解过吗？说说看',
    summary: 'Observable 翻译过来我们可以理解成 可观察的',
    categoryKey: 'vue',
    difficulty: Difficulty.EASY,
    tags: ['Vue', '高频题', '响应式'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/observable.html\n\n题目：Vue.observable你有了解过吗？说说看\n\n请结合以下要点作答：\n1. Observable 翻译过来我们可以理解成 可观察的\n2. 我们先来看一下其在 Vue 中的定义\n3. Vue.observable ，让一个对象变成响应式数据。 Vue 内部会用它来处理 data 函数返回的对象',
    answer:
      '参考答案要点：\n- Observable 翻译过来我们可以理解成 可观察的\n- 我们先来看一下其在 Vue 中的定义\n- Vue.observable ，让一个对象变成响应式数据。 Vue 内部会用它来处理 data 函数返回的对象',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '你知道vue中key的原理吗？说说你对它的理解？',
    summary: '开始之前，我们先还原两个实际工作场景',
    categoryKey: 'vue',
    difficulty: Difficulty.EASY,
    tags: ['Vue', '高频题'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/key.html\n\n题目：你知道vue中key的原理吗？说说你对它的理解？\n\n请结合以下要点作答：\n1. 开始之前，我们先还原两个实际工作场景\n2. 那么这背后的逻辑是什么， key 的作用又是什么？\n3. key是给每一个vnode的唯一id，也是diff的一种优化策略，可以根据key，更准确， 更快的找到对应的vnode节点\n4. 当我们在使用 v-for 时，需要给单元加上 key\n5. 用 +new Date() 生成的时间戳作为 key ，手动强制触发重新渲染\n6. 如果不用key，Vue会采用就地复地原则：最小化element的移动，并且会尝试尽最大程度在同适当的地方对相同类型的element，做patch或者reuse。',
    answer:
      '参考答案要点：\n- 开始之前，我们先还原两个实际工作场景\n- 那么这背后的逻辑是什么， key 的作用又是什么？\n- key是给每一个vnode的唯一id，也是diff的一种优化策略，可以根据key，更准确， 更快的找到对应的vnode节点\n- 当我们在使用 v-for 时，需要给单元加上 key\n- 用 +new Date() 生成的时间戳作为 key ，手动强制触发重新渲染\n- 如果不用key，Vue会采用就地复地原则：最小化element的移动，并且会尝试尽最大程度在同适当的地方对相同类型的element，做patch或者reuse。',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '怎么缓存当前的组件？缓存后怎么更新？说说你对keep-alive的理解是什么？',
    summary:
      'keep-alive 是 vue 中的内置组件，能在组件切换过程中将状态保留在内存中，防止重复渲染 DOM',
    categoryKey: 'vue',
    difficulty: Difficulty.HARD,
    tags: ['Vue', '高频题', '组件'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/keepalive.html\n\n题目：怎么缓存当前的组件？缓存后怎么更新？说说你对keep-alive的理解是什么？\n\n请结合以下要点作答：\n1. keep-alive 是 vue 中的内置组件，能在组件切换过程中将状态保留在内存中，防止重复渲染 DOM\n2. keep-alive 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们\n3. keep-alive 可以设置以下 props 属性：\n4. include - 字符串或正则表达式。只有名称匹配的组件会被缓存\n5. exclude - 字符串或正则表达式。任何名称匹配的组件都不会被缓存\n6. max - 数字。最多可以缓存多少组件实例',
    answer:
      '参考答案要点：\n- keep-alive 是 vue 中的内置组件，能在组件切换过程中将状态保留在内存中，防止重复渲染 DOM\n- keep-alive 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们\n- keep-alive 可以设置以下 props 属性：\n- include - 字符串或正则表达式。只有名称匹配的组件会被缓存\n- exclude - 字符串或正则表达式。任何名称匹配的组件都不会被缓存\n- max - 数字。最多可以缓存多少组件实例',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'Vue常用的修饰符有哪些？有什么应用场景？',
    summary: '在程序世界里，修饰符是用于限定类型以及类型成员的声明的一种符号',
    categoryKey: 'vue',
    difficulty: Difficulty.EASY,
    tags: ['Vue', '高频题', '组件'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/modifier.html\n\n题目：Vue常用的修饰符有哪些？有什么应用场景？\n\n请结合以下要点作答：\n1. 在程序世界里，修饰符是用于限定类型以及类型成员的声明的一种符号\n2. 在 Vue 中，修饰符处理了许多 DOM 事件的细节，让我们不再需要花大量的时间去处理这些烦恼的事情，而能有更多的精力专注于程序的逻辑处理\n3. vue 中修饰符分为以下五种：\n4. v-bind修饰符\n5. left 左键点击\n6. right 右键点击',
    answer:
      '参考答案要点：\n- 在程序世界里，修饰符是用于限定类型以及类型成员的声明的一种符号\n- 在 Vue 中，修饰符处理了许多 DOM 事件的细节，让我们不再需要花大量的时间去处理这些烦恼的事情，而能有更多的精力专注于程序的逻辑处理\n- vue 中修饰符分为以下五种：\n- v-bind修饰符\n- left 左键点击\n- right 右键点击',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '你有写过自定义指令吗？自定义指令的应用场景有哪些？',
    summary: '开始之前我们先学习一下指令系统这个词',
    categoryKey: 'vue',
    difficulty: Difficulty.MEDIUM,
    tags: ['Vue', '高频题', '组件'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/directive.html\n\n题目：你有写过自定义指令吗？自定义指令的应用场景有哪些？\n\n请结合以下要点作答：\n1. 开始之前我们先学习一下指令系统这个词\n2. 指令系统 是计算机硬件的语言系统，也叫机器语言，它是系统程序员看到的计算机的主要属性。因此指令系统表征了计算机的基本功能决定了机器所要求的能力\n3. 在 vue 中提供了一套为数据驱动视图更为方便的操作，这些操作被称为指令系统\n4. bind ：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置\n5. inserted ：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)\n6. update ：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新',
    answer:
      '参考答案要点：\n- 开始之前我们先学习一下指令系统这个词\n- 指令系统 是计算机硬件的语言系统，也叫机器语言，它是系统程序员看到的计算机的主要属性。因此指令系统表征了计算机的基本功能决定了机器所要求的能力\n- 在 vue 中提供了一套为数据驱动视图更为方便的操作，这些操作被称为指令系统\n- bind ：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置\n- inserted ：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)\n- update ：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'Vue中的过滤器了解吗？过滤器的应用场景有哪些？',
    summary: '过滤器（ filter ）是输送介质管道上不可缺少的一种装置',
    categoryKey: 'vue',
    difficulty: Difficulty.EASY,
    tags: ['Vue', '高频题'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/filter.html\n\n题目：Vue中的过滤器了解吗？过滤器的应用场景有哪些？\n\n请结合以下要点作答：\n1. 过滤器（ filter ）是输送介质管道上不可缺少的一种装置\n2. 大白话，就是把一些不必要的东西过滤掉\n3. 过滤器实质不改变原始数据，只是对数据进行加工处理后返回过滤后的数据再进行调用处理，我们也可以理解其为一个纯函数\n4. 部过滤器优先于全局过滤器被调用\n5. 一个表达式可以使用多个过滤器。过滤器之间需要用管道符“|”隔开。其执行顺序从左往右\n6. 在编译阶段通过 parseFilters 将过滤器编译成函数调用（串联过滤器则是一个嵌套的函数调用，前一个过滤器执行的结果是后一个过滤器函数的参数）',
    answer:
      '参考答案要点：\n- 过滤器（ filter ）是输送介质管道上不可缺少的一种装置\n- 大白话，就是把一些不必要的东西过滤掉\n- 过滤器实质不改变原始数据，只是对数据进行加工处理后返回过滤后的数据再进行调用处理，我们也可以理解其为一个纯函数\n- 部过滤器优先于全局过滤器被调用\n- 一个表达式可以使用多个过滤器。过滤器之间需要用管道符“|”隔开。其执行顺序从左往右\n- 在编译阶段通过 parseFilters 将过滤器编译成函数调用（串联过滤器则是一个嵌套的函数调用，前一个过滤器执行的结果是后一个过滤器函数的参数）',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '什么是虚拟DOM？如何实现一个虚拟DOM？说说你的思路',
    summary:
      '虚拟 DOM （ Virtual DOM ）这个概念相信大家都不陌生，从 React 到 Vue ，虚拟 DOM 为这两个框架都带来了跨平台的能力（ Re…',
    categoryKey: 'vue',
    difficulty: Difficulty.HARD,
    tags: ['Vue', '高频题', '渲染'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/vnode.html\n\n题目：什么是虚拟DOM？如何实现一个虚拟DOM？说说你的思路\n\n请结合以下要点作答：\n1. 虚拟 DOM （ Virtual DOM ）这个概念相信大家都不陌生，从 React 到 Vue ，虚拟 DOM 为这两个框架都带来了跨平台的能力（ React-Native 和 Weex ）\n2. 实际上它只是一层对真实 DOM 的抽象，以 JavaScript 对象 ( VNode 节点) 作为基础的树，用对象的属性来描述节点，最终可以通过一系列操作使这棵树映射到真实环境上\n3. 在 Javascript 对象中，虚拟 DOM 表现为一个 Object 对象。并且最少包含标签名 ( tag )、属性 ( attrs ) 和子元素对象 ( children ) 三个属性，不同框架对这三个属性的名命可能会有差别\n4. 所有对象的 context 选项都指向了 Vue 实例\n5. elm 属性则指向了其相对应的真实 DOM 节点\n6. context 表示 VNode 的上下文环境，是 Component 类型',
    answer:
      '参考答案要点：\n- 虚拟 DOM （ Virtual DOM ）这个概念相信大家都不陌生，从 React 到 Vue ，虚拟 DOM 为这两个框架都带来了跨平台的能力（ React-Native 和 Weex ）\n- 实际上它只是一层对真实 DOM 的抽象，以 JavaScript 对象 ( VNode 节点) 作为基础的树，用对象的属性来描述节点，最终可以通过一系列操作使这棵树映射到真实环境上\n- 在 Javascript 对象中，虚拟 DOM 表现为一个 Object 对象。并且最少包含标签名 ( tag )、属性 ( attrs ) 和子元素对象 ( children ) 三个属性，不同框架对这三个属性的名命可能会有差别\n- 所有对象的 context 选项都指向了 Vue 实例\n- elm 属性则指向了其相对应的真实 DOM 节点\n- context 表示 VNode 的上下文环境，是 Component 类型',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '你了解vue的diff算法吗？说说看',
    summary: 'diff 算法是一种通过同层的树节点进行比较的高效算法',
    categoryKey: 'vue',
    difficulty: Difficulty.HARD,
    tags: ['Vue', '高频题', '渲染'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/diff.html\n\n题目：你了解vue的diff算法吗？说说看\n\n请结合以下要点作答：\n1. diff 算法是一种通过同层的树节点进行比较的高效算法\n2. diff 算法在很多场景下都有应用，在 vue 中，作用于虚拟 dom 渲染成真实 dom 的新旧 VNode 节点比较\n3. diff 整体策略为：深度优先，同层比较\n4. 比较只会在同层级进行, 不会跨层级比较\n5. 在diff比较的过程中，循环从两边向中间比较\n6. 比较的过程中，循环从两边向中间收拢',
    answer:
      '参考答案要点：\n- diff 算法是一种通过同层的树节点进行比较的高效算法\n- diff 算法在很多场景下都有应用，在 vue 中，作用于虚拟 dom 渲染成真实 dom 的新旧 VNode 节点比较\n- diff 整体策略为：深度优先，同层比较\n- 比较只会在同层级进行, 不会跨层级比较\n- 在diff比较的过程中，循环从两边向中间比较\n- 比较的过程中，循环从两边向中间收拢',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'Vue项目中有封装过axios吗？主要是封装哪方面的？',
    summary: 'axios 是一个轻量的 HTTP 客户端',
    categoryKey: 'vue',
    difficulty: Difficulty.MEDIUM,
    tags: ['Vue', '高频题', '工程化'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/axios.html\n\n题目：Vue项目中有封装过axios吗？主要是封装哪方面的？\n\n请结合以下要点作答：\n1. axios 是一个轻量的 HTTP 客户端\n2. 基于 XMLHttpRequest 服务来执行 HTTP 请求，支持丰富的配置，支持 Promise ，支持浏览器端和 Node.js 端。自 Vue 2.0起，尤大宣布取消对 vue-resource 的官方推荐，转而推荐 axios 。现在 axios 已经成为大部分 Vue 开发者的首选\n3. 并发请求 axios.all([])\n4. 从浏览器中创建 XMLHttpRequests\n5. 从 node.js 创建 http 请求\n6. 支持 Promise API',
    answer:
      '参考答案要点：\n- axios 是一个轻量的 HTTP 客户端\n- 基于 XMLHttpRequest 服务来执行 HTTP 请求，支持丰富的配置，支持 Promise ，支持浏览器端和 Node.js 端。自 Vue 2.0起，尤大宣布取消对 vue-resource 的官方推荐，转而推荐 axios 。现在 axios 已经成为大部分 Vue 开发者的首选\n- 并发请求 axios.all([])\n- 从浏览器中创建 XMLHttpRequests\n- 从 node.js 创建 http 请求\n- 支持 Promise API',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '你了解axios的原理吗？有看过它的源码吗？',
    summary: '关于 axios 的基本使用，上篇文章已经有所涉及，这里再稍微回顾下：',
    categoryKey: 'vue',
    difficulty: Difficulty.HARD,
    tags: ['Vue', '高频题', '工程化'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/axiosCode.html\n\n题目：你了解axios的原理吗？有看过它的源码吗？\n\n请结合以下要点作答：\n1. 关于 axios 的基本使用，上篇文章已经有所涉及，这里再稍微回顾下：\n2. 构建一个 Axios 构造函数，核心代码为 request\n3. 导出 axios 实例\n4. 默认配置 defaults.js\n5. config.method 默认为 get\n6. 调用 createInstance 方法创建 axios 实例，传入的 config',
    answer:
      '参考答案要点：\n- 关于 axios 的基本使用，上篇文章已经有所涉及，这里再稍微回顾下：\n- 构建一个 Axios 构造函数，核心代码为 request\n- 导出 axios 实例\n- 默认配置 defaults.js\n- config.method 默认为 get\n- 调用 createInstance 方法创建 axios 实例，传入的 config',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'SSR解决了什么问题？有做过SSR吗？你是怎么做的？',
    summary: 'Server-Side Rendering 我们称其为 SSR ，意为服务端渲染',
    categoryKey: 'vue',
    difficulty: Difficulty.HARD,
    tags: ['Vue', '高频题', '工程化'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/ssr.html\n\n题目：SSR解决了什么问题？有做过SSR吗？你是怎么做的？\n\n请结合以下要点作答：\n1. Server-Side Rendering 我们称其为 SSR ，意为服务端渲染\n2. 指由服务侧完成页面的 HTML 结构拼接的页面处理技术，发送到浏览器，然后为其绑定状态与事件，成为完全可交互页面的过程\n3. 先来看看 Web 3个阶段的发展史：\n4. 传统服务端渲染SSR\n5. 单页面应用SPA\n6. 服务端渲染SSR',
    answer:
      '参考答案要点：\n- Server-Side Rendering 我们称其为 SSR ，意为服务端渲染\n- 指由服务侧完成页面的 HTML 结构拼接的页面处理技术，发送到浏览器，然后为其绑定状态与事件，成为完全可交互页面的过程\n- 先来看看 Web 3个阶段的发展史：\n- 传统服务端渲染SSR\n- 单页面应用SPA\n- 服务端渲染SSR',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '说下你的vue项目的目录结构，如果是大型项目你该怎么划分结构和划分组件呢？',
    summary:
      '使用 vue 构建项目，项目结构清晰会提高开发效率，熟悉项目的各种配置同样会让开发效率更高',
    categoryKey: 'vue',
    difficulty: Difficulty.HARD,
    tags: ['Vue', '高频题', '工程化', '组件'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/structure.html\n\n题目：说下你的vue项目的目录结构，如果是大型项目你该怎么划分结构和划分组件呢？\n\n请结合以下要点作答：\n1. 使用 vue 构建项目，项目结构清晰会提高开发效率，熟悉项目的各种配置同样会让开发效率更高\n2. 在划分项目结构的时候，需要遵循一些基本的原则：\n3. 我们的目录结构都会有一个文件夹是按照路由模块来划分的，如 pages 文件夹，这个文件夹里面应该包含我们项目所有的路由模块，并且仅应该包含路由模块，而不应该有别的其他的非路由模块的文件夹\n4. 文件夹和文件夹内部文件的语义一致性\n5. 就近原则，紧耦合的文件应该放到一起，且应以相对路径引用\n6. 公共的文件应该以绝对路径的方式从根目录引用',
    answer:
      '参考答案要点：\n- 使用 vue 构建项目，项目结构清晰会提高开发效率，熟悉项目的各种配置同样会让开发效率更高\n- 在划分项目结构的时候，需要遵循一些基本的原则：\n- 我们的目录结构都会有一个文件夹是按照路由模块来划分的，如 pages 文件夹，这个文件夹里面应该包含我们项目所有的路由模块，并且仅应该包含路由模块，而不应该有别的其他的非路由模块的文件夹\n- 文件夹和文件夹内部文件的语义一致性\n- 就近原则，紧耦合的文件应该放到一起，且应以相对路径引用\n- 公共的文件应该以绝对路径的方式从根目录引用',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'vue要做权限管理该怎么做？如果控制到按钮级别的权限怎么做？',
    summary: '权限是对特定资源的访问许可，所谓权限控制，也就是确保用户只能访问到被分配的资源',
    categoryKey: 'vue',
    difficulty: Difficulty.HARD,
    tags: ['Vue', '高频题', '工程化'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/permission.html\n\n题目：vue要做权限管理该怎么做？如果控制到按钮级别的权限怎么做？\n\n请结合以下要点作答：\n1. 权限是对特定资源的访问许可，所谓权限控制，也就是确保用户只能访问到被分配的资源\n2. 而前端权限归根结底是请求的发起权，请求的发起可能有下面两种形式触发\n3. 总的来说，所有的请求发起都触发自前端路由或视图\n4. 页面上的按钮点击触发\n5. 路由方面，用户登录后只能看到自己有权访问的导航菜单，也只能访问自己有权访问的路由地址，否则将跳转 4xx 提示页\n6. 视图方面，用户只能看到自己有权浏览的内容和有权操作的控件',
    answer:
      '参考答案要点：\n- 权限是对特定资源的访问许可，所谓权限控制，也就是确保用户只能访问到被分配的资源\n- 而前端权限归根结底是请求的发起权，请求的发起可能有下面两种形式触发\n- 总的来说，所有的请求发起都触发自前端路由或视图\n- 页面上的按钮点击触发\n- 路由方面，用户登录后只能看到自己有权访问的导航菜单，也只能访问自己有权访问的路由地址，否则将跳转 4xx 提示页\n- 视图方面，用户只能看到自己有权浏览的内容和有权操作的控件',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'Vue项目中你是如何解决跨域的呢？',
    summary: '跨域本质是浏览器基于 同源策略 的一种安全手段',
    categoryKey: 'vue',
    difficulty: Difficulty.HARD,
    tags: ['Vue', '高频题', '工程化'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/cors.html\n\n题目：Vue项目中你是如何解决跨域的呢？\n\n请结合以下要点作答：\n1. 跨域本质是浏览器基于 同源策略 的一种安全手段\n2. 同源策略（Sameoriginpolicy），是一种约定，它是浏览器最核心也最基本的安全功能\n3. 所谓同源（即指在同一个域）具有以下三个相同点\n4. 协议相同（protocol）\n5. 主机相同（host）\n6. 端口相同（port）',
    answer:
      '参考答案要点：\n- 跨域本质是浏览器基于 同源策略 的一种安全手段\n- 同源策略（Sameoriginpolicy），是一种约定，它是浏览器最核心也最基本的安全功能\n- 所谓同源（即指在同一个域）具有以下三个相同点\n- 协议相同（protocol）\n- 主机相同（host）\n- 端口相同（port）',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'vue项目本地开发完成后部署到服务器后报404是什么原因呢？',
    summary:
      '前后端分离开发模式下，前后端是独立布署的，前端只需要将最后的构建物上传至目标服务器的 web 容器指定的静态目录下即可',
    categoryKey: 'vue',
    difficulty: Difficulty.MEDIUM,
    tags: ['Vue', '高频题', '工程化'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/404.html\n\n题目：vue项目本地开发完成后部署到服务器后报404是什么原因呢？\n\n请结合以下要点作答：\n1. 前后端分离开发模式下，前后端是独立布署的，前端只需要将最后的构建物上传至目标服务器的 web 容器指定的静态目录下即可\n2. 我们知道 vue 项目在构建后，是生成一系列的静态文件\n3. 常规布署我们只需要将这个目录上传至目标服务器即可\n4. vue 项目在本地时运行正常，但部署到服务器中，刷新页面，出现了404错误',
    answer:
      '参考答案要点：\n- 前后端分离开发模式下，前后端是独立布署的，前端只需要将最后的构建物上传至目标服务器的 web 容器指定的静态目录下即可\n- 我们知道 vue 项目在构建后，是生成一系列的静态文件\n- 常规布署我们只需要将这个目录上传至目标服务器即可\n- vue 项目在本地时运行正常，但部署到服务器中，刷新页面，出现了404错误',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: '你是怎么处理vue项目中的错误的？',
    summary: '任何一个框架，对于错误的处理都是一种必备的能力',
    categoryKey: 'vue',
    difficulty: Difficulty.MEDIUM,
    tags: ['Vue', '高频题', '工程化'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/error.html\n\n题目：你是怎么处理vue项目中的错误的？\n\n请结合以下要点作答：\n1. 任何一个框架，对于错误的处理都是一种必备的能力\n2. 在 Vue 中，则是定义了一套对应的错误处理规则给到使用者，且在源代码级别，对部分必要的过程做了一定的错误处理。\n3. 主要的错误来源包括：\n4. 代码中本身逻辑错误\n5. 默认情况下，如果全局的 config.errorHandler 被定义，所有的错误仍会发送它，因此这些错误仍然会向单一的分析服务的地方进行汇报\n6. 如果一个组件的继承或父级从属链路中存在多个 errorCaptured 钩子，则它们将会被相同的错误逐个唤起。',
    answer:
      '参考答案要点：\n- 任何一个框架，对于错误的处理都是一种必备的能力\n- 在 Vue 中，则是定义了一套对应的错误处理规则给到使用者，且在源代码级别，对部分必要的过程做了一定的错误处理。\n- 主要的错误来源包括：\n- 代码中本身逻辑错误\n- 默认情况下，如果全局的 config.errorHandler 被定义，所有的错误仍会发送它，因此这些错误仍然会向单一的分析服务的地方进行汇报\n- 如果一个组件的继承或父级从属链路中存在多个 errorCaptured 钩子，则它们将会被相同的错误逐个唤起。',
    hasExplanation: false,
    aliases: [],
  },
  {
    title: 'Vue3有了解过吗？能说说跟Vue2的区别吗？',
    summary: '关于 vue3 的重构背景，尤大是这样说的：',
    categoryKey: 'vue',
    difficulty: Difficulty.MEDIUM,
    tags: ['Vue', '高频题', 'Vue3'],
    content:
      '来源：vue3js.cn Vue 系列\n原文：https://vue3js.cn/interview/vue/vue3_vue2.html\n\n题目：Vue3有了解过吗？能说说跟Vue2的区别吗？\n\n请结合以下要点作答：\n1. 关于 vue3 的重构背景，尤大是这样说的：\n2. 「Vue 新版本的理念成型于 2018 年末，当时 Vue 2 的代码库已经有两岁半了。比起通用软件的生命周期来这好像也没那么久，但在这段时期，前端世界已经今昔非比了\n3. 在我们更新（和重写）Vue 的主要版本时，主要考虑两点因素：首先是新的 JavaScript 语言特性在主流浏览器中的受支持水平；其次是当前代码库中随时间推移而逐渐暴露出来的一些设计和架构问题」\n4. 利用新的语言特性(es6)\n5. 重写了虚拟 Dom 实现\n6. 更高效的组件初始化',
    answer:
      '参考答案要点：\n- 关于 vue3 的重构背景，尤大是这样说的：\n- 「Vue 新版本的理念成型于 2018 年末，当时 Vue 2 的代码库已经有两岁半了。比起通用软件的生命周期来这好像也没那么久，但在这段时期，前端世界已经今昔非比了\n- 在我们更新（和重写）Vue 的主要版本时，主要考虑两点因素：首先是新的 JavaScript 语言特性在主流浏览器中的受支持水平；其次是当前代码库中随时间推移而逐渐暴露出来的一些设计和架构问题」\n- 利用新的语言特性(es6)\n- 重写了虚拟 Dom 实现\n- 更高效的组件初始化',
    hasExplanation: false,
    aliases: [],
  },
];
