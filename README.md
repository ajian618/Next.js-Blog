# Next.js 博客系统 v1.0

基于 Next.js 14 + MySQL 的全栈博客系统

## 技术栈

Next.js 14 | TypeScript | MySQL | NextAuth.js | Tailwind CSS | Markdown

## 核心功能

### 前台
- ✅ 文章列表展示（SSR）
- ✅ 文章详情页（Markdown 渲染）
- ✅ 分类筛选
- ✅ 评论功能（需审核）
- ✅ 响应式设计

### 后台
- ✅ 管理员登录（JWT 认证）
- ✅ 仪表板统计
- ✅ 文章管理（CRUD + Markdown 编辑器，支持实时预览）
- ✅ 分类管理
- ✅ 评论审核

## 部署说明

### 开发环境

1. **安装依赖**
```bash
npm install
```

2. **配置环境变量**

编辑 `.env.local`：
```env
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=blog_db

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

ADMIN_EMAIL=your_email
ADMIN_PASSWORD=your_password
```

3. **初始化数据库**
```bash
mysql -u root -p < scripts/init-db.sql
```

然后在数据库中手动插入管理员账户：
```sql
USE blog_db;
INSERT INTO users (email, password, name) 
VALUES ('your@email.com', '$2a$10$...bcrypt_hash...', 'Admin');
```

4. **启动开发服务器**
```bash
npm run dev
```

访问：
- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin/login

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
  ├── admin/          # 管理后台
  ├── api/            # API 接口
  ├── posts/[slug]/   # 文章详情
  └── page.tsx        # 首页
components/           # 组件
lib/                  # 数据库和认证
types/                # 类型定义
scripts/              # 数据库脚本
```

## API 接口

- `GET/POST /api/posts` - 文章列表和创建
- `GET/PUT/DELETE /api/posts/[id]` - 文章详情、更新、删除
- `GET/POST /api/categories` - 分类列表和创建
- `PUT/DELETE /api/categories/[id]` - 分类更新、删除
- `GET/POST /api/comments` - 评论列表和创建
- `PATCH/DELETE /api/comments/[id]` - 评论审核、删除

## 安全说明

- ✅ 密码使用 bcrypt 加密
- ✅ JWT Session 认证
- ✅ API 接口权限验证
- ✅ 评论需审核后显示
- ✅ SQL 参数化查询防注入

## License

MIT
