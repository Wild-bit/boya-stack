# 邀请成员功能

## 概述

团队管理员通过生成邀请链接（带 token、role、过期时间）邀请成员加入团队。被邀请者 登录后自动绑定并加入团队。整个过程可撤销。

**核心特点：**

- ✅ 安全：可过期、可撤销、可追踪
- ✅ 标准 RBAC + 邀请机制
- ✅ 无需邮件服务：支持"复制链接"分享

---

## 邀请链接格式

```
https://yourapp.com/invite?token=xxxx
```

---

## 数据模型

### Invite 表

```prisma
model Invite {
  id          String       @id @default(cuid())
  token       String       @unique
  teamId      String
  team        Team         @relation(fields: [teamId], references: [id])
  role        TeamRole     @default(MEMBER)
  status      InviteStatus @default(PENDING)
  invitedBy   String
  inviter     User         @relation("InviterRelation", fields: [invitedBy], references: [id])
  acceptedBy  String?
  accepter    User?        @relation("AccepterRelation", fields: [acceptedBy], references: [id])
  expiresAt   DateTime
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum InviteStatus {
  PENDING    // 待使用
  ACCEPTED   // 已接受
  EXPIRED    // 已过期
  REVOKED    // 已撤销
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
}
```

---

## API 设计

### 1. 创建邀请链接

```
POST /api/invites
```

**Request Body:**

```json
{
  "teamId": "team_xxx",
  "role": "MEMBER",
  "expiresInDays": 7
}
```

**Response:**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "invite_xxx",
    "token": "abc123",
    "inviteUrl": "https://yourapp.com/invite?token=abc123",
    "expiresAt": "2026-03-09T00:00:00Z"
  }
}
```

### 2. 校验邀请 Token

```
GET /api/invites/validate?token=abc123
```

**Response (成功):**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "valid": true,
    "team": {
      "id": "team_xxx",
      "name": "My Team"
    },
    "role": "MEMBER",
    "inviter": {
      "name": "张三"
    },
    "expiresAt": "2026-03-09T00:00:00Z"
  }
}
```

**Response (失败):**

```json
{
  "code": 40001,
  "message": "邀请链接已过期"
}
```

### 3. 获取邀请列表（管理员）

```
GET /api/invites?teamId=team_xxx
```

**Response:**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "invite_xxx",
        "token": "abc123",
        "role": "MEMBER",
        "status": "PENDING",
        "inviter": { "name": "张三" },
        "expiresAt": "2026-03-09T00:00:00Z",
        "createdAt": "2026-03-02T00:00:00Z"
      }
    ],
    "total": 1
  }
}
```

### 4. 撤销邀请

```
DELETE /api/invites/:id
```

**Response:**

```json
{
  "code": 0,
  "message": "邀请已撤销"
}
```

---

## Token 存储设计

Token 不只是一个"链接参数"，它承载了业务语义：

```
邀请链接: https://yourapp.com/invite?token=abc123
                                      │
                    这个 token 是一条 Invite 记录的唯一标识
                    通过它能查到：谁邀请的、加入哪个团队、什么角色、是否过期
```

有以下功能：

- 校验 token 是否有效
- 知道邀请的是什么角色
- 知道加入哪个团队
- 防止重复使用
- 撤销邀请

### 数据流详解

**第 1 步：管理员点击「邀请成员」**

后端做两件事：

1. 生成随机 token（如 `cuid()` 或 `crypto.randomUUID()`）
2. 在 Invite 表插入一条记录

```
Invite 表写入：
┌──────────┬───────────┬─────────┬────────┬─────────┬───────────┐
│ id       │ token     │ teamId  │ role   │ status  │ expiresAt │
├──────────┼───────────┼─────────┼────────┼─────────┼───────────┤
│ inv_001  │ abc123    │ team_01 │ MEMBER │ PENDING │ 3月20日   │
└──────────┴───────────┴─────────┴────────┴─────────┴───────────┘
```

返回给前端 `https://i18n.lancespace.club/invite?token=abc123`，管理员复制链接发给别人。

**第 2 步：被邀请者打开链接**

前端拿 URL 中的 `token=abc123`，请求后端校验：

```
GET /api/invites/validate?token=abc123

后端：SELECT * FROM Invite WHERE token = 'abc123'
  → status = PENDING（未使用）  ✓
  → expiresAt > 当前时间（未过期）✓
  → 返回团队名称、角色等信息
```

如果 token 不存在 / 已过期 / 已使用 → 返回错误。

**第 3 步：用户确认加入（已登录状态）**

```
POST /api/invites/accept { token: "abc123" }
```

后端在一个事务里做三件事：

1. **再次校验 Invite（防并发）**
   `SELECT * FROM Invite WHERE token='abc123' AND status='PENDING'`

2. **写入团队成员**
   `INSERT INTO TeamMember (teamId, userId, role) VALUES ('team_01', 当前登录用户, 'MEMBER')`

3. **更新邀请状态（标记已使用）**
   `UPDATE Invite SET status='ACCEPTED', acceptedBy=当前用户 WHERE token='abc123'`

最终 Invite 表变成：

```
┌──────────┬───────────┬─────────┬────────┬──────────┬────────────┐
│ id       │ token     │ teamId  │ role   │ status   │ acceptedBy │
├──────────┼───────────┼─────────┼────────┼──────────┼────────────┤
│ inv_001  │ abc123    │ team_01 │ MEMBER │ ACCEPTED │ user_xxx   │
└──────────┴───────────┴─────────┴────────┴──────────┴────────────┘
```
