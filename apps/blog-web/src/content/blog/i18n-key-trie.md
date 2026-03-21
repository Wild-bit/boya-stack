# i18n Key 冲突校验

## 概述

i18n 的 Key 采用点分隔命名空间（如 `user.name.first`），导入和创建时可能出现结构冲突：

- `user.name`（叶子）与 `user.name.first`（子节点）不能共存 — 因为 JSON 中 `name` 不能同时是字符串和对象
- 重复 Key 检测

使用 Trie（前缀树）校验 i18n key 列表中是否存在冲突或重复。i18n 的 key 通常以 `.` 分隔层级（如 `common.button.submit`），在生成 JSON 时每一级对应一个嵌套对象，因此同一个路径节点不能既是"值"又是"对象"。

## 检测的三种冲突

### 1. 父子冲突（叶子节点同时作为父节点）

```
"user.name"       → { user: { name: "xxx" } }
"user.name.first" → { user: { name: { first: "xxx" } } }  ← 冲突！name 不能同时是字符串和对象
```

### 2. 子父冲突（父节点已有子节点时不能变为叶子）

与上面方向相反 — 先插入 `user.name.first`，再插入 `user.name` 时触发。

### 3. 重复 key

```
"common.ok"
"common.ok"  ← 重复
```

## 算法流程

```
输入: ["a.b.c", "a.b"]

1. 插入 "a.b.c"
   a(非叶) → b(非叶) → c(叶子 ✓)

2. 插入 "a.b"
   a(非叶) → b — 想标记为叶子，但 b 下面已有子节点 c → 报错 ✗
```

逐个 key 按 `.` 拆分后沿 Trie 逐层插入，每一步做两个检查：

- 走到中间节点时：该节点是否已经是叶子？是则冲突
- 走到最后一个节点时：该节点是否已有子节点？是则冲突；是否已是叶子？是则重复

## 数据结构

```
TrieNode {
  children: Map<string, TrieNode>  // 子节点映射
  isLeaf: boolean                  // 是否为某个 key 的终点
}
```

## 核心实现

```ts
export default class Trie {
  children: Map<string, Trie>;
  isLeaf: boolean;

  constructor() {
    this.children = new Map();
    this.isLeaf = false;
  }

  validateKey(keys: string[]) {
    const root = new Trie();
    for (const key of keys) {
      const parts = key.split('.');
      let node = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i] as string;
        const isLast = i === parts.length - 1;
        if (!node.children.has(part)) {
          node.children.set(part, new Trie());
        }
        node = node.children.get(part)!;
        if (node.isLeaf && !isLast) {
          throw new ConflictException('Key名称 冲突');
        }
        if (isLast) {
          if (node.children.size > 0) {
            throw new ConflictException('Key名称 冲突');
          }
          if (node.isLeaf) {
            throw new ConflictException(`重复 key: "${key}"`);
          }
          node.isLeaf = true;
        }
      }
    }
  }
}
```

## 使用场景

在导入 key 或批量创建 key 时调用此校验，确保生成的 JSON 结构不会出现同一路径既是值又是嵌套对象的矛盾。
