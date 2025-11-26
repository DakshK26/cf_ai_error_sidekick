use wasm_bindgen::prelude::*;
use serde::Serialize;
use regex::Regex;

#[derive(Serialize)]
struct LogEntry {
    severity: String,
    message: String,
    timestamp: Option<String>,
    stack: Vec<String>,
    raw: String,
}

#[derive(Serialize)]
struct ParsedLog {
    entries: Vec<LogEntry>,
}

/// Parse raw log text into structured log entries
#[wasm_bindgen]
pub fn parse_log(input: &str) -> String {
    let entries = parse_log_internal(input);
    serde_json::to_string(&ParsedLog { entries })
        .unwrap_or_else(|_| r#"{"entries":[]}"#.to_string())
}

fn parse_log_internal(input: &str) -> Vec<LogEntry> {
    let mut entries = Vec::new();
    let lines: Vec<&str> = input.lines().collect();
    
    // Regex patterns for common log formats
    let timestamp_re = Regex::new(
        r"^\s*(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?|\[\d{2}/\w+/\d{4}:\d{2}:\d{2}:\d{2}[^\]]*\])"
    ).unwrap();
    
    let severity_re = Regex::new(
        r"(?i)\b(FATAL|ERROR|WARN|WARNING|INFO|DEBUG|TRACE|CRITICAL|SEVERE)\b"
    ).unwrap();
    
    let stack_trace_re = Regex::new(
        r"^\s+(at\s+|File\s+|Caused by:|Exception in thread|Traceback)"
    ).unwrap();
    
    let mut i = 0;
    while i < lines.len() {
        let line = lines[i];
        
        // Skip empty lines
        if line.trim().is_empty() {
            i += 1;
            continue;
        }
        
        // Check if this is a continuation of a stack trace
        if stack_trace_re.is_match(line) {
            // Attach to the previous entry if exists
            if let Some(last_entry) = entries.last_mut() {
                last_entry.stack.push(line.to_string());
            }
            i += 1;
            continue;
        }
        
        // Extract timestamp
        let timestamp = timestamp_re.find(line).map(|m| m.as_str().to_string());
        
        // Extract severity
        let severity = if let Some(caps) = severity_re.captures(line) {
            caps.get(1).unwrap().as_str().to_uppercase()
        } else {
            // Try to infer from keywords
            let lower = line.to_lowercase();
            if lower.contains("exception") || lower.contains("failed") || lower.contains("panic") {
                "ERROR".to_string()
            } else if lower.contains("warning") {
                "WARN".to_string()
            } else {
                "UNKNOWN".to_string()
            }
        };
        
        // Extract message (everything after timestamp and severity)
        let mut message = line.to_string();
        
        // Remove timestamp from message
        if let Some(ts_match) = timestamp_re.find(line) {
            message = message[ts_match.end()..].to_string();
        }
        
        // Remove severity from message if it appears
        if let Some(sev_match) = severity_re.find(&message) {
            let before = &message[..sev_match.start()];
            let after = &message[sev_match.end()..];
            message = format!("{}{}", before, after);
        }
        
        message = message.trim().to_string();
        
        // Collect stack trace lines
        let mut stack = Vec::new();
        let mut j = i + 1;
        while j < lines.len() && stack_trace_re.is_match(lines[j]) {
            stack.push(lines[j].to_string());
            j += 1;
        }
        
        entries.push(LogEntry {
            severity,
            message,
            timestamp,
            stack,
            raw: line.to_string(),
        });
        
        // Skip the stack trace lines we just processed
        i = j;
    }
    
    entries
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_error() {
        let input = "2024-11-26T10:30:45Z ERROR Failed to connect to database";
        let result = parse_log(input);
        assert!(result.contains("ERROR"));
        assert!(result.contains("Failed to connect to database"));
    }

    #[test]
    fn test_parse_with_stack_trace() {
        let input = r#"2024-11-26T10:30:45Z ERROR NullPointerException
    at com.example.App.main(App.java:42)
    at java.base/java.lang.Thread.run(Thread.java:834)"#;
        
        let result = parse_log(input);
        assert!(result.contains("ERROR"));
        assert!(result.contains("NullPointerException"));
        assert!(result.contains("at com.example.App.main"));
    }

    #[test]
    fn test_parse_multiple_severities() {
        let input = r#"INFO Application started
WARN Deprecated API usage
ERROR Connection failed"#;
        
        let result = parse_log(input);
        assert!(result.contains("INFO"));
        assert!(result.contains("WARN"));
        assert!(result.contains("ERROR"));
    }
}
