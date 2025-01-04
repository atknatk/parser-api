import { getTimezoneOffset } from 'date-fns-tz';

export function parseDateTimeToUTC(dateStr: string, timeStr: string, timezone = 'UTC') {
try{
    
        // Parse the date components (assumes US date format MM/DD/YY)
        const [month, day, year] = dateStr.split('/').map(num => num.trim());
    
        // Parse the time components
        let [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(num => num.trim());
        
        // Convert to 24-hour format if PM
        if (period && period.toUpperCase() === 'PM' && hours !== '12') {
            hours = String(parseInt(hours) + 12);
        } else if (period && period.toUpperCase() === 'AM' && hours === '12') {
            hours = '00';
        }
        
        // Create date string in ISO format
        const fullYear = year?.length === 2 ? `20${year}` : year;
        const localDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`);
        
        // Get timezone offset in milliseconds
        const tzOffset = getTimezoneOffset(timezone, localDate);
        
        // Adjust the date by subtracting the timezone offset to get UTC
        const utcDate = new Date(localDate.getTime() - tzOffset);
        return utcDate;
}catch(error){
    return null;
}
    
    
}

