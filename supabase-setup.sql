-- Supabase 建表脚本
-- 在 Supabase Dashboard - SQL Editor 中执行

-- 1. 创建 blog_data 表
CREATE TABLE IF NOT EXISTS blog_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection TEXT NOT NULL,
  device_id TEXT NOT NULL,
  content JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection, device_id)
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_blog_data_collection ON blog_data(collection);
CREATE INDEX IF NOT EXISTS idx_blog_data_device ON blog_data(device_id);

-- 3. 启用 Row Level Security
ALTER TABLE blog_data ENABLE ROW LEVEL SECURITY;

-- 4. 创建允许所有操作的策略
CREATE POLICY "Allow all operations" ON blog_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE blog_data;
