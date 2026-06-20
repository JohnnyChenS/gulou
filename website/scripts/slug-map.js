// 中文目录名 → 英文 slug 映射表
const SLUG_MAP = {
  // 阶段
  '青春期（14-18岁）': '14-18',
  '大学期（18-22岁）': '18-22',
  '职场开始（22-28岁）': '22-28',
  '职场发展（28-40岁）': '28-40',
  '家庭期（25-45岁）': 'family',
  '中年期（40-60岁）': '40-60',
  '老年期（60+岁）': '60-plus',

  // 育儿年龄段
  '0-3岁': '0-3',
  '3-6岁': '3-6',
  '6-9岁': '6-9',
  '9-12岁': '9-12',
  '12-14岁': '12-14',
  '14-18岁': '14-18',
  '育儿指导': 'parenting',
  '父母自身': 'parents',

  // 主题目录
  '认知与心理': 'cognitive',
  '身体能力': 'physical',
  '身份探索': 'identity',
  '人际关系': 'relationships',
  '心理健康': 'mental-health',
  '身体发育': 'physical-development',
  '学业发展': 'academics',
  '职业探索': 'career-exploration',
  '学术能力': 'academic-skills',
  '独立生活': 'independent-living',
  '亲密关系': 'intimate-relationships',
  '财务素养': 'financial-literacy',
  '婚姻经营': 'marriage',
  '家庭管理': 'family-management',
  '健康管理': 'health',
  '职业发展': 'career',
  '财务规划': 'financial-planning',
  '专业精通': 'mastery',
  '领导力': 'leadership',
  '认知发展': 'cognitive-development',
  '认知保持': 'cognitive-maintenance',
  '社会连接': 'social-connection',
  '生命叙事': 'life-narrative',
  '健康维护': 'health-maintenance',
  '生命回顾': 'life-review',
  '职业传承': 'career-legacy',
  '智慧判断': 'wisdom',
  '产前准备': 'prenatal',
  '产后调适': 'postpartum',
  '育儿压力': 'parenting-stress',
  '自我照顾': 'self-care',
  '关系维护': 'relationship-maintenance',

  // 兴趣
  '母语发展': 'native-language',
  '英语学习': 'english',
  '语言学习': 'language',
  '登山': 'mountaineering',

  // 特殊文件名
  '学龄期（6-12岁）': 'school-age-6-12',
};

/**
 * 将中文路径转换为英文 slug 路径
 * @param {string} chinesePath - 如 "stages/家庭期（25-45岁）/育儿指导/0-3岁/认知与心理/attachment-01.md"
 * @returns {string} - 如 "stages/family/parenting/0-3/cognitive/attachment-01.html"
 */
function resolvePath(chinesePath) {
  // 分割路径段
  const parts = chinesePath.split('/');

  const resolved = parts.map((part, i) => {
    // 最后一段（文件名）特殊处理
    if (i === parts.length - 1) {
      // _index.md → index.html
      if (part === '_index.md') return 'index.html';
      // .md → .html，同时对文件名（不含扩展名）应用 slug 映射
      if (part.endsWith('.md')) {
        const baseName = part.slice(0, -3);
        const slug = SLUG_MAP[baseName] || baseName;
        return slug + '.html';
      }
      // 非 md 文件：也尝试 slug 映射
      return SLUG_MAP[part] || part;
    }

    // 目录段：查映射表，找不到就保持原样
    return SLUG_MAP[part] || part;
  });

  return resolved.join('/');
}

/**
 * 解析单个目录名
 */
function resolveSlug(chineseName) {
  return SLUG_MAP[chineseName] || chineseName;
}

module.exports = { SLUG_MAP, resolvePath, resolveSlug };
