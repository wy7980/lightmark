#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use pulldown_cmark::{html, Options, Parser};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::State;
use tokio::sync::Mutex;

// 应用状态
#[derive(Default)]
pub struct AppState {
    pub current_file: Mutex<Option<PathBuf>>,
    pub auto_save: Mutex<bool>,
}

// 文件操作请求
#[derive(Debug, Deserialize)]
pub struct FileRequest {
    pub path: String,
}

// 文件内容响应
#[derive(Debug, Serialize)]
pub struct FileResponse {
    pub content: String,
    pub path: String,
}

// 解析结果
#[derive(Debug, Serialize)]
pub struct ParseResult {
    pub html: String,
    pub word_count: usize,
    pub char_count: usize,
}

// 懒加载解析器选项（性能优化）
lazy_static::lazy_static! {
    static ref MARKDOWN_OPTIONS: Options = {
        let mut options = Options::empty();
        options.insert(Options::ENABLE_TABLES);
        options.insert(Options::ENABLE_STRIKETHROUGH);
        options.insert(Options::ENABLE_TASKLISTS);
        options.insert(Options::ENABLE_HEADING_ATTRIBUTES);
        options
    };
}

// 打开文件
#[tauri::command]
async fn open_file(path: String) -> Result<FileResponse, String> {
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    Ok(FileResponse {
        content,
        path,
    })
}

// 保存文件
#[tauri::command]
async fn save_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(())
}

// 解析 Markdown（高性能版本）
#[tauri::command]
fn parse_markdown(content: String) -> Result<ParseResult, String> {
    // 统计字数
    let word_count = content.split_whitespace().count();
    let char_count = content.chars().count();
    
    // 解析 Markdown
    let parser = Parser::new_ext(&content, *MARKDOWN_OPTIONS);
    let mut html_output = String::with_capacity(content.len() * 2);
    html::push_html(&mut html_output, parser);
    
    Ok(ParseResult {
        html: html_output,
        word_count,
        char_count,
    })
}

// 增量解析（只解析变更部分）
#[tauri::command]
fn parse_markdown_incremental(
    old_content: String,
    new_content: String,
    old_html: String,
) -> Result<ParseResult, String> {
    // 如果内容相同，直接返回
    if old_content == new_content {
        return Ok(ParseResult {
            html: old_html,
            word_count: new_content.split_whitespace().count(),
            char_count: new_content.chars().count(),
        });
    }
    
    // 差异较大时全量解析
    if (new_content.len() as i64 - old_content.len() as i64).abs() > 1000 {
        return parse_markdown(new_content);
    }
    
    // 小改动时全量解析（简化实现）
    parse_markdown(new_content)
}

// 获取最近文件
#[tauri::command]
fn get_recent_files() -> Result<Vec<String>, String> {
    // TODO: 从配置文件读取
    Ok(vec![])
}

// 自动保存设置
#[tauri::command]
async fn set_auto_save(state: State<'_, AppState>, enabled: bool) {
    let mut auto_save = state.auto_save.lock().await;
    *auto_save = enabled;
}

fn main() {
    // 初始化日志
    #[cfg(debug_assertions)]
    {
        std::env::set_var("RUST_LOG", "debug");
    }
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            open_file,
            save_file,
            parse_markdown,
            parse_markdown_incremental,
            get_recent_files,
            set_auto_save,
        ])
        .run(tauri::generate_context!())
        .expect("error while running lightmark application");
}
