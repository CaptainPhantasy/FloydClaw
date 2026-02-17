```
## ZAI API Working Configuration

### 1. Provider Config (`llm_provider.py`)

```python
ProviderType.ZAI: {
    "base_url": "https://api.z.ai/api/coding/paas/v4",
    "default_model": "glm-5",
    "api_key_env": "ZAI_API_KEY",
    "header_prefix": "Bearer",
    "supports_streaming": True,
    "format": "openai",
    "thinking_disabled": True,  # CRITICAL - triggers thinking parameter
}
```

### 2. Request Payload

```python
{
    "model": "glm-5",                    # NOT "glm-4.7-flashx"
    "messages": [...],
    "max_tokens": 4000,                  # 4000+ for code generation
    "temperature": 0.7,                  # Optional
    "thinking": {"type": "disabled"}     # CRITICAL - glm-5 is a reasoning model
}
```

### 3. Headers

```python
{
    "Authorization": "Bearer {api_key}",
    "Content-Type": "application/json"
}
```

---

## Critical Points

| Parameter | Value | Why |
|-----------|-------|-----|
| `model` | `"glm-5"` | `glm-4.7-flashx` is Portkey format, causes 429 |
| `thinking` | `{"type": "disabled"}` | Without this, tokens consumed by reasoning, `content` field empty |
| `base_url` | `https://api.z.ai/api/coding/paas/v4` | Coding API endpoint |
| `max_tokens` | `4000+` | Code generation needs headroom |

---

## What Happens Without `thinking: disabled`

```python
# Response WITHOUT thinking disabled:
{
    "choices": [{
        "message": {
            "content": "",              # EMPTY!
            "reasoning_content": "..."  # All tokens go here
        }
    }]
}

# Response WITH thinking disabled:
{
    "choices": [{
        "message": {
            "content": "{...json...}",  # Content as expected
            "reasoning_content": null
        }
    }]
}
```

---

## Minimal Working Test

```python
import urllib.request
import json
import os

url = "https://api.z.ai/api/coding/paas/v4/chat/completions"
api_key = os.environ["ZAI_API_KEY"]

payload = {
    "model": "glm-5",
    "messages": [
        {"role": "system", "content": "You are a code generator."},
        {"role": "user", "content": "Return JSON with keys: name, version"}
    ],
    "max_tokens": 1000,
    "thinking": {"type": "disabled"}
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode(),
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
)

with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read())
    print(result["choices"][0]["message"]["content"])
```

---

## Summary Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZAI API STANDARD RECIPE                      │
├─────────────────────────────────────────────────────────────────┤
│  Endpoint:  https://api.z.ai/api/coding/paas/v4/chat/completions│
│  Model:     glm-5                                               │
│  Auth:      Bearer {ZAI_API_KEY}                                │
│  Required:  thinking: {"type": "disabled"}                      │
│  Tokens:    max_tokens >= 4000 for code                         │
└─────────────────────────────────────────────────────────────────┘
```

```
