-- ========================================
-- Supabase 建表脚本
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ========================================

-- 1. 创建 blog_data 表
CREATE TABLE IF NOT EXISTS blog_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection TEXT NOT NULL,           -- 集合名称: notes/guestbook/gallery/settings/friends
  device_id TEXT NOT NULL,            -- 设备唯一标识
  content JSONB DEFAULT '[]'::jsonb,  -- 存储的数据（JSON 数组）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection, device_id)      -- 每个设备每个集合只有一条记录
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_blog_data_collection ON blog_data(collection);
CREATE INDEX IF NOT EXISTS idx_blog_data_device ON blog_data(device_id);

-- 3. 启用 Row Level Security（可选，开发阶段可关闭）
ALTER TABLE blog_data ENABLE ROW LEVEL SECURITY;

-- 4. 创建允许所有操作的策略（开发阶段）
-- 注意：生产环境请根据需要调整权限
CREATE POLICY "Allow all operations" ON blog_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE blog_data;

-- ========================================
-- 完成！返回 storage.js 填入你的项目信息
-- ========================================
