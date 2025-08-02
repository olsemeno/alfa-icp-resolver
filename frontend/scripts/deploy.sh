#!/bin/bash

# Скрипт для деплоя крипто обменника в ICP канистру

echo "🚀 Начинаем деплой крипто обменника в ICP канистру..."

# Проверяем, что dfx установлен
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx не установлен. Установите dfx: https://internetcomputer.org/docs/current/developer-docs/setup/install/"
    exit 1
fi

# Проверяем, что мы в правильной сети
echo "📡 Проверяем подключение к сети IC..."
dfx ping ic

# Собираем проект
echo "🔨 Собираем проект..."
npm run build

# Проверяем, что build папка существует
if [ ! -d "build" ]; then
    echo "❌ Ошибка: папка build не найдена после сборки"
    exit 1
fi

# Деплоим в канистру
echo "🚀 Деплоим в канистру..."
dfx deploy --network ic

echo "✅ Деплой завершен!"
echo "🌐 Ваше приложение доступно по адресу: https://$(dfx canister --network ic id crypto-exchange-app).ic0.app" 