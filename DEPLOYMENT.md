# 生产环境部署指南

## 部署前检查清单

- [ ] 修改 `NEXTAUTH_SECRET` 为强随机密钥
- [ ] 设置 `NEXTAUTH_URL` 为实际域名
- [ ] 数据库使用独立账户（非 root）
- [ ] 启用 HTTPS
- [ ] 配置数据库定期备份
- [ ] 检查所有敏感信息是否已从代码中移除

## 环境变量配置

生产环境 `.env.local`：

```env
# 数据库配置（使用独立账户）
DB_HOST=your_production_host
DB_USER=blog_user
DB_PASSWORD=strong_password_here
DB_NAME=blog_db

# NextAuth 配置
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=use_openssl_rand_base64_32_to_generate

# 管理员账户（首次创建后可删除）
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong_password
```

## 数据库安全配置

1. 创建独立数据库用户：
```sql
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_db.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;
```

2. 定期备份：
```bash
mysqldump -u blog_user -p blog_db > backup_$(date +%Y%m%d).sql
```

## 性能优化

1. 启用生产模式：
```bash
npm run build
npm start
```

2. 使用 PM2 进程管理：
```bash
npm install -g pm2
pm2 start npm --name "blog" -- start
pm2 save
pm2 startup
```

## 监控建议

- 定期检查日志
- 监控数据库性能
- 设置磁盘空间告警
- 备份验证恢复流程

## 更新流程

```bash
git pull
npm install
npm run build
pm2 restart blog
```
