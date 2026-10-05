# 新手父母连续阅读：本轮实施与验证

> 历史记录：以下保留首批六章及九章扩展时的验证结果和当时尚未完成的事项。当前已完成十五章与全库整合；现状、统计与验证以[全库最终验收](full-library-editorial-verification.md)为准。

验证日期：2026-10-05。实施基于 `docs/new-parent-timeline-guide` 分支，起点提交 `b73459dc34d3b73255a87c66fb2b9c084de33303`。

本记录前半部分保留首批六章的验证结果；同日第 2–6 周扩展见文末。该轮结束时主线为九章，覆盖产前至产后六周。

## 交付范围

首页、育儿入口和 0–3 岁入口接入连续阅读。首批六章覆盖产前准备、临产、生产、出生第一天、出院和回家第一周；必要术语在正文首次出现处解释，正文写出前后承接，章末保留理解问题与可选查阅。

产前两个月至六个月的阅读地图已建立。产后第 2–6 周、1–3 个月、3–6 个月和接近六个月的内容仍进入原综合教程，明确标注待按同样方式重编。本轮没有把这些后续内容计为已完成章节。

章节目录和前后章来自显式 `chapters`。并列年龄、问题入口不再被串为一个连续课程；真正有阶段顺序的系统架构课程仍保留原顺序。延伸页面保留起始章节与段落，提供固定返回入口。共享文章直接打开时需要选择路线。

## 编辑与独立检查

内容、导航、已知事实问题分别委派；完成初稿后另做只读内容检查和 URL 边界检查，最终由主任务整合。

检查发现的基础解释缺口已补入正文：儿童保健、临产词语、肌肤接触、含接与乳晕、黄疸。出院交代同时覆盖母亲和宝宝，奶液准备与保存的必要条件直接写在出院章，体温测量与求助边界不依赖继续外跳。

既有青春期内容去掉缺乏直接依据的效果数字、时间保证和排除抑郁的断言。四处带冒号的参考记录改为 YAML 字符串，避免生成 `[object Object]`；其中产前准备页仅改引用格式。原综合教程正文保留。

来源核对限于本轮调整涉及的表述，主要包括 [CDC 配方奶准备与保存](https://www.cdc.gov/infant-toddler-nutrition/formula-feeding/preparation-and-storage.html)、[CDC 母乳处理与保存](https://www.cdc.gov/breastfeeding/breast-milk-preparation-and-storage/handling-breastmilk.html)、[AAP 婴幼儿发热指导](https://www.healthychildren.org/English/health-issues/conditions/fever/Pages/Fever-and-Your-Baby.aspx)、[NIMH 青少年抑郁](https://www.nimh.nih.gov/health/publications/teen-depression)、[NIMH 儿童与青少年心理健康](https://www.nimh.nih.gov/health/topics/child-and-adolescent-mental-health)和 [NIMH 自杀警示信号](https://www.nimh.nih.gov/health/publications/warning-signs-of-suicide)。这不是对全部章节的医学审定。

## 工程检查

| 检查 | 结果 |
| --- | --- |
| `npm run build` | 根路径与 `/gulou/` 子路径均成功；181 篇内容页 |
| `npm run check:reading` | 两种构建下 12 项全部通过 |
| `npm run check:routes` | 通过；131 篇未被路线引用的知识页仍可直接访问 |
| `check:breadcrumbs`、`check:brain-health` | 通过 |
| `check:0-3`、`check:3-6`、`check:path-migration` | 通过 |
| `check:system-architecture` | 通过；10 个阶段、6 个正式单元 |
| 原教程显式锚点 | 20 个全部保留，顺序相同 |
| Agent 已选睡眠、哭闹来源 | 与起点提交逐字节一致 |

测试覆盖显式章节与并列路线、两层查阅和原节返回、共享文章选择后的前后章、无效上下文清理、折叠目录深链接、首页入口、草稿边界及章节面包屑的实际目标。

原有入口检查作了两处兼容调整：标题匹配接受新增的 `id` 属性；路径迁移检查读取真实链接，避免把页面内路线元数据误当成导航链接。原检查内容仍保留。

## 实际浏览器走读

在本地生成站点完成以下操作：

1. 从首页主入口进入第一章，再通过正文页尾依次进入第二至第六章，章节位置和相邻章均正确。
2. 从第一章“需要时再查”进入原教程，再进入产前准备文章；刷新第二层文章后仍保留第一章上下文。返回主线后落在第一章原节，目标可见。查阅页滚到教程深处时返回入口仍固定在顶部导航下。
3. 直接打开共享的元认知文章，先显示两条路线；选择“学习习惯”后显示第四章位置，上一章链接仍属于所选路线。
4. 打开旧 `#month-observation` 链接，折叠目录自动展开；目标位于顶部导航下方，未被遮挡。
5. 输入不属于章节锚点的返回参数，页面清除无效阅读参数，没有生成外部返回目标。
6. 在当前 552px 宽预览中检查首页和第一章，页面没有水平溢出。未做其他设备尺寸的完整测试。

实际走读还修复了不存在的中间目录面包屑、隐藏锚点展开后的定位，以及浏览器使用旧样式或脚本的问题。样式和导航脚本现在使用内容版本参数；文件变化时浏览器会请求新资源。

## 尚未验证的部分

六章继续标为草稿，原来源记录继承日期与本轮编排、专业复核分开显示。没有进行真实零经验父母的理解测试，也没有取得新的专业审核；工程与编辑走读不能证明读者已经吸收知识或焦虑下降。后续月份仍待重编。

本轮只修改 `gulou-core`，没有扩大 Agent 知识选择、改变 Agent 行为或发布到线上。

## 第二轮：延伸至产后六周

用户授权继续第 2–6 周主线后，新增三章：

- [第七章：妈妈的恢复与家庭节奏](../../paths/parenting/new-parent/07-recovery-and-rhythm.md)：把疼痛、出血、休息、饭食、复查和心理支持放回家庭分工。
- [第八章：怎样读懂宝宝的变化](../../paths/parenting/new-parent/08-reading-baby-signals.md)：将吃奶过程、尿便、随访体重、清醒状态、睡眠和哭闹一起理解。
- [第九章：从日常护理走向亲子互动](../../paths/parenting/new-parent/09-care-and-connection.md)：先给护理场景，再解释回应式照料与安全依恋，说明继续、暂停和交接的条件。

三章属于同一第 2–6 周阶段内的理解顺序，不是三个发育里程碑。第六章末尾、目录、首页、育儿与月龄入口都已衔接；路线 URL 和 `prenatal-first-week` 键保留，已有阅读参数继续可用。1–3 个月资料与第 2–6 周有时间重叠，主线和月龄入口已说明这一点；后续月份仍待重编。

### 独立检查后的修订

内容和入口整合并行完成，再由未写对应正文的代理进行只读检查，主任务统一修订与验证：

- 具体说明早期排便和产后出血的联系条件，避免“几天”“较大”让新手继续等待；尿布参考数不作为排除疾病的判断。
- 明确瓶喂没有通用于所有宝宝的间隔和奶量；已有个体喂养方案继续优先。
- 解释会阴、侧切、盆底和生长曲线；把完整饭食与休息一起纳入支持安排。
- 第九章补上与第八章的实际承接，先场景后命名概念；英文术语留在来源标题，不作为正文必学词。
- 第九章明确安全放下后的短暂暂停、及时回来查看及危机时陪伴当事人，避免误读成长期哭泣训练。
- 区分前六章继承的资料记录与新增三章 2026-10-05 的公开资料核对，不提升专业审核状态。

新增医疗表述核对范围包括 [NHS 产后身体护理](https://www.nhs.uk/pregnancy/labour-and-birth/your-body/)、[NHS 产后复查](https://www.nhs.uk/baby/support-and-services/your-6-week-postnatal-check/)、[NHS 哺乳饮食](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-and-lifestyle/diet/)、[CDC 产妇警示](https://www.cdc.gov/hearher/maternal-warning-signs/index.html)、[CDC 哺乳期营养](https://www.cdc.gov/breastfeeding-special-circumstances/hcp/diet-micronutrients/maternal-diet.html)、NHS 喂养/体重/睡眠/哭闹与 AAP 发热指导。第九章依据 [WHO 早期发展指导](https://www.who.int/publications/i/item/97892400020986)、[WHO 养育框架](https://www.who.int/publications/i/item/9789241514064)、[Harvard 来回互动资料](https://developingchild.harvard.edu/key-concept/serve-and-return/)及章内列明的 UNICEF、NHS 资料。

ACOG 两个候选页面未能获得正文，没有把它们计入已验证依据，最终第七章使用已读取的 NHS 与 CDC 资料。以上均是公开资料核对，三章继续为草稿，尚未完成专业复核。

### 工程与实际阅读结果

- 根路径及 `/gulou/` 子路径构建成功，共 184 篇内容页；12 项阅读测试均通过，生成页面检查已覆盖九章。
- 路线、面包屑、脑健康链接、0–3 岁与 3–6 岁入口、路径迁移、系统架构回归检查通过。
- 实际从第六章页尾依次进入第七、八、九章，显示正确位置与相邻章节。
- 从第九章“延伸至 3 个月”进入综合教程，再进入睡眠剥夺页；刷新后仍保留第九章上下文。返回时落在原节，位于固定导航下方。
- 当前 552px 宽预览中，第七至九章没有页面水平溢出。没有进行全设备矩阵测试。
- 原教程 20 个显式锚点及 Agent 已选睡眠、哭闹来源继续保留。

本轮验收是编辑与工程走读，未进行真实新手理解测试或新的专业审定，也未发布线上。
