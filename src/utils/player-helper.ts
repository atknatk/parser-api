import { getTimezoneOffset } from 'date-fns-tz';


export function getPlayerPosition(index: number): string {
    // Helper function to determine player position based on formation index
    const positions = {
        0: 'GK',
        1: 'CB',
        2: 'CB',
        3: 'CB',
        4: 'LM',
        5: 'RM',
        6: 'CM',
        7: 'CM',
        8: 'CM',
        9: 'FW',
        10: 'FW'
    };
    return positions[index] || 'Unknown';
}


export function getMinuteFromPosition(backgroundPosition) {
    // X ve Y pozisyonlarını parse et
    const posMatch = backgroundPosition.match(/-(\d+)(?:px)?\s+-(\d+)(?:px)?/);
    if (!posMatch) return "";
    
    const x = parseInt(posMatch[1]);
    const y = parseInt(posMatch[2]);
    
    // 36px grid'e göre sütun ve satır hesapla
    const col = Math.floor(x / 36);
    const row = Math.floor(y / 36);
    
    // Dakikayı hesapla: (satır * 10) + (sütun + 1)
    const minute = (row * 10) + (col + 1);
    
    return minute.toString();
}
