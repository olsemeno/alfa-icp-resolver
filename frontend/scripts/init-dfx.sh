#!/bin/bash

# Скрипт для инициализации dfx проекта

echo "🔧 Инициализация dfx проекта..."

# Проверяем, что dfx установлен
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx не установлен. Установите dfx: https://internetcomputer.org/docs/current/developer-docs/setup/install/"
    exit 1
fi

# Инициализируем dfx проект
echo "📁 Инициализация dfx проекта..."
dfx start --clean --background

# Создаем identity если не существует
if ! dfx identity list | grep -q "default"; then
    echo "🆔 Создаем default identity..."
    dfx identity new default
fi

# Используем default identity
dfx identity use default

echo "✅ dfx проект инициализирован!"
echo "🚀 Теперь можете запустить: npm run deploy" 