# Crypto Exchange App

React TypeScript приложение для обмена криптовалют ETH и ICP с поддержкой WalletConnect и Identity Kit.

## Особенности

- 🎨 Современный дизайн с черно-фиолетовым градиентом
- 🔗 Поддержка ETH кошельков через WalletConnect
- 🌐 Поддержка ICP кошельков через Identity Kit
- 💱 Интерактивный обмен валют с отображением курсов
- 📱 Адаптивный дизайн для мобильных устройств
- ⚡ Оптимизировано для деплоя в ICP канистру

## Технологии

- React 18
- TypeScript
- CSS3 с градиентами и анимациями
- WalletConnect для ETH
- Identity Kit для ICP

## Установка

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm start
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000).

## Сборка для продакшена

```bash
npm run build
```

## Структура проекта

```
src/
├── components/          # React компоненты
│   ├── CurrencySelector.tsx
│   ├── AmountInput.tsx
│   ├── ExchangeRate.tsx
│   ├── RecipientInput.tsx
│   ├── WalletConnect.tsx
│   └── ExchangeButton.tsx
├── hooks/              # React хуки
│   ├── useExchange.ts
│   └── useWallets.ts
├── types/              # TypeScript типы
│   └── index.ts
├── App.tsx             # Главный компонент
└── index.tsx           # Точка входа
```

## Функциональность

### Подключение кошельков
- Подключение ETH кошелька через WalletConnect
- Подключение ICP кошелька через Identity Kit
- Отображение адресов и балансов

### Обмен валют
- Выбор валют для обмена (ETH ↔ ICP)
- Ввод суммы для обмена
- Отображение ожидаемой суммы с учетом комиссии
- Ввод адреса получателя
- Выполнение обмена

### Дизайн
- Черно-фиолетовый градиентный фон
- Стеклянный эффект (glassmorphism)
- Анимации и переходы
- Адаптивный дизайн

## Деплой в ICP канистру

### Быстрый старт

1. **Инициализация dfx проекта**:
   ```bash
   npm run init-dfx
   ```

2. **Деплой в канистру**:
   ```bash
   npm run deploy
   ```

### Подробные инструкции

См. файл [DEPLOY.md](./DEPLOY.md) для подробных инструкций по деплою.

### Структура для деплоя

- `dfx.json` - конфигурация dfx
- `canister_ids.json` - ID канистры (заполните после деплоя)
- `scripts/deploy.sh` - скрипт автоматического деплоя
- `scripts/init-dfx.sh` - скрипт инициализации dfx
- `.dfxignore` - исключения для деплоя

## Лицензия

MIT 