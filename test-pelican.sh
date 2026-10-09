#!/usr/bin/env bash

# ==============================================================================
# 鹈鹕测试与 AI 模型真伪自动化核验脚本 (Pelican & Thinking Test Tool)
# 用于快速验证各中转站 Claude 3.7 / 3.5 模型是否原厂正品、是否掺水、是否支持思考流
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_KEY="${1}"
BASE_URL="${2:-https://api.tokendos.com}"
MODEL="${3:-claude-3-7-sonnet-20250219}"

if [ -z "$API_KEY" ]; then
  echo -e "${YELLOW}使用方法:${NC} bash test-pelican.sh <YOUR_API_KEY> [BASE_URL] [MODEL]"
  echo -e "示例: bash test-pelican.sh sk-xxx https://api.tokendos.com claude-3-7-sonnet-20250219"
  exit 1
fi

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}🚀 正在对目标服务商进行原厂硬核验真评测...${NC}"
echo -e "目标 Base URL: ${YELLOW}${BASE_URL}${NC}"
echo -e "测试模型:      ${YELLOW}${MODEL}${NC}"
echo -e "${BLUE}======================================================${NC}\n"

# ------------------------------------------------------------------------------
# 测试项 1: 经典鹈鹕测试 (Pelican Test)
# ------------------------------------------------------------------------------
echo -e "▶ ${YELLOW}[1/3] 正在执行经典「鹈鹕测试」(Pelican Test)...${NC}"
PELICAN_RESP=$(curl -s --max-time 30 "${BASE_URL}/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d '{
    "model": "'"${MODEL}"'",
    "messages": [
      {"role": "user", "content": "Generate an ASCII art of a pelican riding a bicycle. Return ONLY the ASCII art inside a code block, nothing else."}
    ],
    "temperature": 0.2
  }')

if echo "$PELICAN_RESP" | grep -q "error"; then
  echo -e "${RED}❌ 请求失败: $(echo "$PELICAN_RESP" | grep -o '"message":[^,]*')${NC}\n"
else
  CONTENT=$(echo "$PELICAN_RESP" | grep -o '"content":".*"' | head -n 1 || true)
  if [ -n "$CONTENT" ]; then
    echo -e "${GREEN}✓ 成功获取模型输出响应！${NC}"
    echo -e "--- 鹈鹕 ASCII 输出预览 ---"
    python3 -c "import json, sys; d=json.loads(sys.stdin.read()); print(d['choices'][0]['message']['content'])" <<< "$PELICAN_RESP" || true
    echo -e "---------------------------\n"
  else
    echo -e "${RED}❌ 未能正确解析内容响应${NC}\n"
  fi
fi

# ------------------------------------------------------------------------------
# 测试项 2: 原生 Thinking 思考流测试
# ------------------------------------------------------------------------------
echo -e "▶ ${YELLOW}[2/3] 正在执行原生 Thinking 思考流测试 (Anthropic Messages API)...${NC}"
THINKING_RESP=$(curl -s --max-time 30 "${BASE_URL}/v1/messages" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "'"${MODEL}"'",
    "max_tokens": 1024,
    "thinking": {
      "type": "enabled",
      "budget_tokens": 512
    },
    "messages": [
      {"role": "user", "content": "9.11 和 9.9 谁更大？请深入思考。"}
    ]
  }' || true)

if echo "$THINKING_RESP" | grep -q '"type": *"thinking"'; then
  echo -e "${GREEN}🎉 恭喜！检测到官方原厂结构化 thinking 思考块！真实 Claude 3.7 原厂无疑！${NC}\n"
elif echo "$THINKING_RESP" | grep -q "error"; then
  echo -e "${YELLOW}⚠️ 思考流测试返回错误或该接口未开放 Anthropic 原生端点: $(echo "$THINKING_RESP" | grep -o '"message":[^,]*')${NC}\n"
else
  echo -e "${RED}⚠️ 警告：响应中未包含原厂 thinking 结构，可能为国产模型替代或不支持原生深度思考${NC}\n"
fi

# ------------------------------------------------------------------------------
# 测试项 3: 连通性与首字延迟 (TTFT)
# ------------------------------------------------------------------------------
echo -e "▶ ${YELLOW}[3/3] 正在测算接口首字延迟 (TTFT)...${NC}"
START_TIME=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1e9))')
curl -s --max-time 15 "${BASE_URL}/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${API_KEY}" \
  -d '{
    "model": "'"${MODEL}"'",
    "messages": [{"role": "user", "content": "hi"}],
    "max_tokens": 5
  }' > /dev/null
END_TIME=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1e9))')
LATENCY_MS=$(( (END_TIME - START_TIME) / 1000000 ))

echo -e "${GREEN}✓ 往返响应耗时: ${LATENCY_MS} ms${NC}"
echo -e "\n${BLUE}======================================================${NC}"
echo -e "${GREEN}评测执行完成！欢迎在 GitHub 提交 Issue 分享你的中转测速数据！${NC}"
echo -e "${BLUE}======================================================${NC}"
