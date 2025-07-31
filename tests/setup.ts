import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// Глобальные переменные для тестов
declare global {
  var __TEST_MODE__: boolean;
  var __DFX_NETWORK__: string;
  var __CANISTER_ID__: string;
  var __LEDGER_ID__: string;
}

// Установка глобальных переменных
globalThis.__TEST_MODE__ = true;
globalThis.__DFX_NETWORK__ = 'local';

// Функция для запуска команды dfx
export function runDfxCommand(command: string): string {
  try {
    return execSync(`dfx ${command}`, { 
      encoding: 'utf8',
      cwd: process.cwd()
    });
  } catch (error) {
    console.error(`DFX command failed: ${command}`);
    throw error;
  }
}

// Функция для проверки, запущен ли dfx
export function isDfxRunning(): boolean {
  try {
    execSync('dfx ping', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Функция для получения ID кандисты
export function getCanisterId(canisterName: string): string {
  try {
    const output = runDfxCommand(`canister id ${canisterName}`);
    return output.trim();
  } catch (error) {
    console.error(`Failed to get canister ID for ${canisterName}`);
    throw error;
  }
}

// Функция для получения ID лэджера
export function getLedgerId(): string {
  try {
    const output = runDfxCommand('canister id ledger');
    return output.trim();
  } catch (error) {
    console.error('Failed to get ledger ID');
    throw error;
  }
}

// Функция для развертывания лэджера
export function deployLedger(): void {
  try {
    console.log('Deploying ICP ledger...');
    runDfxCommand('deploy ledger --argument \'(record { minting_account = "d46936bcaa8f3ffd87278bf2f4568d656a70e1713e2c705cc1ae9a9e387a6d49"; initial_values = vec {}; send_whitelist = vec {}; })\'');
    console.log('ICP ledger deployed successfully');
  } catch (error) {
    console.error('Failed to deploy ledger');
    throw error;
  }
}

// Функция для минтинга ICP токенов
export function mintICP(to: string, amount: string): void {
  try {
    console.log(`Minting ${amount} ICP to ${to}...`);
    runDfxCommand(`canister call ledger mint '(record { to = "${to}"; amount = ${amount}; })'`);
    console.log('ICP minted successfully');
  } catch (error) {
    console.error('Failed to mint ICP');
    throw error;
  }
}

// Функция для получения баланса
export function getBalance(account: string): string {
  try {
    
    const output = runDfxCommand(`canister call ledger icrc1_balance_of '(record { owner = principal "${account}"; })'`);
    return output.trim();
  } catch (error) {
    console.error('Failed to get balance');
    throw error;
  }
}

// Функция для развертывания нашего кандисты
export function deployResolver(): void {
  try {
    console.log('Deploying resolver canister...');
    runDfxCommand('deploy alfa_icp_resolver');
    console.log('Resolver canister deployed successfully');
  } catch (error) {
    console.error('Failed to deploy resolver');
    throw error;
  }
}

// Инициализация тестового окружения
beforeAll(async () => {
  console.log('Setting up test environment...');
  const ledgerScriptPath = join(__dirname, 'ledger.sh');

  // Проверяем, запущен ли dfx
  if (!isDfxRunning()) {
    console.log('Starting dfx...');
    runDfxCommand('start --background');
    
    // Ждем немного для запуска
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  // Развертываем лэджер
  if (!existsSync(ledgerScriptPath)) {
    throw new Error(`Ledger script not found at ${ledgerScriptPath}`);
  }

  console.log('Starting ledger deployment...');
  
  try {
    // Запускаем скрипт ledger.sh
    const result = execSync(`bash ${ledgerScriptPath}`, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('Ledger deployment output:', result);
    
    
  } catch (error) {
    console.error('Ledger deployment failed:', error);
    throw error;
  }
  
  // Развертываем наш кандисту
  deployResolver();
  
  // Получаем ID кандист
  globalThis.__CANISTER_ID__ = getCanisterId('alfa_icp_resolver');
  globalThis.__LEDGER_ID__ = getLedgerId();

  console.log(`Canister ID: ${globalThis.__CANISTER_ID__}`);
  console.log(`Ledger ID: ${globalThis.__LEDGER_ID__}`);
}, 60000); // 60 секунд таймаут

// Очистка после тестов
afterAll(async () => {
  console.log('Cleaning up test environment...');
  // Можно добавить очистку если нужно
}); 