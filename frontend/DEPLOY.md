# Деплой в ICP Канистру

## Подготовка

1. **Установите dfx** (если еще не установлен):
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Настройте Identity**:
   ```bash
   dfx identity new my-identity
   dfx identity use my-identity
   ```

3. **Получите циклы для деплоя**:
   ```bash
   dfx ledger --network ic create-canister --amount 0.5
   ```

## Деплой

### Автоматический деплой
```bash
npm run deploy
```

### Ручной деплой

1. **Соберите проект**:
   ```bash
   npm run build
   ```

2. **Деплойте в канистру**:
   ```bash
   dfx deploy --network ic
   ```

3. **Получите ID канистры**:
   ```bash
   dfx canister --network ic id crypto-exchange-app
   ```

4. **Обновите canister_ids.json**:
   Замените `YOUR_CANISTER_ID_HERE` на полученный ID канистры.

## Доступ к приложению

После деплоя приложение будет доступно по адресу:
```
https://[CANISTER_ID].ic0.app
```

## Обновление

Для обновления приложения:
```bash
dfx deploy --network ic --upgrade-unchanged
```

## Локальная разработка

Для локальной разработки:
```bash
dfx start --clean
npm start
``` 