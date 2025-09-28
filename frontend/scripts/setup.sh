# Tool: ChatGPT (model: GPT-5), date: 2025-09-28
# Prompt: Write a script to configure git hooks to point to the frontend/.husky directory.
# Author review: I validated the processes.

#!/usr/bin/env sh
echo "🔧 Setting up frontend development environment..."

# Install dependencies
pnpm install

# Configure git hooks (run from repo root)
cd .. && git config core.hooksPath frontend/.husky && cd frontend

# Initialize husky with correct git directory
cd .. && npx --prefix frontend husky init && cd frontend

echo "✅ Setup completed!"
echo "💡 Git hooks are now configured to run from frontend directory"