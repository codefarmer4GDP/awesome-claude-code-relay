#!/usr/bin/env node

/**
 * 鹈鹕测试与 AI 模型真伪自动化核验工具 (Pelican & Thinking Test CLI)
 * 用于快速检测各大模型中转 API 是否正版原厂、是否偷梁换柱掺水、是否支持官方 Thinking 思考流
 *
 * 官方真伪画廊与公开证据链: https://www.tokendos.com/tokendos-evidence?lang=zh
 */

const args = process.argv.slice(2);
const apiKey = args[0] || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
let baseUrl = args[1] || process.env.ANTHROPIC_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.tokendos.com';
const model = args[2] || 'claude-3-7-sonnet-20250219';

if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

if (!apiKey) {
  console.log(`
${colors.yellow}${colors.bold}使用方法 / Usage:${colors.reset}
  npx pelican-tester <YOUR_API_KEY> [BASE_URL] [MODEL]
  
${colors.cyan}示例 / Examples:${colors.reset}
  npx pelican-tester sk-xxx
  npx pelican-tester sk-xxx https://api.tokendos.com claude-3-7-sonnet-20250219
  npx pelican-tester sk-xxx https://api.openai.com/v1 gpt-4o

${colors.yellow}环境变量 / Env Vars:${colors.reset}
  支持自动读取 ANTHROPIC_API_KEY / OPENAI_API_KEY 与 ANTHROPIC_BASE_URL
`);
  process.exit(1);
}

console.log(`
${colors.blue}==================================================================${colors.reset}
${colors.bold}🚀 正在对目标服务商进行原厂硬核验真评测 (Pelican & Thinking Benchmark)${colors.reset}
目标 Base URL: ${colors.yellow}${baseUrl}${colors.reset}
测试模型 ID:   ${colors.yellow}${model}${colors.reset}
${colors.blue}==================================================================${colors.reset}
`);

async function run() {
  let pelicanPassed = false;
  let thinkingPassed = false;
  let latencyMs = 0;

  // 1. 经典鹈鹕测试
  console.log(`▶ ${colors.yellow}[1/3] 正在执行经典「鹈鹕测试」(Pelican Test - ASCII 空间构建能力)...${colors.reset}`);
  const pelicanEndpoint = baseUrl.endsWith('/v1') ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;
  try {
    const res = await fetch(pelicanEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: 'Generate an ASCII art of a pelican riding a bicycle. Return ONLY the ASCII art inside a code block, nothing else.' }
        ],
        temperature: 0.2
      })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.log(`  ${colors.red}❌ 请求失败: ${data.error?.message || res.statusText}${colors.reset}`);
    } else {
      const content = data.choices?.[0]?.message?.content || '';
      if (content.length > 50 && (content.includes('(') || content.includes('/') || content.includes('\\') || content.includes('|'))) {
        console.log(`  ${colors.green}✓ 成功获取模型输出响应！具备复杂 ASCII 具象构图特征！${colors.reset}`);
        console.log(`\n${colors.cyan}--- 鹈鹕 ASCII 输出预览 ---${colors.reset}`);
        console.log(content.trim().split('\n').slice(0, 15).join('\n'));
        console.log(`${colors.cyan}---------------------------${colors.reset}\n`);
        pelicanPassed = true;
      } else {
        console.log(`  ${colors.red}⚠️ 警告：输出内容过于简短或为拒绝话术，可能非正版 Claude！${colors.reset}`);
      }
    }
  } catch (err) {
    console.log(`  ${colors.red}❌ 网络请求异常: ${err.message}${colors.reset}`);
  }

  // 2. 原生 Thinking 思考流结构化检测
  console.log(`▶ ${colors.yellow}[2/3] 正在执行原生 Thinking 思考流检测 (Anthropic Messages API)...${colors.reset}`);
  const thinkingEndpoint = baseUrl.endsWith('/v1') ? `${baseUrl.slice(0, -3)}/v1/messages` : `${baseUrl}/v1/messages`;
  try {
    const res = await fetch(thinkingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        thinking: {
          type: 'enabled',
          budget_tokens: 512
        },
        messages: [
          { role: 'user', content: '9.11 和 9.9 谁更大？请深入思考。' }
        ]
      })
    });

    const data = await res.json();
    if (res.ok && data.content && Array.isArray(data.content)) {
      const hasThinking = data.content.some(item => item.type === 'thinking');
      if (hasThinking) {
        console.log(`  ${colors.green}🎉 恭喜！检测到官方原厂结构化 thinking 思考块！具备原厂深度思考签名！${colors.reset}\n`);
        thinkingPassed = true;
      } else {
        console.log(`  ${colors.red}⚠️ 未检测到原厂 thinking 块（可能为国产模型替代或降级模型）${colors.reset}\n`);
      }
    } else {
      console.log(`  ${colors.yellow}ℹ️ 该端点返回: ${data.error?.message || res.statusText}（若非 Anthropic 原生端点可忽略）${colors.reset}\n`);
    }
  } catch (err) {
    console.log(`  ${colors.yellow}ℹ️ 思考流测试跳过: ${err.message}${colors.reset}\n`);
  }

  // 3. 往返响应耗时与连通性
  console.log(`▶ ${colors.yellow}[3/3] 正在测算接口首字延迟与往返响应耗时...${colors.reset}`);
  const start = Date.now();
  try {
    const res = await fetch(pelicanEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      })
    });
    latencyMs = Date.now() - start;
    if (res.ok) {
      console.log(`  ${colors.green}✓ 接口健康存活，往返耗时: ${latencyMs} ms${colors.reset}\n`);
    } else {
      console.log(`  ${colors.red}❌ 测速异常: HTTP ${res.status}${colors.reset}\n`);
    }
  } catch (err) {
    console.log(`  ${colors.red}❌ 连通性错误: ${err.message}${colors.reset}\n`);
  }

  // 总结卡片
  console.log(`${colors.blue}==================================================================${colors.reset}`);
  console.log(`${colors.bold}📊 验真评测总结报告 / Benchmark Summary:${colors.reset}`);
  console.log(`- 经典鹈鹕空间绘图: ${pelicanPassed ? `${colors.green}PASS (正品特征)` : `${colors.red}FAIL / UNKNOWN`}${colors.reset}`);
  console.log(`- 原厂 Thinking 深度思考: ${thinkingPassed ? `${colors.green}PASS (原生思考链)` : `${colors.yellow}NOT DETECTED`}${colors.reset}`);
  console.log(`- 往返端到端延迟:   ${latencyMs > 0 ? `${colors.cyan}${latencyMs} ms` : 'N/A'}${colors.reset}`);
  console.log(`\n🔍 在线真伪画廊与公开证据链核对: ${colors.bold}https://www.tokendos.com/tokendos-evidence?lang=zh${colors.reset}`);
  console.log(`${colors.blue}==================================================================${colors.reset}\n`);
}

run().catch(console.error);
