# AI / Agent Server Access

Instructions for AI agents to access the Coolify server via your Mac.

## Server

| Field | Value |
|-------|-------|
| **Host** | 86.48.23.38 |
| **Coolify UI** | http://86.48.23.38:8000 |
| **SSH user** | root (or your configured user) |

## SSH Setup (one-time)

On your Mac, ensure SSH key auth works:

```bash
# Generate key if needed
ssh-keygen -t ed25519 -f ~/.ssh/coolify_server -N ""

# Copy to server (you'll be prompted for password)
ssh-copy-id -i ~/.ssh/coolify_server.pub root@86.48.23.38
```

Add to `~/.ssh/config`:

```
Host coolify
  HostName 86.48.23.38
  User root
  IdentityFile ~/.ssh/coolify_server
```

Then: `ssh coolify` (or `ssh root@86.48.23.38`).

## Coolify API

| Field | Value |
|-------|-------|
| **Base URL** | http://86.48.23.38:8000/api/v1 |
| **Auth** | Bearer token (Coolify → Keys & Tokens) |
| **JFactory UUID** | asws8oco480c8s8k8c408css |
| **god-mode-api UUID** | d8ws44sgkcs4wkog8gsokgok |

Store token in `god-mode/.env.local`:
```
COOLIFY_TOKEN=your_token
```

## Useful commands (via SSH)

```bash
# Docker containers
docker ps -a | grep -E "d8ws|asws|god-mode|jfactory"

# god-mode-api logs
docker logs $(docker ps -a -q --filter "ancestor=d8ws44sgkcs4wkog8gsokgok" 2>/dev/null | head -1) --tail 100

# JFactory logs
docker logs $(docker ps -a -q --filter "ancestor=asws8oco480c8s8k8c408css" 2>/dev/null | head -1) --tail 100
```
