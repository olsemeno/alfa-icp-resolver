use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::{caller, time};
use ic_cdk_macros::*;
use icrc_ledger_types::icrc1::transfer::BlockIndex;
use serde::{Serialize};
use std::collections::HashMap;
use std::cell::RefCell;
use sha2::{Sha256, Digest};
use hex;

// Подключаем модуль transfer_service
pub mod transfer_service;
pub use transfer_service::*;

// Структуры для HashedTimelock контракта
#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct Swap {
    pub sender: String,
    pub recipient: String,
    pub amount: u64,
    pub hashlock: String,
    pub timelock: u64,
    pub withdrawn: bool,
    pub refunded: bool,
    pub preimage: Option<String>,
    pub ledger_id: String, // Добавляем ID лэджера для трансферов
}

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct CreateSwapRequest {
    pub recipient: String,
    pub amount: u64,
    pub hashlock: String,
    pub timelock: u64,
    pub ledger_id: String, // Добавляем ID лэджера
}

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct WithdrawRequest {
    pub swap_id: String,
    pub preimage: String,
}

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct RefundRequest {
    pub swap_id: String,
}

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct SwapResponse {
    pub success: bool,
    pub message: String,
    pub swap_id: Option<String>,
    pub swap: Option<Swap>,
    pub transfer_result: Option<BlockIndex>, // Добавляем результат трансфера
}

// Глобальное хранилище свопов с использованием thread_local для безопасности
thread_local! {
    static SWAPS: RefCell<HashMap<String, Swap>> = RefCell::new(HashMap::new());
}

// Хелпер функции
fn generate_swap_id(sender: &str, hashlock: &str) -> String {
    format!("{}_{}", sender, hashlock)
}

fn sha256_hash(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}

fn verify_preimage(preimage: &str, hashlock: &str) -> bool {
    sha256_hash(preimage) == hashlock
}

// Валидация входных данных
fn validate_create_swap_request(request: &CreateSwapRequest) -> Result<(), String> {
    if request.recipient.is_empty() {
        return Err("Recipient cannot be empty".to_string());
    }
    
    if request.amount == 0 {
        return Err("Amount must be greater than 0".to_string());
    }
    
    if request.hashlock.is_empty() {
        return Err("Hashlock cannot be empty".to_string());
    }
    
    if request.hashlock.len() != 64 {
        return Err("Hashlock must be a valid SHA-256 hash (64 characters)".to_string());
    }
    
    let current_time = time();
    if request.timelock <= current_time {
        return Err("Timelock must be in the future".to_string());
    }
    
    Ok(())
}

// Основные функции HashedTimelock контракта
#[update]
pub fn create_swap(request: CreateSwapRequest) -> SwapResponse {
    let sender = caller().to_string();
    
    // Валидация запроса
    if let Err(error) = validate_create_swap_request(&request) {
        return SwapResponse {
            success: false,
            message: error,
            swap_id: None,
            swap: None,
            transfer_result: None,
        };
    }
    
    let swap_id = generate_swap_id(&sender, &request.hashlock);
    
    // Проверка существования свопа
    let swap_exists = SWAPS.with(|swaps| swaps.borrow().contains_key(&swap_id));
    if swap_exists {
        return SwapResponse {
            success: false,
            message: "Swap already exists".to_string(),
            swap_id: None,
            swap: None,
            transfer_result: None,
        };
    }
    
    let swap = Swap {
        sender: sender.clone(),
        recipient: request.recipient,
        amount: request.amount,
        hashlock: request.hashlock,
        timelock: request.timelock,
        withdrawn: false,
        refunded: false,
        preimage: None,
        ledger_id: request.ledger_id,
    };
    
    SWAPS.with(|swaps| swaps.borrow_mut().insert(swap_id.clone(), swap.clone()));
    
    SwapResponse {
        success: true,
        message: "Swap created successfully".to_string(),
        swap_id: Some(swap_id),
        swap: Some(swap),
        transfer_result: None,
    }
}

#[update]
pub async fn withdraw(request: WithdrawRequest) -> SwapResponse {
    // Сначала проверяем существование свопа

    let swap_data = SWAPS.with(|swaps| {
        let swaps_borrow = swaps.borrow();
        swaps_borrow.get(&request.swap_id).cloned()
    });

    if let Some(swap) = swap_data {
        // Проверка времени
        let current_time = time();
        if current_time >= swap.timelock {
            return SwapResponse {
                success: false,
                message: "Timelock has expired".to_string(),
                swap_id: None,
                swap: None,
                transfer_result: None,
            };
        }
        
        // Проверка получателя
        if caller().to_string() != swap.recipient {
            return SwapResponse {
                success: false,
                message: "Only recipient can withdraw".to_string(),
                swap_id: None,
                swap: None,
                transfer_result: None,
            };
        }
        
        // Проверка преимиджа
        if !verify_preimage(&request.preimage, &swap.hashlock) {
            return SwapResponse {
                success: false,
                message: "Invalid preimage".to_string(),
                swap_id: None,
                swap: None,
                transfer_result: None,
            };
        }
        
        // Проверка состояния
        if swap.withdrawn {
            return SwapResponse {
                success: false,
                message: "Already withdrawn".to_string(),
                swap_id: None,
                swap: None,
                transfer_result: None,
            };
        }
        
        if swap.refunded {
            return SwapResponse {
                success: false,
                message: "Already refunded".to_string(),
                swap_id: None,
                swap: None,
                transfer_result: None,
            };
        }
        
        // Выполняем трансфер
        let transfer_result = transfer_service::transfer_icrc1(
            Principal::from_text(swap.ledger_id.clone()).unwrap(),
            swap.amount,
            Principal::from_text(swap.recipient.clone()).unwrap(),
            None
        ).await;

        if let Ok((transfer_result, )) = transfer_result {
            if let TransferResult::Ok(block_index) = transfer_result {
                // Обновляем состояние свопа
                SWAPS.with(|swaps| {
                    let mut swaps_borrow = swaps.borrow_mut();
                    if let Some(swap_mut) = swaps_borrow.get_mut(&request.swap_id) {
                        swap_mut.withdrawn = true;
                        swap_mut.preimage = Some(request.preimage.clone());
                    }
                });

                return SwapResponse {
                    success: true,
                    message: "Withdrawal successful".to_string(),
                    swap_id: Some(request.swap_id.clone()),
                    swap: Some(swap),
                    transfer_result: Some(block_index),
                }
            } else {
                return SwapResponse {
                    success: false,
                    message: "Transfer failed".to_string(),
                    swap_id: None,
                    swap: None,
                    transfer_result: None,
                };
            }
        } else {
            return SwapResponse {
                success: false,
                message: "Transfer failed".to_string(),
                swap_id: None,
                swap: None,
                transfer_result: None,
            };
        }

      
    } else {
        SwapResponse {
            success: false,
            message: "Swap not found".to_string(),
            swap_id: None,
            swap: None,
            transfer_result: None,
        }
    }
}

#[update]
pub fn refund(request: RefundRequest) -> SwapResponse {
    let result = SWAPS.with(|swaps| {
        let mut swaps_borrow = swaps.borrow_mut();
        
        if let Some(swap) = swaps_borrow.get_mut(&request.swap_id) {
            // Проверка времени
            let current_time = time();
            if current_time < swap.timelock {
                return SwapResponse {
                    success: false,
                    message: "Timelock has not expired yet".to_string(),
                    swap_id: None,
                    swap: None,
                    transfer_result: None,
                };
            }
            
            // Проверка отправителя
            if caller().to_string() != swap.sender {
                return SwapResponse {
                    success: false,
                    message: "Only sender can refund".to_string(),
                    swap_id: None,
                    swap: None,
                    transfer_result: None,
                };
            }
            
            // Проверка состояния
            if swap.withdrawn {
                return SwapResponse {
                    success: false,
                    message: "Already withdrawn".to_string(),
                    swap_id: None,
                    swap: None,
                    transfer_result: None,
                };
            }
            
            if swap.refunded {
                return SwapResponse {
                    success: false,
                    message: "Already refunded".to_string(),
                    swap_id: None,
                    swap: None,
                    transfer_result: None,
                };
            }
            
            // Выполнение возврата
            swap.refunded = true;
            
            SwapResponse {
                success: true,
                message: "Refund successful".to_string(),
                swap_id: Some(request.swap_id.clone()),
                swap: Some(swap.clone()),
                transfer_result: None,
            }
        } else {
            SwapResponse {
                success: false,
                message: "Swap not found".to_string(),
                swap_id: None,
                swap: None,
                transfer_result: None,
            }
        }
    });
    
    result
}

// Query функции для получения информации
#[query]
pub fn get_swap(swap_id: String) -> Option<Swap> {
    SWAPS.with(|swaps| swaps.borrow().get(&swap_id).cloned())
}

#[query]
pub fn get_all_swaps() -> Vec<(String, Swap)> {
    SWAPS.with(|swaps| swaps.borrow().iter().map(|(k, v)| (k.clone(), v.clone())).collect())
}

#[query]
pub fn get_swaps_by_sender(sender: String) -> Vec<(String, Swap)> {
    SWAPS.with(|swaps| {
        swaps
            .borrow()
            .iter()
            .filter(|(_, swap)| swap.sender == sender)
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect()
    })
}

#[query]
pub fn get_swaps_by_recipient(recipient: String) -> Vec<(String, Swap)> {
    SWAPS.with(|swaps| {
        swaps
            .borrow()
            .iter()
            .filter(|(_, swap)| swap.recipient == recipient)
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect()
    })
}

#[query]
pub fn get_caller() -> String {
    caller().to_string()
}

#[query]
pub fn get_current_time() -> u64 {
    time()
}

#[query]
pub fn get_version() -> String {
    "1.0.0".to_string()
}

// Утилитарные функции
#[query]
pub fn hash_preimage(preimage: String) -> String {
    sha256_hash(&preimage)
}

#[query]
pub fn verify_preimage_hash(preimage: String, hashlock: String) -> bool {
    verify_preimage(&preimage, &hashlock)
}

// Дополнительные функции для мониторинга
#[query]
pub fn get_swap_count() -> u64 {
    SWAPS.with(|swaps| swaps.borrow().len() as u64)
}

#[query]
pub fn get_active_swaps() -> Vec<(String, Swap)> {
    SWAPS.with(|swaps| {
        swaps
            .borrow()
            .iter()
            .filter(|(_, swap)| !swap.withdrawn && !swap.refunded)
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect()
    })
}

#[query]
pub fn get_expired_swaps() -> Vec<(String, Swap)> {
    let current_time = time();
    SWAPS.with(|swaps| {
        swaps
            .borrow()
            .iter()
            .filter(|(_, swap)| current_time >= swap.timelock && !swap.withdrawn && !swap.refunded)
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect()
    })
} 