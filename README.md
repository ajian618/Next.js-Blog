# Next.js 博客系统 v2.0 - 完整用户系统版

基于 Next.js 14 + MySQL 的全栈博客系统，带完整用户注册登录、个人中心和权限管理

## 技术栈

Next.js 14 | TypeScript | MySQL | NextAuth.js | Tailwind CSS | Markdown

## 核心功能

### 🌐 前台
- ✅ 文章列表展示（SSR）
- ✅ 文章详情页（Markdown 渲染）
- ✅ 分类筛选
- ✅ 评论功能（需审核，关联用户账户）
- ✅ 响应式导航栏
- ✅ 用户头像和下拉菜单

### 👤 用户系统（新增）
- ✅ 用户注册
- ✅ 用户登录/退出
- ✅ 个人中心（查看/编辑资料）
- ✅ 密码修改
- ✅ 用户头像设置
- ✅ 个人简介
- ✅ 角色权限管理（普通用户/管理员）

### 🔐 后台管理
- ✅ 管理员登录（NextAuth JWT 认证）
- ✅ 仪表板统计
- ✅ 文章管理（CRUD + Markdown 编辑器，支持实时预览）
- ✅ 分类管理
- ✅ 评论审核
- ✅ 路由权限保护（中间件）
- ✅ 管理员在个人中心的快捷入口

## 快速开始

### 新项目部署

1. **安装依赖**
```bash
npm install
```

2. **配置环境变量**

创建 `.env.local`：
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blog_db

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

生成安全的 NEXTAUTH_SECRET：
```bash
openssl rand -base64 32
```

3. **初始化数据库**
```bash
# 创建数据库和表结构
mysql -u root -p < scripts/init-db.sql
```

4. **创建管理员账户**

在数据库中执行：
```sql
USE blog_db;

-- 密码: Admin123456（请登录后立即修改）
INSERT INTO users (email, password, name, role) 
VALUES (
  'admin@blog.com', 
  '$2a$10$YourBcryptHashHere',
  '管理员',
  'admin'
);
```

或使用 bcryptjs 生成密码哈希：
```javascript
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('你的密码', 10));
```

5. **启动开发服务器**
```bash
npm run dev
```

访问：
- 🏠 博客首页：http://localhost:3000
- 🔐 登录页面：http://localhost:3000/login
- 📝 注册页面：http://localhost:3000/register
- 👤 个人中心：http://localhost:3000/profile（需登录）
- 🔧 管理后台：http://localhost:3000/admin/dashboard（仅管理员）

### 从旧版本升级

**如果您已经有运行中的博客系统，请查看 [QUICKSTART.md](./QUICKSTART.md) 了解升级步骤！**

简要步骤：
1. 备份数据库
2. 执行升级脚本：`mysql -u root -p blog_db < scripts/upgrade-db.sql`
3. 验证管理员角色：`UPDATE users SET role = 'admin' WHERE email = '您的邮箱';`
4. 重启服务

详细说明请查看 **[UPGRADE.md](./UPGRADE.md)**

### 生产环境

```bash
npm run build
npm start
```

确保设置正确的环境变量：
- `NEXTAUTH_URL` 为实际域名
- `NEXTAUTH_SECRET` 使用强密码（`openssl rand -base64 32`）
- 数据库使用独立账户，不要用 root

## 项目结构

```
app/
  ├── admin/              # 管理后台
  │   ├── dashboard/      # 仪表板
  │   ├── posts/          # 文章管理
  │   ├── comments/       # 评论管理
  │   ├── categories/     # 分类管理
  │   └── login/          # 重定向到统一登录
  ├── api/                # API 接口
  │   ├── auth/           # 认证相关
  │   │   ├── [...nextauth]/  # NextAuth 路由
  │   │   └── register/   # 用户注册
  │   ├── user/           # 用户相关
  │   │   └── profile/    # 个人资料
  │   ├── posts/          # 文章 API
  │   ├── comments/       # 评论 API
  │   └── categories/     # 分类 API
  ├── posts/[slug]/       # 文章详情页
  ├── login/              # 登录页（新）
  ├── register/           # 注册页（新）
  ├── profile/            # 个人中心（新）
  └── page.tsx            # 博客首页
components/               # 组件
  ├── Navbar.tsx          # 导航栏（新）
  ├── CommentForm.tsx     # 评论表单
  ├── CommentList.tsx     # 评论列表
  ├── PostEditor.tsx      # 文章编辑器
  └── ...                 # 其他组件
lib/
  ├── auth.ts             # NextAuth 配置
  └── db.ts               # 数据库连接
types/
  ├── index.ts            # 通用类型定义
  └── next-auth.d.ts      # NextAuth 类型扩展
scripts/
  ├── init-db.sql         # 数据库初始化脚本
  └── upgrade-db.sql      # 数据库升级脚本（新）
middleware.ts             # 路由保护中间件（新）
```

## API 接口

### 认证相关
- `POST /api/auth/register` - 用户注册（新）
- `POST /api/auth/[...nextauth]` - NextAuth 登录/登出

### 用户相关（新）
- `GET /api/user/profile` - 获取个人信息（需登录）
- `PUT /api/user/profile` - 更新个人信息（需登录）

### 文章管理
- `GET/POST /api/posts` - 文章列表和创建
- `GET/PUT/DELETE /api/posts/[id]` - 文章详情、更新、删除

### 分类管理
- `GET/POST /api/categories` - 分类列表和创建
- `PUT/DELETE /api/categories/[id]` - 分类更新、删除

### 评论管理
- `GET /api/comments?postId=xxx` - 获取评论列表
- `POST /api/comments` - 发表评论（已登录用户自动关联）
- `PATCH /api/comments/[id]` - 评论审核
- `DELETE /api/comments/[id]` - 删除评论

## 安全特性

- ✅ 密码使用 bcrypt 加密（10轮salt）
- ✅ NextAuth JWT Session 认证
- ✅ 中间件路由权限保护
- ✅ 基于角色的访问控制（RBAC）
- ✅ API 接口权限验证
- ✅ 评论需审核后显示（管理员评论自动通过）
- ✅ SQL 参数化查询防注入
- ✅ XSS 防护（React 自动转义）
- ✅ CSRF 保护（NextAuth 内置）

## 用户角色

| 角色 | 权限 |
|------|------|
| **游客** | 浏览文章、查看已审核评论 |
| **普通用户** | 游客权限 + 发表评论（需审核）、个人中心 |
| **管理员** | 所有权限 + 后台管理、评论自动审核 |

## 页面路由

### 公开页面
- `/` - 博客首页
- `/posts/[slug]` - 文章详情
- `/login` - 登录
- `/register` - 注册

### 需要登录
- `/profile` - 个人中心

### 仅管理员
- `/admin/dashboard` - 管理仪表板
- `/admin/posts` - 文章管理
- `/admin/posts/new` - 新建文章
- `/admin/posts/[id]/edit` - 编辑文章
- `/admin/comments` - 评论管理
- `/admin/categories` - 分类管理

## 数据库表结构

### users（用户表）
- `id` - 主键
- `email` - 邮箱（唯一）
- `password` - 密码（bcrypt）
- `name` - 用户名
- `avatar` - 头像URL（新）
- `bio` - 个人简介（新）
- `role` - 角色：user/admin（新）
- `status` - 状态：active/banned（新）
- `created_at` - 创建时间
- `updated_at` - 更新时间

### posts（文章表）
- `id` - 主键
- `title` - 标题
- `slug` - URL别名
- `content` - 内容（Markdown）
- `excerpt` - 摘要
- `category_id` - 分类ID
- `published` - 是否发布
- `created_at` - 创建时间
- `updated_at` - 更新时间

### comments（评论表）
- `id` - 主键
- `post_id` - 文章ID
- `user_id` - 用户ID（新，可为空）
- `author_name` - 作者名
- `author_email` - 作者邮箱
- `content` - 内容
- `approved` - 是否审核通过
- `created_at` - 创建时间

### categories（分类表）
- `id` - 主键
- `name` - 分类名
- `slug` - URL别名
- `description` - 描述
- `created_at` - 创建时间

## 开发说明

### 如何添加新用户角色

1. 修改数据库枚举：
```sql
ALTER TABLE users MODIFY role ENUM('user', 'admin', 'editor');
```

2. 更新类型定义 `types/index.ts` 和 `types/next-auth.d.ts`

3. 在中间件 `middleware.ts` 中添加权限逻辑

### 如何允许游客评论

修改 `components/CommentForm.tsx`，移除登录检查：

```typescript
// 注释掉这段代码
// if (!session?.user) {
//   return <div>请登录后评论</div>;
// }
```

### 如何自定义主题

修改 `tailwind.config.ts`：

```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      // ...
    }
  }
}
```

## 常见问题

**Q: 忘记管理员密码怎么办？**

A: 在数据库中重置：
```sql
-- 生成新密码哈希（使用 Node.js）
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('新密码', 10));

-- 更新数据库
UPDATE users SET password = '新的哈希值' WHERE email = 'admin@blog.com';
```

**Q: 如何修改管理员邮箱？**

A: 
```sql
UPDATE users SET email = '新邮箱' WHERE role = 'admin';
```

**Q: 部署到生产环境需要注意什么？**

A:
1. 使用强 `NEXTAUTH_SECRET`
2. 设置正确的 `NEXTAUTH_URL`
3. 数据库使用专用账户，不要用 root
4. 启用 HTTPS
5. 定期备份数据库

## 性能优化

- ✅ 服务端渲染（SSR）- 首页和文章详情
- ✅ 数据库索引优化
- ✅ 静态资源优化
- ⚡ 建议添加：
  - Redis 缓存
  - 图片 CDN
  - 增量静态生成（ISR）

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## License

MIT
