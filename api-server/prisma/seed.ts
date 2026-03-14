import {
  Difficulty,
  ExplanationStatus,
  PrismaClient,
  QuestionStatus,
  RequestStatus,
  SourcePlatform,
} from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { key: 'html', name: 'HTML', sort: 1 },
  { key: 'css', name: 'CSS', sort: 2 },
  { key: 'javascript', name: 'JavaScript', sort: 3 },
  { key: 'typescript', name: 'TypeScript', sort: 4 },
  { key: 'vue', name: 'Vue', sort: 5 },
  { key: 'engineering', name: '工程化', sort: 6 },
];

const questions = [
  {
    title: '说一下 BFC 的作用',
    summary: '常见 CSS 布局题，考察块级格式化上下文。',
    categoryKey: 'css',
    difficulty: Difficulty.MEDIUM,
    tags: ['CSS', 'BFC', '布局'],
    content: '请解释什么是 BFC，它能解决哪些布局问题？至少举两个实际例子。',
    answer:
      'BFC 是块级格式化上下文，常见作用包括：清除浮动、阻止 margin 重叠、形成独立布局容器。常见触发方式有 overflow:hidden、display:flex、position:absolute 等。',
    hasExplanation: true,
    explanation:
      '从面试表达上，可以先给定义，再给场景：1）父容器包裹浮动子元素；2）相邻块级元素 margin 折叠；3）左右布局时避免文本环绕浮动元素。这样回答会更完整。',
  },
  {
    title: '什么是闭包？它有哪些实际应用？',
    summary: 'JavaScript 基础高频题。',
    categoryKey: 'javascript',
    difficulty: Difficulty.MEDIUM,
    tags: ['JavaScript', '闭包', '作用域'],
    content: '请解释闭包的概念，并说明它在真实业务中的应用。',
    answer:
      '闭包是函数与其词法作用域的组合。常见应用包括数据私有化、函数柯里化、事件处理器中保留外部变量、缓存与防抖节流实现。',
    hasExplanation: false,
  },
  {
    title: 'v-if 和 v-show 的区别',
    summary: 'Vue 基础题，考察渲染成本与使用场景。',
    categoryKey: 'vue',
    difficulty: Difficulty.EASY,
    tags: ['Vue', '渲染'],
    content: '请从编译结果、运行性能、适用场景几个维度说明 v-if 与 v-show 的区别。',
    answer:
      'v-if 是真正的条件渲染，切换时有销毁与重建成本；v-show 只是切换 display，初次渲染成本高但切换成本低。频繁切换建议用 v-show。',
    hasExplanation: false,
  },
  {
    title: 'TypeScript 中 interface 和 type 的区别',
    summary: 'TS 常见概念题。',
    categoryKey: 'typescript',
    difficulty: Difficulty.MEDIUM,
    tags: ['TypeScript'],
    content: '请解释 interface 和 type 的异同，以及你在项目中的使用习惯。',
    answer:
      '两者都能描述类型，interface 更适合对象结构与可扩展声明合并，type 更灵活，适合联合类型、映射类型、工具类型组合。',
    hasExplanation: false,
  },
  {
    title: '浏览器从输入 URL 到页面渲染发生了什么？',
    summary: '综合链路题。',
    categoryKey: 'engineering',
    difficulty: Difficulty.HARD,
    tags: ['浏览器', '网络', '渲染'],
    content: '请从 DNS、TCP/TLS、HTTP、解析渲染、资源加载等角度完整描述页面打开过程。',
    answer:
      '可按 DNS 解析、建立连接、发送请求、服务端响应、浏览器解析 HTML/CSS/JS、构建渲染树、布局与绘制几个阶段说明。',
    hasExplanation: false,
  },
  {
    title: '语义化标签有哪些好处？',
    summary: 'HTML 基础与可访问性题。',
    categoryKey: 'html',
    difficulty: Difficulty.EASY,
    tags: ['HTML', '语义化', 'SEO'],
    content: '请说明使用语义化标签的价值，并举例说明。',
    answer: '语义化有利于可维护性、SEO、可访问性，也更方便团队协作和浏览器理解页面结构。',
    hasExplanation: false,
  },
];

async function main() {
  await prisma.explanationRequestLog.deleteMany();
  await prisma.explanationRequest.deleteMany();
  await prisma.explanation.deleteMany();
  await prisma.question.deleteMany();
  await prisma.category.deleteMany();

  const categoryIdMap = new Map<string, number>();
  for (const item of categories) {
    const category = await prisma.category.create({
      data: {
        name: item.name,
        sort: item.sort,
      },
    });
    categoryIdMap.set(item.key, category.id);
  }

  const createdQuestions: Array<{ id: number; title: string }> = [];

  for (const item of questions) {
    const categoryId = categoryIdMap.get(item.categoryKey);
    if (!categoryId) {
      throw new Error(`Category not found: ${item.categoryKey}`);
    }

    const question = await prisma.question.create({
      data: {
        categoryId,
        title: item.title,
        summary: item.summary,
        content: item.content,
        answer: item.answer,
        difficulty: item.difficulty,
        tags: item.tags,
        hasExplanation: item.hasExplanation,
        status: QuestionStatus.PUBLISHED,
      },
    });

    createdQuestions.push({ id: question.id, title: question.title });

    if (item.explanation) {
      await prisma.explanation.create({
        data: {
          questionId: question.id,
          content: item.explanation,
          status: ExplanationStatus.PUBLISHED,
        },
      });
    }
  }

  const closureQuestion = createdQuestions.find((item) => item.title.includes('闭包'));
  const vueQuestion = createdQuestions.find((item) => item.title.includes('v-if'));

  if (closureQuestion) {
    await prisma.explanationRequest.create({
      data: {
        questionId: closureQuestion.id,
        note: '希望补充真实业务场景、防抖节流里的闭包解释。',
        source: SourcePlatform.MINIAPP,
        status: RequestStatus.PENDING,
        supportCount: 3,
        logs: {
          create: [
            {
              questionId: closureQuestion.id,
              userKey: 'demo_user_1',
              ip: '127.0.0.1',
              note: '希望加真实业务例子',
              source: SourcePlatform.MINIAPP,
            },
            {
              questionId: closureQuestion.id,
              userKey: 'demo_user_2',
              ip: '127.0.0.1',
              note: '想看防抖节流怎么结合闭包讲',
              source: SourcePlatform.H5,
            },
            {
              questionId: closureQuestion.id,
              userKey: 'demo_user_3',
              ip: '127.0.0.1',
              note: '希望补充内存泄漏风险',
              source: SourcePlatform.PC,
            },
          ],
        },
      },
    });
  }

  if (vueQuestion) {
    await prisma.explanationRequest.create({
      data: {
        questionId: vueQuestion.id,
        note: '希望补充编译结果差异和面试追问。',
        source: SourcePlatform.H5,
        status: RequestStatus.IN_PROGRESS,
        supportCount: 2,
        logs: {
          create: [
            {
              questionId: vueQuestion.id,
              userKey: 'demo_user_4',
              ip: '127.0.0.1',
              note: '想看源码层面的区别',
              source: SourcePlatform.H5,
            },
            {
              questionId: vueQuestion.id,
              userKey: 'demo_user_5',
              ip: '127.0.0.1',
              note: '希望补充性能使用建议',
              source: SourcePlatform.MINIAPP,
            },
          ],
        },
      },
    });
  }

  console.warn(
    `Seed completed: ${createdQuestions.length} questions, ${categories.length} categories.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
